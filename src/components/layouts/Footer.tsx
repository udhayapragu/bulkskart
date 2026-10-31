import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '@/components/common/BrandLogo';
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Mail, MessageSquare } from 'lucide-react';
import { WHATSAPP_CHAT_URL, WHATSAPP_DISPLAY } from '@/lib/supportContact';

// Every href below is an existing route in src/routes.tsx.
const footerSections = [
  {
    title: 'Marketplace',
    links: [
      { label: 'Products', href: '/products' },
      { label: 'Product categories', href: '/categories' },
      { label: 'Manufacturers', href: '/manufacturers' },
      { label: 'Suppliers', href: '/suppliers' },
      { label: 'RFQ marketplace', href: '/requirements' },
      { label: 'Live auctions', href: '/auctions' },
    ],
  },
  {
    title: 'For manufacturers',
    links: [
      { label: 'Manufacturer registration', href: '/auth?tab=supplier' },
      { label: 'Subscription plans', href: '/pricing' },
      { label: 'Respond to requirements', href: '/requirements' },
    ],
  },
  {
    title: 'For buyers',
    links: [
      { label: 'Buyer registration', href: '/auth?tab=buyer' },
      { label: 'Post a requirement', href: '/post-requirement' },
      { label: 'Order loan calculator', href: '/loan-calculator' },
      { label: 'Trade assistant', href: '/trade-assistant' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Bulkskart', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Help centre', href: '/how-it-works' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Contact support', href: '/contact' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms & conditions', href: '/terms' },
      { label: 'Cookie policy', href: '/cookie-policy' },
    ],
  },
];

const socialLinks = [
  { icon: Linkedin, href: 'https://linkedin.com/company/bulkskart', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/bulkskart', label: 'Twitter' },
  { icon: Facebook, href: 'https://facebook.com/bulkskart', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/bulkskart', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/@bulkskart', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="w-full max-w-[100vw] overflow-x-hidden border-t border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-6 md:py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-8 lg:grid-cols-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <BrandLogo size="md" variant="auto" linkTo="/" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The global marketplace for bulk trade. Manufacturers, wholesalers, distributors, importers and buyers
              connect here to source, quote and trade.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm">
              <li>
                <a href="mailto:info@bulkskart.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                  info@bulkskart.com
                </a>
              </li>
              <li>
                <a href={WHATSAPP_CHAT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </li>
            </ul>

            <div className="mt-6 flex gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">{section.title}</h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 Tech Pod AI Database Private Limited · BulkSkart. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/cookie-policy" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
