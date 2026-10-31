import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Home, IndianRupee, Layers, LayoutGrid, Truck } from 'lucide-react';
import { TruckArt, WalletArt } from '@/components/home/landing/Illustrations';
import { useDeliveryPolicy } from '@/hooks/useDeliveryPolicy';

/** Intended payment flow. This describes the plan; it shows no balance and promises no settlement timing. */
const PAYMENT_FLOW = [
  'Buyer places an order.',
  'Buyer completes online payment.',
  'Payment is confirmed by the payment gateway.',
  "Applicable supplier proceeds are reflected in the manufacturer's Bulkskart wallet.",
  'Manufacturer can view wallet balance and transaction history.',
  'Eligible funds can be withdrawn to the registered bank account according to settlement rules.',
];

const WALLET_POINTS = ['Secure Online Payments', 'Track Order Payments', 'Transaction History', 'Withdraw to Bank Account'];

const DELIVERY_ICONS = [IndianRupee, LayoutGrid, Layers, Home, Truck];

export default function PromiseCards() {
  const policy = useDeliveryPolicy();
  const items = [policy.charges, ...policy.points];
  const badge = policy.charges.split(' ')[0];

  return (
    <section aria-label="Delivery and manufacturer wallet" className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <article
          id="free-delivery"
          className="relative flex scroll-mt-20 flex-col overflow-hidden rounded-2xl border border-emerald-500/50 bg-gradient-to-br from-emerald-950/50 via-card to-card p-5 sm:p-6"
        >
          <div className="grid gap-5 sm:grid-cols-[minmax(0,250px)_1fr] sm:items-center">
            <div className="relative mx-auto w-full max-w-[250px]">
              <TruckArt className="w-full" />
              <span className="absolute -top-1 right-0 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-base font-black text-white shadow-lg shadow-emerald-950/50 ring-4 ring-emerald-500/20">
                {badge}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl">
                {policy.headline}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{policy.description}</p>
              {policy.note && <p className="mt-2 text-xs text-muted-foreground">{policy.note}</p>}
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  to="/products"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
                >
                  Start an order
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/post-requirement"
                  className="inline-flex h-10 items-center rounded-lg border border-emerald-500/50 px-4 text-sm font-bold text-emerald-400 transition-colors hover:bg-emerald-500/10"
                >
                  Post a requirement
                </Link>
              </div>
            </div>
          </div>
          <ul className="mt-auto grid grid-cols-2 gap-x-3 gap-y-4 pt-6 sm:grid-cols-5">
            {items.map((item, index) => {
              const Icon = DELIVERY_ICONS[index] ?? Check;
              return (
                <li key={item} className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold leading-snug text-foreground">{item}</span>
                </li>
              );
            })}
          </ul>
        </article>

        <article
          id="manufacturer-wallet"
          className="relative scroll-mt-20 overflow-hidden rounded-2xl border border-primary/50 bg-gradient-to-br from-orange-950/40 via-card to-card p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Manufacturer Wallet</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Supplier proceeds are reflected in your Bulkskart wallet when buyers pay online.
              </p>
            </div>
            <WalletArt className="hidden h-24 w-auto shrink-0 sm:block" />
          </div>

          <ul className="mt-4 space-y-2.5">
            {WALLET_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Link
            to="/auth?tab=supplier"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            For Manufacturers
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <details className="group mt-4 rounded-lg border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none font-semibold text-foreground">How payments are intended to flow</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-4 leading-relaxed">
              {PAYMENT_FLOW.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-2">
              This describes the intended flow only. Settlement timing and withdrawal eligibility follow Bulkskart's
              settlement rules, and Bulkskart does not promise instant settlement.
            </p>
          </details>
        </article>
      </div>
    </section>
  );
}
