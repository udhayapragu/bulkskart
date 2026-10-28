import type { ManufacturerLead } from './types';

const LEGAL_SUFFIXES = new Set([
  'pvt', 'private', 'ltd', 'limited', 'llc', 'llp', 'inc', 'co', 'corp', 'corporation',
  'company', 'gmbh', 'sa', 'sarl', 'pte', 'plc', 'bv', 'srl',
]);

/** Lowercase, strip accents and punctuation, drop common legal suffixes. */
export function normalizeCompanyName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token && !LEGAL_SUFFIXES.has(token))
    .join(' ');
}

/** Returns the bare host (no scheme, no leading www.), or null when invalid. */
export function normalizeWebsite(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  return host.includes('.') ? host : null;
}

/** Accepts only absolute http(s) URLs, used for source and registration links. */
export function isAbsoluteHttpUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface DuplicateGroup {
  key: string;
  reason: 'domain' | 'name-and-country';
  leadIds: string[];
}

/** Groups leads that share a website host, or a normalized name within one country. */
export function findDuplicateGroups(leads: ManufacturerLead[]): DuplicateGroup[] {
  const byDomain = new Map<string, string[]>();
  const byName = new Map<string, string[]>();

  for (const lead of leads) {
    const domain = normalizeWebsite(lead.website);
    if (domain) pushTo(byDomain, domain, lead.id);

    const name = normalizeCompanyName(lead.companyName);
    if (name) pushTo(byName, `${name}|${lead.country.trim().toLowerCase()}`, lead.id);
  }

  const groups: DuplicateGroup[] = [];
  for (const [key, leadIds] of byDomain) {
    if (leadIds.length > 1) groups.push({ key, reason: 'domain', leadIds });
  }
  for (const [key, leadIds] of byName) {
    if (leadIds.length > 1) groups.push({ key, reason: 'name-and-country', leadIds });
  }
  return groups;
}

export function duplicateLeadIds(leads: ManufacturerLead[]): Set<string> {
  return new Set(findDuplicateGroups(leads).flatMap((group) => group.leadIds));
}

function pushTo(map: Map<string, string[]>, key: string, value: string) {
  const existing = map.get(key);
  if (existing) existing.push(value);
  else map.set(key, [value]);
}
