import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Factory, Globe, Package, ShoppingBasket, Ship, Warehouse } from 'lucide-react';

const MEMBERS = [
  {
    icon: Factory,
    title: 'Manufacturers',
    body: 'List products, answer buyer requirements and receive direct enquiries.',
  },
  {
    icon: Warehouse,
    title: 'Wholesalers',
    body: 'Find stock and compare supplier quotations for repeat bulk orders.',
  },
  {
    icon: Building2,
    title: 'Distributors',
    body: 'Source from verified manufacturers for regional distribution.',
  },
  {
    icon: Ship,
    title: 'Importers',
    body: 'Post the destination country and city with your requirement to request quotations.',
  },
  {
    icon: ShoppingBasket,
    title: 'Bulk buyers',
    body: 'Post a requirement once and compare quotations from suppliers.',
  },
];

export default function GlobalMarketplace() {
  return (
    <section className="border-b border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <Globe className="h-4 w-4" aria-hidden="true" />
              Global trade
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              One marketplace for every link in the trade chain
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Manufacturers, wholesalers, distributors, importers and bulk buyers use BulkSkart to find each other,
              compare quotations and trade in bulk. Each company shows the country it registered in.
            </p>
            <div className="mt-8">
              <Link to="/manufacturers" className="text-sm font-semibold text-primary hover:underline">
                Explore manufacturers by location
              </Link>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {MEMBERS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-border bg-background p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
            <li className="flex items-center gap-4 rounded-2xl border border-dashed border-border p-5 sm:col-span-2">
              <Package className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Your country or company not listed yet? Register and your profile will appear with the country you enter.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
