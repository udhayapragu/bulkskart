import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  LEAD_STATUSES,
  OUTREACH_LANGUAGES,
  type LeadStatus,
  type ManufacturerLead,
  type OutreachLanguage,
} from '@/lib/aiEmployee/types';
import { duplicateLeadIds, findDuplicateGroups, normalizeWebsite } from '@/lib/aiEmployee/normalize';
import { scoreLead } from '@/lib/aiEmployee/scoring';
import { buildOutreachDraft, OUTREACH_ELIGIBLE_STATUSES } from '@/lib/aiEmployee/outreach';
import { buildFunnel, countByStatus, followUpTasks } from '@/lib/aiEmployee/pipeline';
import { toCsv, type CsvColumn } from '@/lib/aiEmployee/csv';

type TabId = 'overview' | 'leads' | 'research' | 'outreach' | 'pipeline' | 'settings';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'leads', label: 'Lead Explorer' },
  { id: 'research', label: 'Research' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'settings', label: 'Settings' },
];

const QUALIFIED_STATUSES: LeadStatus[] = [
  'Qualified', 'Ready for Outreach', 'Contacted', 'Replied', 'Interested',
  'Registration Started', 'Registered', 'Subscription Active',
];

const CSV_COLUMNS: CsvColumn<ManufacturerLead & { score: number; duplicate: boolean }>[] = [
  { header: 'Company', value: (l) => l.companyName },
  { header: 'Country', value: (l) => l.country },
  { header: 'City', value: (l) => l.city },
  { header: 'Product category', value: (l) => l.productCategory },
  { header: 'Website host', value: (l) => normalizeWebsite(l.website) },
  { header: 'Source URL', value: (l) => l.sourceUrl },
  { header: 'Research date', value: (l) => l.researchDate },
  { header: 'Verification', value: (l) => l.verification },
  { header: 'Confidence', value: (l) => l.confidence },
  { header: 'Status', value: (l) => l.status },
  { header: 'Score', value: (l) => l.score },
  { header: 'Possible duplicate', value: (l) => (l.duplicate ? 'yes' : 'no') },
  { header: 'Sample record', value: (l) => (l.isSample ? 'yes' : 'no') },
  { header: 'Research notes', value: (l) => l.researchNotes },
];

interface ResearchJob {
  id: string;
  countries: string[];
  categories: string[];
  target: number;
  status: 'queued' | 'paused' | 'cancelled';
  error: string;
}

interface AuditEntry {
  id: number;
  at: string;
  action: string;
  detail: string;
}

interface OutreachDraft {
  language: OutreachLanguage;
  registrationUrl: string;
  subject: string;
  body: string;
  sources: string[];
  approval: 'pending' | 'approved' | 'rejected';
}

const NO_RESEARCH_PROVIDER =
  'No authorized research provider is configured. Nothing was searched.';

export default function AIEmployeeWorkspace({ initialLeads }: { initialLeads: ManufacturerLead[] }) {
  const [tab, setTab] = useState<TabId>('overview');
  const [leads, setLeads] = useState<ManufacturerLead[]>(initialLeads);
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [drafts, setDrafts] = useState<Record<string, OutreachDraft>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [campaignLimit, setCampaignLimit] = useState(50);
  const [defaultLanguage, setDefaultLanguage] = useState<OutreachLanguage>('en');

  const log = (action: string, detail: string) =>
    setAudit((prev) => [{ id: Date.now() + Math.random(), at: new Date().toISOString(), action, detail }, ...prev].slice(0, 100));

  const duplicateIds = useMemo(() => duplicateLeadIds(leads), [leads]);
  const scores = useMemo(
    () => new Map(leads.map((lead) => [lead.id, scoreLead(lead, duplicateIds)])),
    [leads, duplicateIds],
  );
  const statusCounts = useMemo(() => countByStatus(leads, LEAD_STATUSES), [leads]);
  const funnel = useMemo(() => buildFunnel(leads, LEAD_STATUSES), [leads]);
  const reached = (stage: LeadStatus) => funnel.find((step) => step.stage === stage)?.reached ?? 0;

  const setLeadStatus = (id: string, status: LeadStatus) => {
    const lead = leads.find((l) => l.id === id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    log('lead.status', `${lead?.companyName ?? id} → ${status} (demo, not saved)`);
  };

  const updateDraft = (leadId: string, patch: Partial<OutreachDraft>) =>
    setDrafts((prev) => ({ ...prev, [leadId]: { ...prev[leadId], ...patch } }));

  return (
    <div className="space-y-6">
      <nav aria-label="AI Employee sections" className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-violet-600 text-white'
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Kpi label="Total leads" value={leads.length} />
            <Kpi label="Qualified manufacturers" value={leads.filter((l) => QUALIFIED_STATUSES.includes(l.status)).length} />
            <Kpi label="Pending research jobs" value={jobs.filter((j) => j.status === 'queued' || j.status === 'paused').length} />
            <Kpi label="Drafts awaiting approval" value={Object.values(drafts).filter((d) => d.approval === 'pending').length} />
            <Kpi label="Confirmed replies" value={reached('Replied')} />
            <Kpi label="Interested" value={reached('Interested')} />
            <Kpi label="Registration starts" value={reached('Registration Started')} />
            <Kpi label="Completed registrations" value={reached('Registered')} />
            <Kpi label="Verified subscriptions" value={reached('Subscription Active')} />
            <Kpi label="Possible duplicates" value={duplicateIds.size} />
          </div>
          <p className="text-sm text-zinc-400">
            All counts come from sample records and in-memory demo actions. No real registrations,
            payments, or replies exist in this session.
          </p>
        </section>
      )}

      {tab === 'leads' && (
        <LeadExplorer
          leads={leads}
          duplicateIds={duplicateIds}
          scores={scores}
          onStatusChange={setLeadStatus}
          onExported={(count) => log('leads.export', `Exported ${count} sample rows to CSV`)}
        />
      )}

      {tab === 'research' && (
        <ResearchWorkspace
          jobs={jobs}
          campaignLimit={campaignLimit}
          onCreate={(job) => {
            setJobs((prev) => [job, ...prev]);
            log('research.create', `Job ${job.id} queued (demo, not executed): ${job.countries.join(', ') || 'any country'} / target ${job.target}`);
          }}
          onJobAction={(id, action) => {
            setJobs((prev) =>
              prev.map((j) => (j.id === id ? { ...j, status: action === 'pause' ? 'paused' : action === 'resume' ? 'queued' : 'cancelled' } : j)),
            );
            log(`research.${action}`, `Job ${id}`);
          }}
        />
      )}

      {tab === 'outreach' && (
        <OutreachCenter
          leads={leads}
          drafts={drafts}
          defaultLanguage={defaultLanguage}
          onGenerate={(lead, language, registrationUrl) => {
            const result = buildOutreachDraft(lead, language, registrationUrl);
            if (!result.ok) {
              toast.error(result.reason);
              return;
            }
            setDrafts((prev) => ({
              ...prev,
              [lead.id]: { language, registrationUrl, subject: result.subject, body: result.body, sources: result.sources, approval: 'pending' },
            }));
            log('outreach.draft', `Draft for ${lead.companyName} (${language})`);
          }}
          onEditBody={(leadId, body) => updateDraft(leadId, { body })}
          onApproval={(lead, approval) => {
            updateDraft(lead.id, { approval });
            log(`outreach.${approval}`, `Draft for ${lead.companyName} (not sent)`);
          }}
          onDoNotContact={(lead) => {
            setLeadStatus(lead.id, 'Do Not Contact');
            setDrafts((prev) => {
              const next = { ...prev };
              delete next[lead.id];
              return next;
            });
          }}
        />
      )}

      {tab === 'pipeline' && (
        <PipelineView leads={leads} funnel={funnel} statusCounts={statusCounts} />
      )}

      {tab === 'settings' && (
        <SettingsView
          campaignLimit={campaignLimit}
          onCampaignLimitChange={setCampaignLimit}
          defaultLanguage={defaultLanguage}
          onDefaultLanguageChange={setDefaultLanguage}
          audit={audit}
        />
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="mb-3 text-base font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'gold' | 'warn' }) {
  const tones = {
    default: 'border-violet-400/30 bg-violet-500/10 text-violet-200',
    gold: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    warn: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  };
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs ${tones[tone]}`}>{children}</span>;
}

const inputClass =
  'w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500';

function LeadExplorer({
  leads,
  duplicateIds,
  scores,
  onStatusChange,
  onExported,
}: {
  leads: ManufacturerLead[];
  duplicateIds: Set<string>;
  scores: Map<string, { score: number; missingFields: string[] }>;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onExported: (count: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [minScore, setMinScore] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const countries = useMemo(() => [...new Set(leads.map((l) => l.country))].sort(), [leads]);
  const categories = useMemo(
    () => [...new Set(leads.map((l) => l.productCategory).filter((c): c is string => Boolean(c)))].sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = Number(minScore) || 0;
    return leads.filter((l) => {
      if (q && !`${l.companyName} ${l.website ?? ''} ${l.country}`.toLowerCase().includes(q)) return false;
      if (country && l.country !== country) return false;
      if (category && l.productCategory !== category) return false;
      if (status && l.status !== status) return false;
      if ((scores.get(l.id)?.score ?? 0) < min) return false;
      return true;
    });
  }, [leads, query, country, category, status, minScore, scores]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;
  const duplicateGroups = useMemo(() => findDuplicateGroups(leads), [leads]);

  const exportCsv = () => {
    const rows = filtered.map((l) => ({ ...l, score: scores.get(l.id)?.score ?? 0, duplicate: duplicateIds.has(l.id) }));
    const blob = new Blob([toCsv(rows, CSV_COLUMNS)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-employee-sample-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
    onExported(rows.length);
    toast.success(`Exported ${rows.length} sample rows`);
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-6">
        <Input className={inputClass} placeholder="Search name, website, country" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search leads" />
        <select className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country">
          <option value="">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input className={inputClass} type="number" min={0} max={100} placeholder="Min score" value={minScore} onChange={(e) => setMinScore(e.target.value)} aria-label="Minimum score" />
        <Button type="button" onClick={exportCsv} disabled={filtered.length === 0} className="bg-amber-500 text-black hover:bg-amber-400">
          Export CSV ({filtered.length})
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-x-auto rounded-xl border border-white/10 lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setSelectedId(l.id)}
                  className={`cursor-pointer border-t border-white/5 hover:bg-white/5 ${selectedId === l.id ? 'bg-violet-500/10' : ''}`}
                >
                  <td className="px-3 py-2 text-white">
                    {l.companyName}
                    {duplicateIds.has(l.id) && <span className="ml-2"><Pill tone="warn">duplicate?</Pill></span>}
                    {l.isSample && <span className="ml-2"><Pill tone="gold">sample</Pill></span>}
                  </td>
                  <td className="px-3 py-2 text-zinc-300">{l.country}</td>
                  <td className="px-3 py-2 text-zinc-300">{l.productCategory ?? 'Not found'}</td>
                  <td className="px-3 py-2 text-zinc-300">{scores.get(l.id)?.score ?? 0}</td>
                  <td className="px-3 py-2 text-zinc-300">{l.status}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-zinc-400">No leads match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <Panel title="Lead detail">
            {!selected && <p className="text-sm text-zinc-400">Select a lead to inspect its sources and notes.</p>}
            {selected && (
              <dl className="space-y-2 text-sm">
                <Field label="Company" value={selected.companyName} />
                <Field label="Country / city" value={`${selected.country}${selected.city ? ` / ${selected.city}` : ''}`} />
                <Field label="Website" value={normalizeWebsite(selected.website) ?? 'Not found'} />
                <Field label="Source URL" value={selected.sourceUrl ?? 'Not found (sample record)'} />
                <Field label="Public contact" value={selected.contactEmail || selected.contactPhone ? 'On record' : 'Not found'} />
                <Field label="Research date" value={selected.researchDate ?? 'Not found'} />
                <Field label="Verification / confidence" value={`${selected.verification} / ${selected.confidence}`} />
                <Field label="Score" value={String(scores.get(selected.id)?.score ?? 0)} />
                <Field label="Missing fields" value={(scores.get(selected.id)?.missingFields ?? []).join(', ') || 'None'} />
                <Field label="Research notes" value={selected.researchNotes ?? 'Not found'} />
                <div className="pt-2">
                  <label className="mb-1 block text-xs text-zinc-400" htmlFor="lead-status">Change status (demo only)</label>
                  <select
                    id="lead-status"
                    className={inputClass}
                    value={selected.status}
                    onChange={(e) => onStatusChange(selected.id, e.target.value as LeadStatus)}
                  >
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </dl>
            )}
          </Panel>

          <Panel title={`Duplicate review (${duplicateGroups.length})`}>
            {duplicateGroups.length === 0 && <p className="text-sm text-zinc-400">No duplicates detected.</p>}
            <ul className="space-y-2 text-sm">
              {duplicateGroups.map((g) => (
                <li key={`${g.reason}-${g.key}`} className="rounded-md border border-white/10 p-2">
                  <Pill tone="warn">{g.reason === 'domain' ? 'Same website host' : 'Same name and country'}</Pill>
                  <p className="mt-1 text-zinc-300">
                    {g.leadIds.map((id) => leads.find((l) => l.id === id)?.companyName).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className="break-words text-zinc-100">{value}</dd>
    </div>
  );
}

function ResearchWorkspace({
  jobs,
  campaignLimit,
  onCreate,
  onJobAction,
}: {
  jobs: ResearchJob[];
  campaignLimit: number;
  onCreate: (job: ResearchJob) => void;
  onJobAction: (id: string, action: 'pause' | 'resume' | 'cancel') => void;
}) {
  const [countries, setCountries] = useState('');
  const [categories, setCategories] = useState('');
  const [target, setTarget] = useState('20');

  const create = () => {
    const parsed = Math.floor(Number(target));
    if (!Number.isFinite(parsed) || parsed < 1) {
      toast.error('Lead target must be a whole number of at least 1.');
      return;
    }
    const clamped = Math.min(parsed, campaignLimit);
    onCreate({
      id: `job-${Date.now().toString(36)}`,
      countries: countries.split(',').map((s) => s.trim()).filter(Boolean),
      categories: categories.split(',').map((s) => s.trim()).filter(Boolean),
      target: clamped,
      status: 'queued',
      error: NO_RESEARCH_PROVIDER,
    });
    toast.success(clamped < parsed ? `Target capped to campaign limit (${campaignLimit}). Job queued in demo mode.` : 'Job queued in demo mode.');
  };

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Panel title="Create research job">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400" htmlFor="job-countries">Countries (comma separated)</label>
            <Input id="job-countries" className={inputClass} value={countries} onChange={(e) => setCountries(e.target.value)} placeholder="e.g. India, Vietnam" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400" htmlFor="job-categories">Product categories (comma separated)</label>
            <Input id="job-categories" className={inputClass} value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="e.g. spices, cotton fabrics" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400" htmlFor="job-target">Lead target (max {campaignLimit})</label>
            <Input id="job-target" className={inputClass} type="number" min={1} value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <Button type="button" onClick={create} className="w-full bg-violet-600 text-white hover:bg-violet-500">Queue job (demo)</Button>
          <p className="text-xs text-zinc-400">
            Jobs are queued in memory only. No live search runs until an authorized provider and budget are approved.
          </p>
        </div>
      </Panel>

      <Panel title="Jobs">
        {jobs.length === 0 && <p className="text-sm text-zinc-400">No jobs yet.</p>}
        <ul className="space-y-3">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-md border border-white/10 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-white">{j.countries.join(', ') || 'Any country'} · {j.categories.join(', ') || 'Any category'}</span>
                <Pill>{j.status}</Pill>
              </div>
              <p className="mt-1 text-zinc-400">Target {j.target} · Found 0 · {j.error}</p>
              <div className="mt-2 flex gap-2">
                {j.status === 'queued' && <Button size="sm" variant="outline" onClick={() => onJobAction(j.id, 'pause')}>Pause</Button>}
                {j.status === 'paused' && <Button size="sm" variant="outline" onClick={() => onJobAction(j.id, 'resume')}>Resume</Button>}
                {j.status !== 'cancelled' && <Button size="sm" variant="outline" onClick={() => onJobAction(j.id, 'cancel')}>Cancel</Button>}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Providers and budget">
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>Research providers: <Pill tone="gold">none configured</Pill></li>
          <li>Campaign lead limit: {campaignLimit}</li>
          <li>Per-job and daily budget: not set (requires approval)</li>
        </ul>
      </Panel>
    </section>
  );
}

function OutreachCenter({
  leads,
  drafts,
  defaultLanguage,
  onGenerate,
  onEditBody,
  onApproval,
  onDoNotContact,
}: {
  leads: ManufacturerLead[];
  drafts: Record<string, OutreachDraft>;
  defaultLanguage: OutreachLanguage;
  onGenerate: (lead: ManufacturerLead, language: OutreachLanguage, registrationUrl: string) => void;
  onEditBody: (leadId: string, body: string) => void;
  onApproval: (lead: ManufacturerLead, approval: 'approved' | 'rejected') => void;
  onDoNotContact: (lead: ManufacturerLead) => void;
}) {
  const eligible = leads.filter((l) => (OUTREACH_ELIGIBLE_STATUSES as readonly string[]).includes(l.status));
  const [selectedId, setSelectedId] = useState<string | null>(eligible[0]?.id ?? null);
  const [language, setLanguage] = useState<OutreachLanguage>(defaultLanguage);
  const [registrationUrl, setRegistrationUrl] = useState('');

  const lead = leads.find((l) => l.id === selectedId) ?? null;
  const draft = lead ? drafts[lead.id] : undefined;

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <Panel title={`Eligible leads (${eligible.length})`}>
        {eligible.length === 0 && <p className="text-sm text-zinc-400">No leads are qualified for outreach drafts yet.</p>}
        <ul className="space-y-2 text-sm">
          {eligible.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setSelectedId(l.id)}
                className={`w-full rounded-md border p-2 text-left ${selectedId === l.id ? 'border-violet-400 bg-violet-500/10' : 'border-white/10 hover:bg-white/5'}`}
              >
                <span className="text-white">{l.companyName}</span>
                <span className="block text-xs text-zinc-400">{l.country} · {l.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Draft">
        {!lead && <p className="text-sm text-zinc-400">Select a lead to draft a message.</p>}
        {lead && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-400" htmlFor="draft-language">Language</label>
                <select id="draft-language" className={inputClass} value={language} onChange={(e) => setLanguage(e.target.value as OutreachLanguage)}>
                  {OUTREACH_LANGUAGES.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400" htmlFor="draft-url">Registration link (https://)</label>
                <Input id="draft-url" className={inputClass} value={registrationUrl} onChange={(e) => setRegistrationUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => onGenerate(lead, language, registrationUrl)} className="bg-violet-600 text-white hover:bg-violet-500">
                Generate draft
              </Button>
              <Button type="button" variant="outline" onClick={() => onDoNotContact(lead)}>
                Mark Do Not Contact
              </Button>
            </div>

            {draft && (
              <>
                <p className="text-xs text-zinc-400">Subject: {draft.subject}</p>
                <Textarea
                  className="min-h-[260px] border-white/15 bg-zinc-950 text-zinc-100"
                  value={draft.body}
                  onChange={(e) => onEditBody(lead.id, e.target.value)}
                  aria-label="Draft message body"
                />
                <div>
                  <p className="text-xs text-zinc-400">Personalization sources</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-zinc-300">
                    {draft.sources.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                {draft.language !== 'en' && (
                  <p className="text-xs text-amber-200">Machine-drafted translation. Have a native speaker review before any real use.</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{draft.approval}</Pill>
                  <Button type="button" size="sm" onClick={() => onApproval(lead, 'approved')}>Approve (not sent)</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => onApproval(lead, 'rejected')}>Reject</Button>
                  <Button type="button" size="sm" disabled title="Sending is disabled: draft-only mode">Send (disabled)</Button>
                </div>
                <p className="text-xs text-zinc-400">Sending is disabled. Delivery and reply tracking require an approved messaging provider.</p>
              </>
            )}
          </div>
        )}
      </Panel>

      <Panel title="Drafts">
        <ul className="space-y-2 text-sm">
          {Object.entries(drafts).map(([id, d]) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="text-zinc-200">{leads.find((l) => l.id === id)?.companyName ?? id}</span>
              <Pill>{d.approval}</Pill>
            </li>
          ))}
          {Object.keys(drafts).length === 0 && <p className="text-sm text-zinc-400">No drafts yet.</p>}
        </ul>
      </Panel>
    </section>
  );
}

function PipelineView({
  leads,
  funnel,
  statusCounts,
}: {
  leads: ManufacturerLead[];
  funnel: ReturnType<typeof buildFunnel>;
  statusCounts: Record<LeadStatus, number>;
}) {
  const tasks = followUpTasks(leads);
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Panel title="Conversion funnel (sample data)">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-zinc-400">
            <tr><th className="py-2">Stage</th><th>Reached</th><th>From previous</th></tr>
          </thead>
          <tbody>
            {funnel.map((step) => (
              <tr key={step.stage} className="border-t border-white/5">
                <td className="py-2 text-white">{step.stage}</td>
                <td className="text-zinc-300">{step.reached}</td>
                <td className="text-zinc-300">
                  {step.conversionFromPrevious === null ? '—' : `${Math.round(step.conversionFromPrevious * 100)}%`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-zinc-400">Stages are cumulative. Not Interested and Do Not Contact leads are excluded.</p>
      </Panel>

      <Panel title="Leads by stage">
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {LEAD_STATUSES.map((s) => (
            <li key={s} className="flex justify-between rounded-md border border-white/10 px-2 py-1">
              <span className="text-zinc-300">{s}</span>
              <span className="text-white">{statusCounts[s]}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Follow-up tasks (${tasks.length})`}>
        {tasks.length === 0 && <p className="text-sm text-zinc-400">No follow-ups due.</p>}
        <ul className="space-y-2 text-sm">
          {tasks.map(({ lead, priority }) => (
            <li key={lead.id} className="flex items-center justify-between gap-2">
              <span className="text-zinc-200">{lead.companyName} · {lead.status}</span>
              {priority === 'high' ? <Pill tone="gold">assign to employee</Pill> : <Pill>follow up</Pill>}
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}

function SettingsView({
  campaignLimit,
  onCampaignLimitChange,
  defaultLanguage,
  onDefaultLanguageChange,
  audit,
}: {
  campaignLimit: number;
  onCampaignLimitChange: (n: number) => void;
  defaultLanguage: OutreachLanguage;
  onDefaultLanguageChange: (l: OutreachLanguage) => void;
  audit: AuditEntry[];
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Panel title="Campaign and language">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400" htmlFor="campaign-limit">Campaign lead limit (1–500)</label>
            <Input
              id="campaign-limit"
              className={inputClass}
              type="number"
              min={1}
              max={500}
              value={campaignLimit}
              onChange={(e) => {
                const n = Math.floor(Number(e.target.value));
                if (Number.isFinite(n)) onCampaignLimitChange(Math.min(500, Math.max(1, n)));
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400" htmlFor="default-language">Default outreach language</label>
            <select id="default-language" className={inputClass} value={defaultLanguage} onChange={(e) => onDefaultLanguageChange(e.target.value as OutreachLanguage)}>
              {OUTREACH_LANGUAGES.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </Panel>

      <Panel title="Integrations and access">
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>Research providers: none configured</li>
          <li>Messaging integration: none configured (drafts only)</li>
          <li>Demo mode flag: <code className="text-amber-200">VITE_AI_EMPLOYEE_DEMO</code> (build-time, Preview only)</li>
          <li>Production access: normal admin sign-in required</li>
        </ul>
      </Panel>

      <Panel title="Audit log (this session only)">
        {audit.length === 0 && <p className="text-sm text-zinc-400">No actions yet.</p>}
        <ul className="max-h-80 space-y-2 overflow-y-auto text-xs text-zinc-300">
          {audit.map((entry) => (
            <li key={entry.id} className="rounded-md border border-white/10 p-2">
              <span className="text-zinc-500">{new Date(entry.at).toLocaleTimeString()}</span> · <span className="text-violet-200">{entry.action}</span> · {entry.detail}
            </li>
          ))}
        </ul>
      </Panel>
    </section>
  );
}
