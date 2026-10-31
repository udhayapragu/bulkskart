import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, MessageSquare, Scale, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  { icon: Send, label: 'Post Bulk Requirements' },
  { icon: Users, label: 'Receive Supplier Quotations' },
  { icon: Scale, label: 'Compare Offers' },
  { icon: MessageSquare, label: 'Negotiate Directly' },
  { icon: Handshake, label: 'Connect with Manufacturers' },
];

export default function RfqSection() {
  return (
    <section className="border-b border-border bg-card/40 py-16 md:py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">RFQ marketplace</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Your Requirement. Multiple Supplier Quotes.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Describe what you need once. Verified suppliers respond with quotations you can compare, then negotiate
            directly with the ones that fit.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 rounded-xl px-6">
              <Link to="/post-requirement">
                Post Your Requirement
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-xl px-6">
              <Link to="/requirements">Browse open requirements</Link>
            </Button>
          </div>
        </div>

        <ul className="grid gap-3">
          {FEATURES.map(({ icon: Icon, label }, index) => (
            <li
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="flex-1 text-base font-medium text-foreground">{label}</span>
              <span className="text-sm tabular-nums text-muted-foreground">0{index + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
