import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import {
  FlagBadge, Rail, RailItem, SectionTitle, SkeletonRail, StateCard, VerifiedBadge,
} from '@/components/home/landing/shared';
import { useVerifiedManufacturers } from '@/hooks/useHomepageData';
import { flagForCountry } from '@/lib/countries';
import { formatNumber, type VerifiedManufacturer } from '@/lib/homepageData';

const COLS = 'sm:grid-cols-2 lg:grid-cols-4';

function ManufacturerCard({ manufacturer }: { manufacturer: VerifiedManufacturer }) {
  const location = [manufacturer.city, manufacturer.country].filter(Boolean).join(', ');
  const profilePath = `/companies/${encodeURIComponent(manufacturer.slug)}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <Link to={profilePath} tabIndex={-1} aria-hidden="true" className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-muted">
        <img
          src={manufacturer.image}
          alt={manufacturer.imageIsLogo ? `${manufacturer.name} logo` : manufacturer.name}
          loading="lazy"
          decoding="async"
          className={
            manufacturer.imageIsLogo
              ? 'h-full w-full object-contain p-6'
              : 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          }
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-foreground">
          <Link to={profilePath} className="hover:text-primary">
            {manufacturer.name}
          </Link>
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FlagBadge flag={flagForCountry(manufacturer.country)} />
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{location || 'Location not listed'}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <VerifiedBadge />
          {manufacturer.productCount !== null && manufacturer.productCount > 0 && (
            <span className="text-xs font-semibold text-foreground">{formatNumber(manufacturer.productCount)} Products</span>
          )}
        </div>
        {manufacturer.categories.length > 0 && (
          <p className="truncate text-xs text-muted-foreground">{manufacturer.categories.join(' · ')}</p>
        )}
        <Link
          to={profilePath}
          className="mt-auto inline-flex h-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

export default function VerifiedManufacturers() {
  const manufacturers = useVerifiedManufacturers();
  const items = manufacturers.data ?? [];

  return (
    <section aria-label="Verified manufacturers" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle title="Verified Manufacturers" href="/manufacturers" linkLabel="View All Suppliers" />

      {manufacturers.loading && !manufacturers.data ? (
        <SkeletonRail count={4} cols="grid-cols-2 lg:grid-cols-4" heightClass="h-80" />
      ) : manufacturers.failed ? (
        <StateCard message="Verified manufacturers could not be loaded right now." onRetry={manufacturers.retry} />
      ) : items.length === 0 ? (
        <StateCard
          message="No verified manufacturers with a company photograph are published yet."
          actionHref="/manufacturers"
          actionLabel="Browse suppliers"
        />
      ) : (
        <Rail cols={COLS}>
          {items.map((manufacturer) => (
            <RailItem key={manufacturer.id}>
              <ManufacturerCard manufacturer={manufacturer} />
            </RailItem>
          ))}
        </Rail>
      )}
    </section>
  );
}
