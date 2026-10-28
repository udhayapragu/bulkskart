/**
 * Login-free demo mode for the AI Employee admin area.
 *
 * Enabled only when the build sets VITE_AI_EMPLOYEE_DEMO=true, which must be
 * configured for Preview/demo environments only. Any other value, including an
 * unset variable, keeps the normal authenticated admin gate.
 *
 * This flag is not a security boundary for data. Demo mode renders bundled
 * sample records and never imports or calls Supabase, so it cannot expose
 * production rows.
 */

const DEMO_DISCONNECTED_KEY = 'bulkskart.aiEmployee.demoDisconnected';

/** Pure parser, kept separate so tests can cover it without touching build-time env. */
export function parseDemoFlag(value: unknown): boolean {
  return value === 'true';
}

/**
 * Read directly from import.meta.env so Vite replaces it with a literal at build time.
 * Production builds then fold this to false and drop the demo branch entirely.
 */
export const AI_EMPLOYEE_DEMO_BUILD = import.meta.env.VITE_AI_EMPLOYEE_DEMO === 'true';

/** Storage is read and written defensively; private windows can throw. */
export function isDemoSessionConnected(storage: Pick<Storage, 'getItem'> | null = safeSessionStorage()): boolean {
  try {
    return storage?.getItem(DEMO_DISCONNECTED_KEY) !== '1';
  } catch {
    return true;
  }
}

export function setDemoSessionConnected(
  connected: boolean,
  storage: Pick<Storage, 'setItem' | 'removeItem'> | null = safeSessionStorage(),
): void {
  try {
    if (connected) storage?.removeItem(DEMO_DISCONNECTED_KEY);
    else storage?.setItem(DEMO_DISCONNECTED_KEY, '1');
  } catch {
    // Storage unavailable: the session state simply stays in memory.
  }
}

function safeSessionStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}
