import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ChevronDown, FileText, Globe, Lock, Search, ShieldCheck, Truck } from 'lucide-react';
import PortScene from '@/components/home/landing/PortScene';
import { HERO_IMAGE_ALT, HERO_IMAGE_SRC } from '@/config/homepage';
import { useDeliveryPolicy } from '@/hooks/useDeliveryPolicy';
import type { Category } from '@/types/types';

type SearchScope = 'products' | 'suppliers' | 'categories';

const SEARCH_SCOPES: Array<{ value: SearchScope; label: string; placeholder: string }> = [
  { value: 'products', label: 'Products', placeholder: 'Search products…' },
  { value: 'suppliers', label: 'Suppliers', placeholder: 'Search suppliers…' },
  { value: 'categories', label: 'Categories', placeholder: 'Search categories…' },
];

interface LandingHeroProps {
  categories: Category[] | null;
  /** Count of countries other than India with verified manufacturers. Null leaves it out of the copy. */
  countryCount: number | null;
}

export default function LandingHero({ categories, countryCount }: LandingHeroProps) {
  const navigate = useNavigate();
  const policy = useDeliveryPolicy();
  const [scope, setScope] = useState<SearchScope>('products');
  const [term, setTerm] = useState('');

  const activeScope = SEARCH_SCOPES.find((item) => item.value === scope) ?? SEARCH_SCOPES[0];
  const countryClause =
    countryCount && countryCount > 0
      ? ` and ${countryCount} other ${countryCount === 1 ? 'country' : 'countries'}`
      : '';

  const trustItems = [
    { title: 'Verified', detail: 'Manufacturers', icon: BadgeCheck, tone: 'text-primary' },
    { title: 'Free Delivery', detail: policy.charges, icon: Truck, tone: 'text-emerald-400' },
    { title: 'Secure', detail: 'Online Payments', icon: Lock, tone: 'text-primary' },
    { title: 'Trade Assurance', detail: 'Safe & Reliable', icon: ShieldCheck, tone: 'text-emerald-400' },
    { title: 'Global Shipping', detail: 'Import & export tools', icon: Globe, tone: 'text-primary' },
  ];

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = term.trim();
    if (scope === 'suppliers') {
      navigate(query ? `/manufacturers?q=${encodeURIComponent(query)}` : '/manufacturers');
      return;
    }
    if (scope === 'categories') {
      if (!query) {
        navigate('/categories');
        return;
      }
      const match = categories?.find((category) => category.name.toLowerCase().includes(query.toLowerCase()));
      if (match) {
        navigate(`/products?category=${encodeURIComponent(match.slug)}`);
        return;
      }
    }
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <section aria-label="Introduction" className="relative isolate overflow-hidden bg-[#050812] text-white">
      {HERO_IMAGE_SRC ? (
        <img
          src={HERO_IMAGE_SRC}
          alt={HERO_IMAGE_ALT}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      ) : (
        <PortScene className="absolute inset-0 -z-20 h-full w-full" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#050812]/80 via-[#050812]/82 to-[#050812]/70 lg:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,#050812_0%,rgba(5,8,18,0.9)_30%,rgba(5,8,18,0.4)_60%,rgba(5,8,18,0)_100%)] lg:block"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="mx-auto max-w-[1400px] px-4 pb-12 pt-10 sm:px-6 md:pb-14 md:pt-12 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="max-w-[760px] space-y-4 sm:space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-orange-300">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
            Global B2B Wholesale Marketplace
          </p>

          <h1 className="text-[2.15rem] font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            <span className="block">Buy in Bulk.</span>
            <span className="block text-primary">Source Global.</span>
            <span className="block">
              Grow <span className="text-primary">Faster.</span>
            </span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-slate-200/90 sm:text-base">
            Connect directly with verified manufacturers and suppliers from India{countryClause}. Discover wholesale
            products, compare quotations and grow your business globally.
          </p>

          <ul aria-label="Trust highlights" className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
            {trustItems.map(({ title, detail, icon: Icon, tone }) => (
              <li key={title} className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                  <Icon className={`h-5 w-5 ${tone}`} aria-hidden="true" />
                </span>
                <span className="min-w-0 text-xs leading-tight">
                  <span className="block font-bold text-white">{title}</span>
                  <span className="block text-[11px] text-slate-300">{detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <form
            role="search"
            onSubmit={handleSearch}
            className="flex w-full max-w-[640px] items-stretch overflow-hidden rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-black/10"
          >
            <div className="relative shrink-0 border-r border-slate-200">
              <label htmlFor="home-search-scope" className="sr-only">
                Search in
              </label>
              <select
                id="home-search-scope"
                value={scope}
                onChange={(event) => setScope(event.target.value as SearchScope)}
                className="h-12 appearance-none bg-transparent pl-3 pr-8 text-sm font-semibold text-slate-800 outline-none sm:pl-4"
              >
                {SEARCH_SCOPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
            <label htmlFor="home-search-term" className="sr-only">
              {`Search ${activeScope.label.toLowerCase()}`}
            </label>
            <input
              id="home-search-term"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder={activeScope.placeholder}
              className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="m-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary/90 sm:px-6"
            >
              <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
              <span className="sr-only sm:hidden">Search</span>
            </button>
          </form>

          {categories && categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-200">Popular:</span>
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-1 text-slate-200 transition-colors hover:border-primary/60 hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition-colors hover:bg-primary/90"
            >
              Explore Marketplace
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/post-requirement"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary bg-primary/5 px-6 text-sm font-bold text-orange-300 transition-colors hover:bg-primary/15"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Post a Requirement
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
