import { describe, expect, it } from 'vitest';
import { summarizeStatusRows } from '@/lib/aiEmployee/neonSummary';

describe('summarizeStatusRows', () => {
  it('returns zero total for an empty table', () => {
    expect(summarizeStatusRows([])).toEqual({ total: 0, byStatus: {} });
  });

  it('sums per-status counts and total', () => {
    expect(
      summarizeStatusRows([
        { lead_status: 'discovered', count: 4 },
        { lead_status: 'verified', count: 2 },
      ]),
    ).toEqual({ total: 6, byStatus: { discovered: 4, verified: 2 } });
  });

  it('ignores invalid or negative counts instead of inventing totals', () => {
    expect(
      summarizeStatusRows([
        { lead_status: 'discovered', count: Number.NaN },
        { lead_status: 'verified', count: -3 },
        { lead_status: 'contacted', count: 2.7 },
      ]),
    ).toEqual({ total: 2, byStatus: { discovered: 0, verified: 0, contacted: 2 } });
  });
});
