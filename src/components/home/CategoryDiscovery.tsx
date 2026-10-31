import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types/types';

/** Used only when the database has no active categories. Names and links only, no counts. */
const FALLBACK_CATEGORIES = [
  { name: 'Machinery & Industrial', slug: 'machinery-industrial', description: 'Industrial machines, equipment and spare parts.' },
  { name: 'Electronics & Electrical', slug: 'electronics-electricals', description: 'Components, cables, switchgear and electrical goods.' },
  { name: 'Apparel & Textiles', slug: 'textiles-apparel', description: 'Fabrics, yarns, garments and finished textile goods.' },
  { name: 'Construction & Building', slug: 'construction-real-estate', description: 'Building materials, tiles, fixtures and hardware.' },
  { name: 'Packaging & Printing', slug: 'packaging', description: 'Cartons, boxes, labels and printed packaging.' },
  { name: 'Food & Agriculture', slug: 'agriculture-food', description: 'Agricultural produce, grains, spices and food ingredients.' },
  { name: 'Chemicals & Raw Materials', slug: 'chemicals-raw-materials', description: 'Industrial chemicals, polymers and raw materials.' },
  { name: 'Medical & Healthcare', slug: 'pharma-healthcare', description: 'Medical supplies, pharmaceuticals and healthcare goods.' },
];

interface CategoryCard {
  key: string;
  name: string;
  description: string | null;
  href: string;
  imageUrl: string | null;
}

export default function CategoryDiscovery() {
  const [cards, setCards] = useState<CategoryCard[] | null>(null);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((rows: Category[]) => {
        if (!active) return;
        const topLevel = rows.filter((c) => !c.parent_id).slice(0, 8);
        setCards(
          topLevel.length > 0
            ? topLevel.map((c) => ({
                key: c.id,
                name: c.name,
                description: c.description,
                href: `/categories/${c.slug}`,
                imageUrl: c.image_url,
              }))
            : FALLBACK_CATEGORIES.map((c) => ({
                key: c.slug,
                name: c.name,
                description: c.description,
                href: `/products?q=${encodeURIComponent(c.name)}`,
                imageUrl: null,
              })),
        );
      })
      .catch(() => {
        if (active) setCards([]);
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
            eyebrow="Explore categories"
            title="Find products by category"
            subtitle="Browse verified listings by industry, then narrow down by MOQ, price and destination."
          />
          <Link
            to="/categories"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            All categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {cards === null ? (
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-muted/60" />
            ))}
          </div>
        ) : (
          <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((card) => (
              <li key={card.key}>
                <Link
                  to={card.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Boxes className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                  <h3 className="mt-5 text-base font-semibold text-foreground">{card.name}</h3>
                  {card.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                  )}
                  <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-primary">
                    Explore
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
