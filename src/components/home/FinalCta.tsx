import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />

      <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Join Bulkskart</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Your Next Big Business Opportunity Starts Here.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
          Create an account to source products, post bulk requirements and grow with verified trading partners.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-xl px-7">
            <Link to="/auth">
              Join Bulkskart
              <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-7">
            <Link to="/auth?tab=supplier">Register as Manufacturer</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-7">
            <Link to="/auth?tab=buyer">Start Buying in Bulk</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
