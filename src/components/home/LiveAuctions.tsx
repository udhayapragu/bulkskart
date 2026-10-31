import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Gavel, Package } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import SafeImage from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { supabase } from '@/db/supabase';

interface LiveAuction {
  id: string;
  title: string;
  auction_type: string;
  images: string[] | null;
  currency: string | null;
  starting_price: number | null;
  current_highest_bid: number | null;
  total_bids: number | null;
  total_quantity: number | null;
  quantity_unit: string | null;
  end_time: string;
}

/** Statuses from the auctions table that are open for bidding. */
const OPEN_STATUSES = ['live', 'closing_soon'];

function formatMoney(amount: number, currency: string | null): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || 'USD'} ${amount.toLocaleString('en-US')}`;
  }
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Ended';
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)} left`;
}

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function AuctionCard({ auction, now }: { auction: LiveAuction; now: number }) {
  const isForward = auction.auction_type === 'forward';
  const href = `/auctions/${isForward ? 'forward' : 'reverse'}/${auction.id}`;
  const remaining = new Date(auction.end_time).getTime() - now;
  const priceLine = auction.current_highest_bid != null
    ? `Current bid ${formatMoney(Number(auction.current_highest_bid), auction.currency)}`
    : auction.starting_price != null
      ? `Starting price ${formatMoney(Number(auction.starting_price), auction.currency)}`
      : 'Price on request';

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <Link to={href} className="block aspect-[16/9] overflow-hidden bg-muted">
        {auction.images?.[0] ? (
          <SafeImage src={auction.images[0]} alt={auction.title} fallbackType="product" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10" aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Gavel className="h-3.5 w-3.5" aria-hidden="true" />
            {isForward ? 'Forward auction' : 'Reverse auction'}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatRemaining(remaining)}
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-foreground">
          <Link to={href} className="hover:text-primary">{auction.title}</Link>
        </h3>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div className="col-span-2">
            <dt className="text-xs text-muted-foreground">Price</dt>
            <dd className="font-semibold text-foreground">{priceLine}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Bids</dt>
            <dd className="font-medium text-foreground">{(auction.total_bids ?? 0).toLocaleString('en-US')}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Quantity</dt>
            <dd className="font-medium text-foreground">
              {auction.total_quantity
                ? `${auction.total_quantity.toLocaleString('en-US')} ${auction.quantity_unit || 'units'}`
                : 'Not stated'}
            </dd>
          </div>
        </dl>

        <Button asChild size="sm" className="mt-5 w-full rounded-lg">
          <Link to={href}>View auction</Link>
        </Button>
      </div>
    </article>
  );
}

export default function LiveAuctions() {
  const [auctions, setAuctions] = useState<LiveAuction[] | null>(null);
  const now = useNow(1000);

  useEffect(() => {
    let active = true;

    async function loadOpenAuctions() {
      try {
        const { data, error } = await supabase
          .from('auctions')
          .select('id,title,auction_type,images,currency,starting_price,current_highest_bid,total_bids,total_quantity,quantity_unit,end_time,status')
          .in('status', OPEN_STATUSES)
          .gt('end_time', new Date().toISOString())
          .order('end_time', { ascending: true })
          .limit(4);
        if (active) setAuctions(!error && Array.isArray(data) ? (data as LiveAuction[]) : []);
      } catch {
        if (active) setAuctions([]);
      }
    }

    loadOpenAuctions();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Live auctions"
            title="Live forward and reverse auctions"
            subtitle="Bids on open auctions from BulkSkart members. Only auctions with live bidding are shown here."
          />
          <Link
            to="/auctions"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            All auctions
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {auctions === null ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-muted/60" />
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} now={now} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <h3 className="text-base font-semibold text-foreground">No live auctions right now</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Auctions appear here while bidding is open. Browse the auction hub for upcoming and recently closed auctions.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/auctions">Browse auctions</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
