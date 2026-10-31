import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin } from 'lucide-react';
import { artKindFor, CategoryArt } from '@/components/home/landing/Illustrations';
import {
  Chip, LiveDot, Rail, RailItem, SectionTitle, SkeletonRail, StateCard, TabPills,
} from '@/components/home/landing/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useCategoryTree, useLiveRequirements } from '@/hooks/useHomepageData';
import { formatDate, formatNumber, type LiveRequirement } from '@/lib/homepageData';

const COLS = 'sm:grid-cols-2 lg:grid-cols-3';

function RequirementCard({ requirement, signedIn }: { requirement: LiveRequirement; signedIn: boolean }) {
  const detailPath = `/requirement/${encodeURIComponent(requirement.routeId)}`;
  // Manufacturers reply from the RFQ page. Signed-out visitors sign in first, then return to it.
  const contactPath = signedIn ? detailPath : `/auth?tab=supplier&redirect=${encodeURIComponent(detailPath)}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {requirement.image ? (
          <img src={requirement.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <CategoryArt kind={artKindFor(requirement.categoryName ?? requirement.title)} className="h-full w-full" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {requirement.isUrgent && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">Urgent</span>
          )}
          {requirement.isNew && (
            <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">New</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-foreground">
          {requirement.title}
        </h3>
        <dl className="space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="w-[4.5rem] shrink-0 text-muted-foreground">Quantity:</dt>
            <dd className="font-semibold text-foreground">{requirement.quantity}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[4.5rem] shrink-0 text-muted-foreground">Buyer:</dt>
            <dd className="font-semibold">
              {requirement.buyerVerified ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Verified buyer
                </span>
              ) : (
                <span className="text-muted-foreground">Not verified</span>
              )}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[4.5rem] shrink-0 text-muted-foreground">Location:</dt>
            <dd className="flex min-w-0 items-center gap-1 font-semibold text-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{requirement.location ?? 'Not specified'}</span>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[4.5rem] shrink-0 text-muted-foreground">Posted:</dt>
            <dd className="font-semibold text-foreground">{formatDate(requirement.postedAt)}</dd>
          </div>
        </dl>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Link
            to={detailPath}
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background/40 text-sm font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-primary"
          >
            View Details
          </Link>
          <Link
            to={contactPath}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            Contact Buyer
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function LiveRequirements({ activeCount }: { activeCount: number | null }) {
  const { user } = useAuth();
  const tree = useCategoryTree();
  const [tab, setTab] = useState('all');

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All Categories' },
      ...(tree.data?.top.slice(0, 5).map((category) => ({ id: category.id, label: category.name })) ?? []),
    ],
    [tree.data],
  );
  const categoryIds = tab === 'all' || !tree.data ? null : [tab, ...(tree.data.childIds[tab] ?? [])];
  const requirements = useLiveRequirements(categoryIds);
  const items = requirements.data ?? [];

  return (
    <section aria-label="Live buying requirements" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="Live Buying Requirements"
        chip={
          activeCount && activeCount > 0 ? (
            <Chip tone="orange">
              <LiveDot className="text-primary" />
              {formatNumber(activeCount)} Active RFQs
            </Chip>
          ) : undefined
        }
        href="/requirements"
        linkLabel="View All RFQs"
      />

      {tabs.length > 1 && <TabPills items={tabs} value={tab} onChange={setTab} label="Filter requirements by category" />}

      {requirements.loading && !requirements.data ? (
        <SkeletonRail count={3} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" heightClass="h-96" />
      ) : requirements.failed ? (
        <StateCard message="Buying requirements could not be loaded right now." onRetry={requirements.retry} />
      ) : items.length === 0 ? (
        <StateCard
          message={
            tab === 'all'
              ? 'There are no active buying requirements right now.'
              : 'There are no active buying requirements in this category right now.'
          }
          actionHref="/post-requirement"
          actionLabel="Post a Requirement"
        />
      ) : (
        <Rail cols={COLS}>
          {items.map((requirement) => (
            <RailItem key={requirement.id}>
              <RequirementCard requirement={requirement} signedIn={Boolean(user)} />
            </RailItem>
          ))}
        </Rail>
      )}
    </section>
  );
}
