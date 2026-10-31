import React from 'react';
import { BadgeCheck, Globe, Headset, Lock, Tag, Truck } from 'lucide-react';
import { useDeliveryPolicy } from '@/hooks/useDeliveryPolicy';

export default function WhyChoose() {
  const policy = useDeliveryPolicy();
  const reasons = [
    { title: 'Free Delivery', caption: policy.charges, icon: Truck },
    { title: 'Verified Suppliers', caption: 'Verification status on every profile', icon: BadgeCheck },
    { title: 'Best Prices', caption: 'Compare supplier quotations', icon: Tag },
    { title: 'Secure Payments', caption: 'Pay online through a payment gateway', icon: Lock },
    { title: 'Global Trade Network', caption: 'Import and export tools', icon: Globe },
    { title: 'Customer Support', caption: 'Get help from the Bulkskart team', icon: Headset },
  ];

  return (
    <section aria-label="Why choose Bulkskart" className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 lg:px-8">
      <h2 className="mb-5 flex items-center gap-3 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        <span aria-hidden="true" className="h-6 w-1 rounded-full bg-primary sm:h-7" />
        Why choose Bulkskart
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {reasons.map(({ title, caption, icon: Icon }) => (
          <li key={title} className="flex items-start gap-3 rounded-xl border border-border bg-card/70 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-snug text-foreground">{title}</h3>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
