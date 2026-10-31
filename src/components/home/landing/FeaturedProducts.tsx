import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import {
  Chip, FlagBadge, LiveDot, Rail, RailItem, SectionTitle, SkeletonRail, StateCard, TabPills,
} from '@/components/home/landing/shared';
import { useCategoryTree, useFeaturedProducts } from '@/hooks/useHomepageData';
import { flagForCountry } from '@/lib/countries';
import type { FeaturedProduct } from '@/lib/homepageData';

const COLS = 'sm:grid-cols-2 lg:grid-cols-4';

function ProductCard({ product }: { product: FeaturedProduct }) {
  const productPath = `/products/${encodeURIComponent(product.slug)}`;
  const location = [product.city, product.country].filter(Boolean).join(', ');
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <Link to={productPath} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-foreground">
          <Link to={productPath} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>
        <p className="text-base font-black leading-tight text-primary">{product.priceLabel}</p>
        {product.moqLabel && <p className="text-xs font-semibold text-orange-400">{product.moqLabel}</p>}
        <div className="mt-1 flex items-center gap-2 border-t border-border pt-2.5">
          <FlagBadge flag={flagForCountry(product.country)} />
          <div className="min-w-0 text-xs leading-tight">
            <p className="truncate font-semibold text-foreground">{product.companyName}</p>
            {location && (
              <p className="flex items-center gap-1 truncate text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{location}</span>
              </p>
            )}
          </div>
        </div>
        <Link
          to={productPath}
          className="mt-auto inline-flex h-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90"
        >
          Get Best Price
        </Link>
      </div>
    </article>
  );
}

export default function FeaturedProducts() {
  const tree = useCategoryTree();
  const [tab, setTab] = useState('all');

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All Products' },
      ...(tree.data?.top.slice(0, 6).map((category) => ({ id: category.id, label: category.name })) ?? []),
    ],
    [tree.data],
  );
  const categoryIds = tab === 'all' || !tree.data ? null : [tab, ...(tree.data.childIds[tab] ?? [])];
  const products = useFeaturedProducts(categoryIds);
  const items = products.data ?? [];

  return (
    <section aria-label="Featured bulk products" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle
        title="Featured Bulk Products"
        chip={
          <Chip tone="green">
            <LiveDot className="text-emerald-400" />
            Live Updates Every 30 Seconds
          </Chip>
        }
        href="/products"
        linkLabel="View All Products"
      />

      {tabs.length > 1 && <TabPills items={tabs} value={tab} onChange={setTab} label="Filter products by category" />}

      {products.loading && !products.data ? (
        <SkeletonRail count={4} cols="grid-cols-2 lg:grid-cols-4" heightClass="h-[22rem]" />
      ) : products.failed ? (
        <StateCard message="Featured products could not be loaded right now." onRetry={products.retry} />
      ) : items.length === 0 ? (
        <StateCard
          message={
            tab === 'all'
              ? 'No products with a supplier photograph are published yet.'
              : 'No products with a supplier photograph in this category yet.'
          }
          actionHref="/products"
          actionLabel="Browse all products"
        />
      ) : (
        <Rail cols={COLS}>
          {items.map((product) => (
            <RailItem key={product.id}>
              <ProductCard product={product} />
            </RailItem>
          ))}
        </Rail>
      )}
    </section>
  );
}
