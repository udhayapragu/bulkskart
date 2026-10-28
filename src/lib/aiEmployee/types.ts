export const LEAD_STATUSES = [
  'New',
  'Researching',
  'Qualified',
  'Needs Review',
  'Ready for Outreach',
  'Contacted',
  'Replied',
  'Interested',
  'Registration Started',
  'Registered',
  'Subscription Active',
  'Not Interested',
  'Do Not Contact',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const OUTREACH_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'hi', label: 'Hindi' },
  { code: 'te', label: 'Telugu' },
  { code: 'ml', label: 'Malayalam' },
] as const;

export type OutreachLanguage = (typeof OUTREACH_LANGUAGES)[number]['code'];

export type VerificationStatus = 'verified' | 'unverified' | 'sample';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** A manufacturer lead. Missing values are null, never invented. */
export interface ManufacturerLead {
  id: string;
  companyName: string;
  country: string;
  city: string | null;
  productCategory: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  /** Public page the facts were taken from. Null when no source is on record. */
  sourceUrl: string | null;
  researchDate: string | null;
  verification: VerificationStatus;
  confidence: ConfidenceLevel;
  researchNotes: string | null;
  status: LeadStatus;
  /** True for bundled demo records. These are not real companies. */
  isSample: boolean;
}
