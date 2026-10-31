import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, Scale, Search, Truck } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';

const STEPS = [
  {
    icon: Search,
    title: 'Discover Products',
    body: 'Search verified listings by category, MOQ and destination, or browse by industry.',
    href: '/products',
    cta: 'Browse products',
  },
  {
    icon: Handshake,
    title: 'Connect with Manufacturers',
    body: 'Review verified manufacturer profiles and message them directly about your needs.',
    href: '/manufacturers',
    cta: 'Find manufacturers',
  },
  {
    icon: Scale,
    title: 'Compare Quotations',
    body: 'Post a requirement and compare quotations from suppliers side by side.',
    href: '/post-requirement',
    cta: 'Post a requirement',
  },
  {
    icon: Truck,
    title: 'Complete Bulk Trade',
    body: 'Agree the terms, place the order and follow its milestones through to delivery.',
    href: '/how-it-works',
    cta: 'See how orders work',
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-border bg-background py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <SectionHeader
          align="center"
          eyebrow="How Bulkskart works"
          title="From first search to completed trade"
          subtitle="Four steps, on one platform, with the paperwork and messages kept in one place."
        />

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                <Link
                  to={step.href}
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary hover:underline"
                >
                  {step.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
