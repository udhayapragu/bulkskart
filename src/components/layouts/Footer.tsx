import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import LocaleControls from '@/components/layouts/LocaleControls';

interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_COLUMNS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Products', href: '/products' },
      { label: 'Suppliers', href: '/manufacturers' },
      { label: 'RFQ', href: '/requirements' },
      { label: 'Auctions', href: '/auctions' },
      { label: 'Categories', href: '/categories' },
    ],
  },
  {
    title: 'Trade Tools',
    links: [
      { label: 'Import & Export Tools', href: '/trade-assistant' },
      { label: 'Shipping Calculator', href: '/shipping-calculator' },
      { label: 'Order Loan Calculator', href: '/loan-calculator' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'About Bulkskart', href: '/about' },
      { label: 'Help Centre', href: '/how-it-works' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Linkedin, href: 'https://linkedin.com/company/bulkskart', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/bulkskart', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com/bulkskart', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/bulkskart', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@bulkskart', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="w-full max-w-[100vw] overflow-x-hidden border-t border-border bg-card/40">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr]">
          <div className="col-span-2 space-y-4 md:col-span-1">
            <BrandLogo size="md" variant="auto" linkTo="/" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Connecting manufacturers, suppliers and buyers across the globe.
            </p>
            <a
              href="mailto:info@bulkskart.com"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              info@bulkskart.com
            </a>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-4 text-sm font-bold text-foreground">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 space-y-4 md:col-span-1">
            <h2 className="text-sm font-bold text-foreground">Follow Us</h2>
            <div className="flex gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/85"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
            <LocaleControls variant="full" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tech Pod AI Database Private Limited · BulkSkart. All rights reserved.</p>
          <p className="flex gap-4">
            <Link to="/cookie-policy" className="hover:text-primary">
              Cookie Policy
            </Link>
            <Link to="/sitemap" className="hover:text-primary">
              Sitemap
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
