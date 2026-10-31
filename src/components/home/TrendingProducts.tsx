import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Package } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import SafeImage from '@/components/common/SafeImage';
import { Button } from '@/components/ui/button';
import { getMarketplaceProducts } from '@/lib/api';
import type { Product } from '@/types/types';

function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-US')}`;
  }
}

function priceLabel(product: Product): string {
  if (product.price_min == null) return 'Price on request';
  const currency = product.price_currency || 'USD';
  const min = formatPrice(Number(product.price_min), currency);
  if (product.price_max == null || Number(product.price_max) === Number(product.price_min)) return min;
  return `${min} – ${formatPrice(Number(product.price_max), currency)}`;
}

function ProductCard({ product }: { product: Product }) {
  const company = product.companies;
  const verified = company?.verification_status === 'verified';
  const image = product.images?.[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <Link to={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <SafeImage
            src={image}
            alt={product.name}
            fallbackType="product"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10" aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
          <Link to={`/products/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {company && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="truncate">{company.company_name}</span>
            {verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verified" />}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">MOQ</dt>
            <dd className="font-medium text-foreground">
              {product.moq ? `${product.moq.toLocaleString('en-US')} ${product.moq_unit || 'units'}` : 'Not stated'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Country of origin</dt>
            <dd className="font-medium text-foreground">{company?.country || 'Not stated'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted-foreground">Bulk price</dt>
            <dd className="font-semibold text-foreground">{priceLabel(product)}</dd>
          </div>
        </dl>

        <Button asChild size="sm" className="mt-5 w-full rounded-lg">
          <Link to={`/products/${product.slug}`}>Request quote</Link>
        </Button>
      </div>
    </article>
  );
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let active = true;
    getMarketplaceProducts({ pageSize: 8 })
      .then((result) => {
        if (active) setProducts(result.products);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-b border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Trending bulk products"
            title="Products open for quotation"
            subtitle="Listings from suppliers on BulkSkart. Request a quote on any product to start a conversation."
          />
          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            All products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {products === null ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-muted/60" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <h3 className="text-base font-semibold text-foreground">No products are listed yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Products appear here as verified manufacturers publish them. You can post a requirement in the meantime.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className="rounded-lg">
                <Link to="/post-requirement">Post your requirement</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/products">Browse products</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
