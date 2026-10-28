export interface StatusCountRow {
  lead_status: string;
  count: number;
}

export interface NeonLeadSummary {
  total: number;
  byStatus: Record<string, number>;
}

/**
 * Aggregates per-status counts from the database. Only counts leave the server, never lead rows,
 * so the login-free Preview cannot expose manufacturer records.
 */
export function summarizeStatusRows(rows: StatusCountRow[]): NeonLeadSummary {
  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    const count = Number.isFinite(row.count) && row.count > 0 ? Math.floor(row.count) : 0;
    byStatus[row.lead_status] = (byStatus[row.lead_status] ?? 0) + count;
    total += count;
  }
  return { total, byStatus };
}
