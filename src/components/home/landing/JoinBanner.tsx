import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PortScene from '@/components/home/landing/PortScene';

export default function JoinBanner() {
  return (
    <section aria-labelledby="join-banner-title" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl border border-primary/30 bg-[#050812] text-white">
        <PortScene className="absolute inset-0 -z-20 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#050812] via-[#050812]/80 to-[#050812]/20" />
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="max-w-xl">
            <h2 id="join-banner-title" className="text-2xl font-black tracking-tight sm:text-3xl">
              Ready to Grow Your Business with Bulkskart?
            </h2>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">
              Join Bulkskart as a buyer to post requirements, or as a supplier to list products and answer them.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition-colors hover:bg-primary/90"
            >
              Join as a Buyer
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/auth?tab=supplier"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/5 px-6 text-sm font-bold text-white transition-colors hover:bg-white/15"
            >
              Join as a Supplier
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
