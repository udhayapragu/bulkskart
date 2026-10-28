import { isAbsoluteHttpUrl, normalizeCompanyName, normalizeWebsite } from './normalize';
import { LEAD_STATUSES, type ConfidenceLevel, type ManufacturerLead } from './types';

export const MAX_IMPORT_ROWS = 500;

export const REQUIRED_IMPORT_COLUMNS = ['company_name', 'country', 'source_url'] as const;

/**
 * Minimal RFC 4180 parser: quoted fields, doubled quotes, CRLF or LF line endings.
 * Returns rows of raw cell strings. Blank lines are skipped.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

export interface RejectedRow {
  line: number;
  companyName: string;
  reason: string;
}

export interface LeadImportResult {
  accepted: ManufacturerLead[];
  rejected: RejectedRow[];
  duplicates: Array<{ line: number; companyName: string; matchesId: string }>;
  error: string | null;
}

/**
 * Validates public-source rows. Every accepted lead is imported as "unverified" with status "New",
 * because a person must check the source before any lead is qualified.
 * Nothing is persisted here: the caller decides what to do with accepted rows.
 */
export function validateLeadImport(text: string, existing: ManufacturerLead[]): LeadImportResult {
  const table = parseCsv(text);
  if (table.length < 2) {
    return { accepted: [], rejected: [], duplicates: [], error: 'Paste a header row and at least one data row.' };
  }

  const headers = table[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const missing = REQUIRED_IMPORT_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    return { accepted: [], rejected: [], duplicates: [], error: `Missing required column(s): ${missing.join(', ')}.` };
  }
  const dataRows = table.slice(1);
  if (dataRows.length > MAX_IMPORT_ROWS) {
    return { accepted: [], rejected: [], duplicates: [], error: `Import is limited to ${MAX_IMPORT_ROWS} rows per batch.` };
  }

  const get = (cells: string[], name: string) => {
    const idx = headers.indexOf(name);
    return idx === -1 ? '' : (cells[idx] ?? '').trim();
  };

  const rejected: RejectedRow[] = [];
  const candidates: ManufacturerLead[] = [];
  const lineOf = new Map<string, number>();

  dataRows.forEach((cells, index) => {
    const line = index + 2;
    const companyName = get(cells, 'company_name');
    const country = get(cells, 'country');
    const sourceUrl = get(cells, 'source_url');
    const website = get(cells, 'website');
    const confidenceRaw = get(cells, 'confidence').toLowerCase();

    const fail = (reason: string) => rejected.push({ line, companyName: companyName || '(blank)', reason });

    if (!companyName) return fail('Company name is required.');
    if (!country) return fail('Country is required.');
    if (!isAbsoluteHttpUrl(sourceUrl)) return fail('A full https:// source URL is required for every lead.');
    if (website && !normalizeWebsite(website)) return fail('Website is not a valid address.');

    const confidence: ConfidenceLevel = confidenceRaw === 'high' || confidenceRaw === 'medium' ? confidenceRaw : 'low';
    const id = `import-${line}`;
    lineOf.set(id, line);
    candidates.push({
      id,
      companyName,
      country,
      city: get(cells, 'city') || null,
      productCategory: get(cells, 'product_category') || null,
      website: website || null,
      contactEmail: null,
      contactPhone: null,
      sourceUrl,
      researchDate: get(cells, 'research_date') || null,
      verification: 'unverified',
      confidence,
      researchNotes: get(cells, 'research_notes') || null,
      status: LEAD_STATUSES[0],
      isSample: false,
    });
  });

  // Rows are checked in order. The first copy of a company is kept; later copies are skipped
  // when they match an existing lead or a row already accepted in this batch.
  const duplicates: LeadImportResult['duplicates'] = [];
  const accepted: ManufacturerLead[] = [];
  for (const candidate of candidates) {
    const match = [...existing, ...accepted].find((l) => isSameCompany(l, candidate));
    if (match) {
      duplicates.push({ line: lineOf.get(candidate.id) ?? 0, companyName: candidate.companyName, matchesId: match.id });
    } else {
      accepted.push(candidate);
    }
  }

  return { accepted, rejected, duplicates, error: null };
}

/** Same rules as findDuplicateGroups: same website host, or same normalized name in the same country. */
function isSameCompany(a: ManufacturerLead, b: ManufacturerLead): boolean {
  const domainA = normalizeWebsite(a.website);
  const domainB = normalizeWebsite(b.website);
  if (domainA && domainB && domainA === domainB) return true;
  const nameA = normalizeCompanyName(a.companyName);
  const nameB = normalizeCompanyName(b.companyName);
  return nameA !== '' && nameA === nameB && a.country.trim().toLowerCase() === b.country.trim().toLowerCase();
}
