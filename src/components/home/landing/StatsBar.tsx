import React from 'react';
import { FileText, Globe, Package, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Chip, LiveDot } from '@/components/home/landing/shared';
import type { LoadState } from '@/hooks/useHomepageData';
import { formatNumber, type MarketplaceOverview } from '@/lib/homepageData';

interface Metric {
  label: string;
  value: number;
  icon: LucideIcon;
}

/**
 * Live counts from the database. A figure that fails to load, or is zero, is hidden.
 * Nothing on this strip is hardcoded.
 */
export default function StatsBar({ overview }: { overview: LoadState<MarketplaceOverview> }) {
  const data = overview.data;

  if (!data && overview.loading) {
    return (
      <section aria-label="Live marketplace statistics" className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="h-[120px] animate-pulse rounded-2xl border border-border bg-card" />
      </section>
    );
  }
  if (!data) return null;

  const liveDeals =
    data.activeRequirements === null && data.liveAuctions === null
      ? null
      : (data.activeRequirements ?? 0) + (data.liveAuctions ?? 0);

  const candidates: Array<Metric | null> = [
    data.verifiedManufacturers === null
      ? null
      : { label: 'Verified Manufacturers', value: data.verifiedManufacturers, icon: ShieldCheck },
    data.activeProducts === null ? null : { label: 'Bulk Products', value: data.activeProducts, icon: Package },
    data.supplierCountries === null
      ? null
      : { label: 'Trade Countries', value: data.supplierCountries.length, icon: Globe },
    liveDeals === null ? null : { label: 'Live RFQs & Auctions', value: liveDeals, icon: FileText },
  ];
  const metrics = candidates.filter((metric): metric is Metric => metric !== null && metric.value > 0);
  if (metrics.length === 0) return null;

  return (
    <section aria-label="Live marketplace statistics" className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card/70 p-4 sm:p-5">
        <Chip tone="orange">
          <LiveDot className="text-primary" />
          Live B2B Marketplace
        </Chip>
        <dl className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-border">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 lg:px-6 lg:first:pl-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dd className="text-xl font-black tabular-nums leading-none text-foreground sm:text-2xl lg:text-[1.7rem]">
                  {formatNumber(value)}
                </dd>
                <dt className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
