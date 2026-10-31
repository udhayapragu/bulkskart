import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { CategoryArt } from '@/components/home/landing/Illustrations';
import {
  Chip, LiveDot, Rail, RailItem, SectionTitle, SkeletonRail, StateCard, TabPills,
} from '@/components/home/landing/shared';
import { useAuctions } from '@/hooks/useHomepageData';
import { useNow } from '@/hooks/useNow';
import { type AuctionTab, formatCountdown, formatMoney, formatNumber, type HomeAuction } from '@/lib/homepageData';
import { cn } from '@/lib/utils';

const COLS = 'sm:grid-cols-2 lg:grid-cols-3';

const TABS: ReadonlyArray<{ id: AuctionTab; label: string }> = [
  { id: 'live', label: 'Live Auctions' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'reverse', label: 'Reverse Auctions' },
  { id: 'ended', label: 'Ended Auctions' },
];

const EMPTY_MESSAGES: Record<AuctionTab, string> = {
  live: 'There are no live auctions at the moment.',
  upcoming: 'There are no upcoming auctions scheduled.',
  reverse: 'There are no open reverse auctions right now.',
  ended: 'There are no ended auctions to show yet.',
};

function timerLabel(auction: HomeAuction, now: number): string {
  if (auction.phase === 'ended') return 'Ended';
  if (auction.phase === 'upcoming') {
    const start = auction.startTime ? new Date(auction.startTime).getTime() : null;
    return start && start > now ? `Starts in ${formatCountdown(start - now)}` : 'Starting soon';
  }
  return formatCountdown(new Date(auction.endTime).getTime() - now);
}

function AuctionCard({ auction, now }: { auction: HomeAuction; now: number }) {
  const hasBid = auction.currentBid !== null && auction.currentBid > 0;
  const price = hasBid ? auction.currentBid : auction.startingPrice;
  const priceLabel = hasBid ? 'Current Bid' : 'Starting Price';
  const detailPath = `/auctions/${auction.type}/${encodeURIComponent(auction.id)}`;
  const isOpen = auction.phase === 'live' || auction.phase === 'closing_soon';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {auction.image ? (
          <img src={auction.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <CategoryArt kind="generic" className="h-full w-full" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold',
              auction.phase === 'live' && 'bg-red-600 text-white',
              auction.phase === 'closing_soon' && 'bg-amber-400 text-black',
              auction.phase === 'upcoming' && 'bg-sky-500 text-white',
              auction.phase === 'ended' && 'bg-slate-600 text-white',
            )}
          >
            {auction.phase === 'live' && <LiveDot className="text-white" />}
            {auction.phase === 'live' && 'Live'}
            {auction.phase === 'closing_soon' && 'Closing soon'}
            {auction.phase === 'upcoming' && 'Upcoming'}
            {auction.phase === 'ended' && 'Ended'}
          </span>
          <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            {auction.type === 'forward' ? 'Forward' : 'Reverse'}
          </span>
        </div>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-bold tabular-nums text-white">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {timerLabel(auction, now)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-snug text-foreground">{auction.title}</h3>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{priceLabel}</p>
            <p className="text-xl font-black leading-tight text-primary">
              {price === null ? 'Not set' : formatMoney(price, 'INR')}
            </p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {formatNumber(auction.totalBids)} {auction.totalBids === 1 ? 'Bid' : 'Bids'}
          </p>
        </div>
        {auction.quantityLabel && <p className="text-xs text-muted-foreground">Quantity: {auction.quantityLabel}</p>}
        <Link
          to={detailPath}
          className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          {isOpen ? 'Place Bid' : 'View Auction'}
        </Link>
      </div>
    </article>
  );
}

export default function LiveAuctions({ liveCount }: { liveCount: number | null }) {
  const [tab, setTab] = useState<AuctionTab>('live');
  const auctions = useAuctions(tab);
  const now = useNow(1000);
  const items = auctions.data ?? [];

  return (
    <section aria-label="Live auctions" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="Live Auctions & Bulk Deals"
        chip={
          liveCount && liveCount > 0 ? (
            <Chip tone="red">
              <LiveDot className="text-red-400" />
              LIVE · {formatNumber(liveCount)} {liveCount === 1 ? 'auction' : 'auctions'}
            </Chip>
          ) : undefined
        }
        href="/auctions"
        linkLabel="View All Auctions"
      />

      <TabPills items={TABS} value={tab} onChange={setTab} label="Filter auctions" />

      {auctions.loading && !auctions.data ? (
        <SkeletonRail count={3} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" heightClass="h-96" />
      ) : auctions.failed ? (
        <StateCard message="Auctions could not be loaded right now." onRetry={auctions.retry} />
      ) : items.length === 0 ? (
        <StateCard message={EMPTY_MESSAGES[tab]} actionHref="/auctions" actionLabel="Browse auctions" />
      ) : (
        <Rail cols={COLS}>
          {items.map((auction) => (
            <RailItem key={auction.id}>
              <AuctionCard auction={auction} now={now} />
            </RailItem>
          ))}
        </Rail>
      )}
    </section>
  );
}
