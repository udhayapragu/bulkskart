import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, MessageSquare, Scale, Search, Send, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types/types';

const POPULAR_SEARCHES = ['Textile', 'Steel', 'Chemical', 'Plastic', 'Machinery', 'Agriculture', 'Packaging', 'Electrical'];

const FLOW_STEPS = [
  { icon: Send, title: 'Post a requirement', body: 'Describe the product, quantity and destination.' },
  { icon: Users, title: 'Receive quotations', body: 'Verified suppliers respond with their offers.' },
  { icon: Scale, title: 'Compare and negotiate', body: 'Agree terms directly, then place the order.' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((rows) => {
        if (active) setCategories(rows.filter((c) => !c.parent_id).slice(0, 30));
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const search = (term: string, category: string) => {
    const params = new URLSearchParams();
    if (term.trim()) params.set('q', term.trim());
    if (category) params.set('category', category);
    const suffix = params.toString();
    navigate(suffix ? `/products?${suffix}` : '/products');
  };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div className="pointer-events-none absolute -top-32 left-1/3 h-96 w-[60%] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Global B2B marketplace
          </p>

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Source Globally. Trade Smarter.{' '}
            <span className="text-primary">Grow Faster.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Connect with verified manufacturers, trusted suppliers and bulk buyers worldwide. Discover products,
            compare quotations and grow your business with Bulkskart.
          </p>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              search(query, categorySlug);
            }}
            className="mt-10 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 sm:flex-row sm:items-center"
          >
            <label className="sr-only" htmlFor="hero-category">Category</label>
            <select
              id="hero-category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="h-12 rounded-xl border-0 bg-transparent px-3 text-sm font-semibold text-foreground outline-none sm:border-r sm:border-border sm:pr-4"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            <label className="sr-only" htmlFor="hero-search">Search products, suppliers and categories</label>
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, suppliers and categories"
                className="h-12 w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
              Search
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => search(term, '')}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6">
              <Link to="/post-requirement">Post Bulk Requirement</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6">
              <Link to="/manufacturers">
                Explore Manufacturers
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">How a requirement moves</p>
            <ol className="mt-6 space-y-6">
              {FLOW_STEPS.map(({ icon: Icon, title, body }, index) => (
                <li key={title} className="relative flex gap-4">
                  {index < FLOW_STEPS.length - 1 && (
                    <span aria-hidden="true" className="absolute left-5 top-11 h-[calc(100%-1rem)] w-px bg-border" />
                  )}
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
              <BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Verified manufacturers
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              Free delivery on every order
            </span>
            <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
              Direct negotiation
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
