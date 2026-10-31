import React, { useEffect, useState } from 'react';
import { BadgeCheck, Gavel, MessageSquare, Scale, Truck } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import { supabase } from '@/db/supabase';

interface PlatformStat {
  label: string;
  value: number;
}

const BENEFITS = [
  {
    icon: Truck,
    title: 'Free delivery on every order',
    body: 'No delivery fee is added at checkout, for any order value or product category.',
  },
  {
    icon: BadgeCheck,
    title: 'Documented supplier checks',
    body: 'Manufacturers submit GST, IEC and registration documents for review before they are marked verified.',
  },
  {
    icon: Scale,
    title: 'Compare quotations',
    body: 'Post one requirement and compare every quotation you receive in one place.',
  },
  {
    icon: Gavel,
    title: 'Forward and reverse auctions',
    body: 'Sell in bulk with forward auctions, or source with reverse auctions.',
  },
  {
    icon: MessageSquare,
    title: 'Direct negotiation',
    body: 'Message suppliers to agree specifications, quantities and terms.',
  },
];

/** Counts a table with a HEAD request. Returns null when the query fails or is blocked. */
async function countRows(table: string, apply: (query: any) => any): Promise<number | null> {
  try {
    const { count, error } = await apply(supabase.from(table).select('id', { count: 'exact', head: true }));
    return error || typeof count !== 'number' ? null : count;
  } catch {
    return null;
  }
}

export default function PlatformProof() {
  const [stats, setStats] = useState<PlatformStat[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      countRows('companies', (q) => q.eq('verification_status', 'verified')),
      countRows('products', (q) => q.eq('is_active', true)),
      countRows('categories', (q) => q.eq('is_active', true)),
      countRows('requirements', (q) => q.eq('status', 'active')),
    ]).then(([manufacturers, products, categories, requirements]) => {
      if (!active) return;
      // Only real, non-zero counts are shown. Otherwise the benefits below stand alone.
      setStats(
        [
          { label: 'Verified manufacturers', value: manufacturers ?? 0 },
          { label: 'Active products', value: products ?? 0 },
          { label: 'Product categories', value: categories ?? 0 },
          { label: 'Open requirements', value: requirements ?? 0 },
        ].filter((s) => s.value > 0),
      );
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        {stats.length > 0 && (
          <dl className="mb-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-6">
                <dt className="text-sm text-muted-foreground">{s.label}</dt>
                <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {s.value.toLocaleString('en-IN')}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <SectionHeader
          eyebrow="Why trade on BulkSkart"
          title="Built for bulk trade"
          subtitle="The tools manufacturers and bulk buyers use every day, in one marketplace."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
