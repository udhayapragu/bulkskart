import { isAbsoluteHttpUrl, normalizeWebsite } from './normalize';
import type { ManufacturerLead } from './types';

export interface LeadScore {
  score: number;
  missingFields: string[];
}

/** Scores how complete and checkable a lead is. This is a heuristic, not a quality guarantee. */
export function scoreLead(lead: ManufacturerLead, duplicateIds: Set<string>): LeadScore {
  const missingFields: string[] = [];
  let score = 0;

  if (normalizeWebsite(lead.website)) score += 25;
  else missingFields.push('website');

  if (isAbsoluteHttpUrl(lead.sourceUrl)) score += 20;
  else missingFields.push('sourceUrl');

  if (lead.productCategory?.trim()) score += 15;
  else missingFields.push('productCategory');

  if (lead.country.trim()) score += 10;
  else missingFields.push('country');

  if (lead.researchNotes?.trim()) score += 10;
  else missingFields.push('researchNotes');

  if (lead.confidence === 'high') score += 10;
  else if (lead.confidence === 'medium') score += 5;

  if (!duplicateIds.has(lead.id)) score += 10;

  if (!lead.contactEmail && !lead.contactPhone) missingFields.push('publicContact');

  // A lead that has not been verified against its source cannot look fully qualified.
  if (lead.verification !== 'verified') score = Math.min(score, 60);

  return { score: Math.min(score, 100), missingFields };
}
