import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { artKindFor, CategoryArt } from '@/components/home/landing/Illustrations';
import { Rail, RailItem, SectionTitle, SkeletonRail, StateCard } from '@/components/home/landing/shared';
import { useCategoryTiles } from '@/hooks/useHomepageData';
import { formatNumber } from '@/lib/homepageData';

const COLS = 'sm:grid-cols-4 lg:grid-cols-8';

export default function CategoryTiles() {
  const tiles = useCategoryTiles();
  const items = tiles.data ?? [];

  return (
    <section aria-label="Industry categories" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <SectionTitle title="Shop by Industry Category" href="/categories" linkLabel="View All Categories" />

      {tiles.loading && !tiles.data ? (
        <SkeletonRail count={8} cols="grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" heightClass="h-44" />
      ) : tiles.failed ? (
        <StateCard message="Categories could not be loaded right now." onRetry={tiles.retry} />
      ) : items.length === 0 ? (
        <StateCard message="Categories will appear here once they are published." actionHref="/products" actionLabel="Browse products" />
      ) : (
        <Rail cols={COLS}>
          {items.map(({ category, productCount, image }) => (
            <RailItem key={category.id} className="w-[44%]">
              <Link
                to={`/products?category=${encodeURIComponent(category.slug)}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <CategoryArt
                      kind={artKindFor(category.name)}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-bold leading-snug text-foreground group-hover:text-primary">
                      {category.name}
                    </h3>
                    {productCount !== null && productCount > 0 && (
                      <p className="mt-1 text-xs font-semibold text-primary">{formatNumber(productCount)} Products</p>
                    )}
                  </div>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                </div>
              </Link>
            </RailItem>
          ))}
        </Rail>
      )}
    </section>
  );
}
