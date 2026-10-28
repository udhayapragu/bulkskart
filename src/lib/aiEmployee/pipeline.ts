import type { LeadStatus, ManufacturerLead } from './types';

/** Ordered conversion stages. A lead "reaches" a stage when its status is at or past it. */
export const FUNNEL_STAGES: LeadStatus[] = [
  'Contacted',
  'Replied',
  'Interested',
  'Registration Started',
  'Registered',
  'Subscription Active',
];

const EXCLUDED_FROM_FUNNEL: LeadStatus[] = ['Not Interested', 'Do Not Contact'];

export interface FunnelStep {
  stage: LeadStatus;
  reached: number;
  /** Share of the previous stage that reached this one. Null when there is no base. */
  conversionFromPrevious: number | null;
}

export function buildFunnel(leads: ManufacturerLead[], statusOrder: readonly LeadStatus[]): FunnelStep[] {
  const indexOf = (status: LeadStatus) => statusOrder.indexOf(status);
  const eligible = leads.filter((lead) => !EXCLUDED_FROM_FUNNEL.includes(lead.status));

  return FUNNEL_STAGES.map((stage, i) => {
    const stageIndex = indexOf(stage);
    const reached = eligible.filter((lead) => indexOf(lead.status) >= stageIndex).length;
    const previous = i === 0 ? null : FUNNEL_STAGES[i - 1];
    const previousReached = previous
      ? eligible.filter((lead) => indexOf(lead.status) >= indexOf(previous)).length
      : null;
    return {
      stage,
      reached,
      conversionFromPrevious: previousReached ? reached / previousReached : null,
    };
  });
}

/** Leads that need a human follow-up. Interested or registration-in-progress leads are high priority. */
export function followUpTasks(leads: ManufacturerLead[]): Array<{ lead: ManufacturerLead; priority: 'high' | 'normal' }> {
  const active: LeadStatus[] = ['Contacted', 'Replied', 'Interested', 'Registration Started'];
  return leads
    .filter((lead) => active.includes(lead.status))
    .map((lead) => ({
      lead,
      priority: lead.status === 'Interested' || lead.status === 'Registration Started' ? 'high' : 'normal',
    }));
}

export function countByStatus(leads: ManufacturerLead[], statusOrder: readonly LeadStatus[]): Record<LeadStatus, number> {
  const counts = Object.fromEntries(statusOrder.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const lead of leads) counts[lead.status] += 1;
  return counts;
}
