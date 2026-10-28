import { describe, expect, it } from 'vitest';
import {
  findDuplicateGroups,
  isAbsoluteHttpUrl,
  normalizeCompanyName,
  normalizeWebsite,
} from '@/lib/aiEmployee/normalize';
import { scoreLead } from '@/lib/aiEmployee/scoring';
import { buildOutreachDraft } from '@/lib/aiEmployee/outreach';
import { buildFunnel, followUpTasks } from '@/lib/aiEmployee/pipeline';
import { toCsv } from '@/lib/aiEmployee/csv';
import { parseDemoFlag, isDemoSessionConnected, setDemoSessionConnected } from '@/lib/aiEmployee/demoMode';
import { LEAD_STATUSES, OUTREACH_LANGUAGES, type ManufacturerLead } from '@/lib/aiEmployee/types';
import { SAMPLE_LEADS } from '@/data/aiEmployee/sampleLeads';

function lead(overrides: Partial<ManufacturerLead> = {}): ManufacturerLead {
  return {
    id: 'l-1',
    companyName: 'Acme Fabrics Pvt Ltd',
    country: 'India',
    city: null,
    productCategory: 'Cotton fabrics',
    website: 'https://www.acme-fabrics.test/',
    contactEmail: null,
    contactPhone: null,
    sourceUrl: 'https://acme-fabrics.test/about',
    researchDate: '2026-10-01',
    verification: 'verified',
    confidence: 'high',
    researchNotes: 'Lists cotton fabrics on its product page.',
    status: 'Qualified',
    isSample: false,
    ...overrides,
  };
}

describe('normalization', () => {
  it('strips legal suffixes, accents and punctuation from company names', () => {
    expect(normalizeCompanyName('Acme   Fabrics Pvt. Ltd.')).toBe('acme fabrics');
    expect(normalizeCompanyName('Café & Söhne GmbH')).toBe('cafe and sohne');
  });

  it('keeps non-Latin company names instead of erasing them', () => {
    expect(normalizeCompanyName('தமிழ் உற்பத்தி Pvt Ltd')).toBe('தமிழ் உற்பத்தி');
  });

  it('reduces websites to a bare host and rejects invalid input', () => {
    expect(normalizeWebsite('https://WWW.Acme-Fabrics.test/products?x=1')).toBe('acme-fabrics.test');
    expect(normalizeWebsite('acme-fabrics.test')).toBe('acme-fabrics.test');
    expect(normalizeWebsite('javascript:alert(1)')).toBeNull();
    expect(normalizeWebsite('localhost')).toBeNull();
    expect(normalizeWebsite('')).toBeNull();
    expect(normalizeWebsite(null)).toBeNull();
  });

  it('accepts only absolute http(s) URLs', () => {
    expect(isAbsoluteHttpUrl('https://example.test/register')).toBe(true);
    expect(isAbsoluteHttpUrl('/register')).toBe(false);
    expect(isAbsoluteHttpUrl('ftp://example.test')).toBe(false);
    expect(isAbsoluteHttpUrl(undefined)).toBe(false);
  });
});

describe('duplicate detection', () => {
  it('groups leads that share a website host, even with different names', () => {
    const a = lead({ id: 'a', companyName: 'Acme Fabrics', website: 'https://acme-fabrics.test' });
    const b = lead({ id: 'b', companyName: 'ACME Textiles Co', country: 'Brazil', website: 'http://www.acme-fabrics.test/shop' });
    const groups = findDuplicateGroups([a, b]);
    expect(groups).toEqual([{ key: 'acme-fabrics.test', reason: 'domain', leadIds: ['a', 'b'] }]);
  });

  it('groups same normalized name in the same country, but not across countries', () => {
    const a = lead({ id: 'a', companyName: 'Delta Steel Ltd', country: 'India', website: null });
    const b = lead({ id: 'b', companyName: 'Delta Steel', country: 'india', website: null });
    const c = lead({ id: 'c', companyName: 'Delta Steel', country: 'Vietnam', website: null });
    const groups = findDuplicateGroups([a, b, c]);
    expect(groups).toHaveLength(1);
    expect(groups[0].reason).toBe('name-and-country');
    expect(groups[0].leadIds).toEqual(['a', 'b']);
  });

  it('flags the bundled sample duplicate pair', () => {
    const ids = findDuplicateGroups(SAMPLE_LEADS).flatMap((g) => g.leadIds);
    expect(ids).toEqual(expect.arrayContaining(['sample-001', 'sample-002']));
  });
});

describe('lead scoring', () => {
  it('scores a complete, verified, non-duplicate lead at 100', () => {
    const result = scoreLead(lead(), new Set());
    expect(result.score).toBe(100);
    expect(result.missingFields).toEqual(['publicContact']);
  });

  it('lists missing fields instead of inventing them', () => {
    const result = scoreLead(lead({ website: null, sourceUrl: null, researchNotes: null, productCategory: null }), new Set());
    expect(result.missingFields).toEqual(expect.arrayContaining(['website', 'sourceUrl', 'productCategory', 'researchNotes']));
  });

  it('caps unverified leads at 60', () => {
    const result = scoreLead(lead({ verification: 'unverified' }), new Set());
    expect(result.score).toBe(60);
  });

  it('penalizes duplicates', () => {
    const unique = scoreLead(lead(), new Set());
    const dup = scoreLead(lead(), new Set(['l-1']));
    expect(dup.score).toBe(unique.score - 10);
  });
});

describe('outreach drafts', () => {
  const url = 'https://example.test/register';

  it('supports all five configured languages', () => {
    expect(OUTREACH_LANGUAGES.map((l) => l.code)).toEqual(['en', 'ta', 'hi', 'te', 'ml']);
    for (const { code } of OUTREACH_LANGUAGES) {
      const result = buildOutreachDraft(lead(), code, url);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.body).toContain('Acme Fabrics Pvt Ltd');
        expect(result.body).toContain(url);
        expect(result.body).not.toContain('{company}');
        expect(result.body).not.toContain('{registrationUrl}');
      }
    }
  });

  it('never promises buyers, orders or sales in English', () => {
    const result = buildOutreachDraft(lead(), 'en', url);
    if (!result.ok) throw new Error('expected draft');
    expect(result.body).toMatch(/does not guarantee buyers, orders or sales/);
  });

  it('refuses leads on the do-not-contact list', () => {
    const result = buildOutreachDraft(lead({ status: 'Do Not Contact' }), 'en', url);
    expect(result.ok).toBe(false);
  });

  it('refuses leads that are not qualified', () => {
    for (const status of LEAD_STATUSES.filter((s) => !['Qualified', 'Ready for Outreach', 'Do Not Contact'].includes(s))) {
      expect(buildOutreachDraft(lead({ status }), 'en', url).ok).toBe(false);
    }
  });

  it('requires an absolute https registration link', () => {
    expect(buildOutreachDraft(lead(), 'en', '/register').ok).toBe(false);
    expect(buildOutreachDraft(lead(), 'en', '').ok).toBe(false);
  });

  it('states when no source is on record instead of inventing one', () => {
    const result = buildOutreachDraft(lead({ sourceUrl: null }), 'en', url);
    if (!result.ok) throw new Error('expected draft');
    expect(result.sources[0]).toMatch(/No source URL on record/);
  });
});

describe('pipeline', () => {
  it('computes cumulative funnel counts and excludes not-interested leads', () => {
    const leads = [
      lead({ id: 'a', status: 'Interested' }),
      lead({ id: 'b', status: 'Registration Started' }),
      lead({ id: 'c', status: 'Contacted' }),
      lead({ id: 'd', status: 'Not Interested' }),
    ];
    const funnel = buildFunnel(leads, LEAD_STATUSES);
    expect(funnel.find((s) => s.stage === 'Contacted')?.reached).toBe(3);
    expect(funnel.find((s) => s.stage === 'Interested')?.reached).toBe(2);
    expect(funnel.find((s) => s.stage === 'Registration Started')?.reached).toBe(1);
    expect(funnel.find((s) => s.stage === 'Registered')?.reached).toBe(0);
    expect(funnel.find((s) => s.stage === 'Replied')?.conversionFromPrevious).toBeCloseTo(2 / 3);
  });

  it('marks interested and registration-in-progress follow-ups as high priority', () => {
    const tasks = followUpTasks([lead({ status: 'Interested' }), lead({ id: 'x', status: 'Contacted' }), lead({ id: 'y', status: 'New' })]);
    expect(tasks.map((t) => t.priority)).toEqual(['high', 'normal']);
  });
});

describe('CSV export', () => {
  it('neutralizes spreadsheet formula injection', () => {
    const csv = toCsv([{ name: '=HYPERLINK("https://x.test")' }, { name: '+1 555' }, { name: '@cmd' }], [
      { header: 'name', value: (r) => r.name },
    ]);
    expect(csv.split('\r\n')[1]).toBe(`"'=HYPERLINK(""https://x.test"")"`);
    expect(csv).toContain(`'+1 555`);
    expect(csv).toContain(`'@cmd`);
  });

  it('quotes commas and newlines', () => {
    const csv = toCsv([{ notes: 'a, b\nc' }], [{ header: 'notes', value: (r) => r.notes }]);
    expect(csv).toBe('notes\r\n"a, b\nc"');
  });
});

describe('demo mode gating', () => {
  it('is enabled only when the flag is exactly "true"', () => {
    expect(parseDemoFlag('true')).toBe(true);
    expect(parseDemoFlag('TRUE')).toBe(false);
    expect(parseDemoFlag('1')).toBe(false);
    expect(parseDemoFlag('')).toBe(false);
    expect(parseDemoFlag(undefined)).toBe(false);
  });

  it('stores disconnect state and reads it back', () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    };
    expect(isDemoSessionConnected(storage)).toBe(true);
    setDemoSessionConnected(false, storage);
    expect(isDemoSessionConnected(storage)).toBe(false);
    setDemoSessionConnected(true, storage);
    expect(isDemoSessionConnected(storage)).toBe(true);
  });

  it('treats unavailable storage as connected without throwing', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    expect(isDemoSessionConnected(broken as unknown as Storage)).toBe(true);
    expect(() => setDemoSessionConnected(false, null)).not.toThrow();
  });
});

describe('sample data integrity', () => {
  it('marks every bundled record as a sample with no source URL or contact details', () => {
    for (const sample of SAMPLE_LEADS) {
      expect(sample.isSample).toBe(true);
      expect(sample.sourceUrl).toBeNull();
      expect(sample.contactEmail).toBeNull();
      expect(sample.contactPhone).toBeNull();
      expect(sample.companyName).toMatch(/\(Demo\)|Sample/);
    }
  });
});
