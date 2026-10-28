import { describe, expect, it } from 'vitest';
import { MAX_IMPORT_ROWS, parseCsv, validateLeadImport } from '@/lib/aiEmployee/leadImport';
import type { ManufacturerLead } from '@/lib/aiEmployee/types';

const HEADER = 'company_name,country,website,source_url,product_category,confidence';

const existing: ManufacturerLead[] = [
  {
    id: 'e-1',
    companyName: 'Orchid Spices Pvt Ltd',
    country: 'India',
    city: null,
    productCategory: 'Spices',
    website: 'https://orchid-spices.test',
    contactEmail: null,
    contactPhone: null,
    sourceUrl: 'https://orchid-spices.test/about',
    researchDate: '2026-10-01',
    verification: 'verified',
    confidence: 'high',
    researchNotes: null,
    status: 'Qualified',
    isSample: false,
  },
];

describe('parseCsv', () => {
  it('handles quoted commas, escaped quotes, CRLF and blank lines', () => {
    const rows = parseCsv('a,b\r\n"x, y","say ""hi"""\r\n\r\n3,4');
    expect(rows).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['3', '4'],
    ]);
  });
});

describe('validateLeadImport', () => {
  it('accepts a valid public-source row as unverified and status New', () => {
    const csv = `${HEADER}\nBlue Loom Textiles,India,https://blueloom.test,https://blueloom.test/products,Cotton fabrics,medium`;
    const result = validateLeadImport(csv, existing);
    expect(result.error).toBeNull();
    expect(result.accepted).toHaveLength(1);
    const lead = result.accepted[0];
    expect(lead.verification).toBe('unverified');
    expect(lead.status).toBe('New');
    expect(lead.isSample).toBe(false);
    expect(lead.sourceUrl).toBe('https://blueloom.test/products');
    expect(lead.confidence).toBe('medium');
  });

  it('rejects rows without a source URL and never invents one', () => {
    const csv = `${HEADER}\nNo Source Co,India,,,Spices,high\nBad Source Co,India,,ftp://x.test,Spices,high`;
    const result = validateLeadImport(csv, []);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected.map((r) => r.reason)).toEqual([
      'A full https:// source URL is required for every lead.',
      'A full https:// source URL is required for every lead.',
    ]);
  });

  it('rejects rows missing company name or country', () => {
    const csv = `${HEADER}\n,India,,https://a.test/x,,low\nNamed Co,,,https://b.test/x,,low`;
    const result = validateLeadImport(csv, []);
    expect(result.rejected.map((r) => r.reason)).toEqual(['Company name is required.', 'Country is required.']);
  });

  it('skips duplicates of existing leads by website host', () => {
    const csv = `${HEADER}\nOrchid Trading,India,https://www.orchid-spices.test/shop,https://orchid-spices.test/shop,Spices,low`;
    const result = validateLeadImport(csv, existing);
    expect(result.accepted).toHaveLength(0);
    expect(result.duplicates[0].matchesId).toBe('e-1');
  });

  it('skips duplicates within the same batch', () => {
    const csv = [
      HEADER,
      'Delta Mills,India,https://delta-mills.test,https://delta-mills.test/a,Cotton,low',
      'Delta Mills Pvt Ltd,India,,https://delta-mills.test/b,Cotton,low',
    ].join('\n');
    const result = validateLeadImport(csv, []);
    expect(result.accepted).toHaveLength(1);
    expect(result.duplicates).toHaveLength(1);
  });

  it('rejects a missing required column with a clear message', () => {
    const result = validateLeadImport('company_name,country\nX,Y', []);
    expect(result.error).toMatch(/source_url/);
  });

  it('requires a header and at least one data row', () => {
    expect(validateLeadImport('', []).error).toBeTruthy();
    expect(validateLeadImport(HEADER, []).error).toBeTruthy();
  });

  it('caps batch size', () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, i) => `Co ${i},India,,https://co${i}.test/p,,low`);
    const result = validateLeadImport([HEADER, ...rows].join('\n'), []);
    expect(result.error).toMatch(/limited/);
  });

  it('treats unknown confidence values as low', () => {
    const csv = `${HEADER}\nOdd Confidence Co,India,,https://odd.test/p,,very sure`;
    expect(validateLeadImport(csv, []).accepted[0].confidence).toBe('low');
  });
});
