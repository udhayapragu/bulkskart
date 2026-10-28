import { neon } from '@neondatabase/serverless';
import { summarizeStatusRows, type StatusCountRow } from '../../src/lib/aiEmployee/neonSummary';

/**
 * Read-only status counts for the AI Employee Preview.
 *
 * Fails closed: returns 404 unless the server-side flag AI_EMPLOYEE_PREVIEW_API=true is set,
 * and 503 unless DATABASE_URL is configured. It never returns lead rows and never writes.
 * Both variables are set only for the Preview environment.
 */
export const config = { runtime: 'edge' };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export default async function handler(request: Request): Promise<Response> {
  if (process.env.AI_EMPLOYEE_PREVIEW_API !== 'true') {
    return jsonResponse({ error: 'Not found' }, 404);
  }
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return jsonResponse({ error: 'Database is not configured for this environment.' }, 503);
  }

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql`SELECT lead_status, COUNT(*)::int AS count FROM manufacturer_leads GROUP BY lead_status`) as StatusCountRow[];
    return jsonResponse({ source: 'neon-preview', ...summarizeStatusRows(rows) });
  } catch {
    // Driver error text can include connection details, so it is not returned.
    return jsonResponse({ error: 'Database query failed.' }, 503);
  }
}
