import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, MapPin } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import { Button } from '@/components/ui/button';
import { getCompanies } from '@/lib/api';
import type { Company } from '@/types/types';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function ManufacturerCard({ company }: { company: Company }) {
  const location = [company.city, company.country].filter(Boolean).join(', ');
  const summary = company.tagline || company.description;
  const profileHref = `/companies/${company.slug}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-4">
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={`${company.company_name} logo`}
            loading="lazy"
            decoding="async"
            className="h-14 w-14 shrink-0 rounded-xl border border-border bg-background object-contain p-1"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-sm font-bold text-foreground"
          >
            {initials(company.company_name) || <Building2 className="h-5 w-5" />}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{company.company_name}</h3>
          {location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </p>
          )}
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </p>
        </div>
      </div>

      {summary && <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>}
      {company.business_type && (
        <p className="mt-3 text-xs text-muted-foreground">{company.business_type}</p>
      )}

      <div className="mt-auto flex flex-wrap gap-3 pt-6">
        <Button asChild size="sm" className="rounded-lg">
          <Link to={profileHref}>View profile</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-lg">
          <Link to={profileHref}>Request quote</Link>
        </Button>
      </div>
    </article>
  );
}

export default function FeaturedManufacturers() {
  const [companies, setCompanies] = useState<Company[] | null>(null);

  useEffect(() => {
    let active = true;
    getCompanies({ verified: true, limit: 6 })
      .then((rows) => {
        if (active) setCompanies(rows);
      })
      .catch(() => {
        if (active) setCompanies([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Verified manufacturers"
            title="Meet verified manufacturers"
            subtitle="Business profiles for manufacturers whose documents have been reviewed and approved."
          />
          <Link
            to="/manufacturers"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            All manufacturers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {companies === null ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-muted/60" />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <ManufacturerCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
            <h3 className="text-base font-semibold text-foreground">No verified manufacturers listed yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Manufacturers appear here once their business documents have been reviewed and approved.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-lg">
                <Link to="/auth?tab=supplier">Register as a manufacturer</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/manufacturers">Browse manufacturers</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
