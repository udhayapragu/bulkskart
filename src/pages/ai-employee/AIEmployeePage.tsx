import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AIEmployeeWorkspace from '@/components/ai-employee/AIEmployeeWorkspace';
import { useAuth } from '@/contexts/AuthContext';
import { SAMPLE_LEADS } from '@/data/aiEmployee/sampleLeads';
import {
  AI_EMPLOYEE_DEMO_BUILD,
  isDemoSessionConnected,
  setDemoSessionConnected,
} from '@/lib/aiEmployee/demoMode';

/**
 * Route: /admin/ai-employee
 *
 * Demo build (VITE_AI_EMPLOYEE_DEMO=true): renders with sample data and no sign-in.
 * Every other build: requires a signed-in admin, and redirects everyone else to /auth.
 */
export default function AIEmployeePage() {
  if (AI_EMPLOYEE_DEMO_BUILD) return <DemoAIEmployee />;
  return <AdminAIEmployeeGate />;
}

function DemoAIEmployee() {
  const [connected, setConnected] = useState(() => isDemoSessionConnected());

  const disconnect = () => {
    setDemoSessionConnected(false);
    setConnected(false);
  };
  const reconnect = () => {
    setDemoSessionConnected(true);
    setConnected(true);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300">Preview / Demo Mode</p>
            <h1 className="text-2xl font-semibold text-white">Bulkskart AI Employee</h1>
            <p className="text-sm text-zinc-400">Sample data only. Nothing here is a real company, contact, registration, or payment.</p>
          </div>
          {connected ? (
            <Button type="button" variant="outline" onClick={disconnect}>Disconnect Demo Session</Button>
          ) : (
            <Button type="button" className="bg-violet-600 text-white hover:bg-violet-500" onClick={reconnect}>Reconnect Demo Session</Button>
          )}
        </header>

        {connected ? (
          <AIEmployeeWorkspace key="demo-session" initialLeads={SAMPLE_LEADS} />
        ) : (
          <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-8 text-center">
            <h2 className="text-lg font-semibold text-white">Demo session disconnected</h2>
            <p className="mt-2 text-sm text-zinc-400">Reconnect to resume exploring the sample dashboard. Your in-page edits are reset.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function AdminAIEmployeeGate() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <main className="p-8 text-sm text-zinc-400">Checking access…</main>;
  }
  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <h1 className="text-2xl font-semibold text-white">Bulkskart AI Employee</h1>
      <p className="mt-3 max-w-2xl text-sm text-zinc-400">
        Live data is not connected in this build. No manufacturer records are loaded and no actions
        can write to the database. The live connection requires an approved data migration and
        review before it is enabled.
      </p>
    </main>
  );
}
