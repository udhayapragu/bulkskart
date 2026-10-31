import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ChevronRight, FileText, Package, ShieldCheck } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';
import PageMeta from '@/components/common/PageMeta';
import SectionHeader from '@/components/home/SectionHeader';
import HeroSection from '@/components/home/HeroSection';
import PlatformProof from '@/components/home/PlatformProof';
import CategoryDiscovery from '@/components/home/CategoryDiscovery';
import FeaturedManufacturers from '@/components/home/FeaturedManufacturers';
import TrendingProducts from '@/components/home/TrendingProducts';
import HowItWorks from '@/components/home/HowItWorks';
import RfqSection from '@/components/home/RfqSection';
import LiveAuctions from '@/components/home/LiveAuctions';
import GlobalMarketplace from '@/components/home/GlobalMarketplace';
import OrderBenefitsSection from '@/components/home/OrderBenefitsSection';
import FinalCta from '@/components/home/FinalCta';

// Shared by the FAQPage structured data and the visible FAQ section, so the two always match.
const HOME_FAQS = [
  {
    question: "What is BulkSkart?",
    answer: "BulkSkart is a global B2B marketplace where manufacturers, wholesalers, distributors, importers and bulk buyers find each other, compare quotations and trade in bulk.",
  },
  {
    question: "Is posting a bulk requirement (RFQ) free for buyers?",
    answer: "Yes, verified buyers can post unlimited bulk buying requirements (RFQs) 100% free with zero platform commissions or hidden fees.",
  },
  {
    question: "How does BulkSkart verify suppliers and factories?",
    answer: "Manufacturers submit business documents, such as GST and IEC numbers and registration documents. BulkSkart reviews them before a company is marked verified.",
  },
  {
    question: "What is Trade Assurance on BulkSkart?",
    answer: "Orders on BulkSkart are tracked with milestones and a status history. Disputes can be raised and reviewed through the platform.",
  },
  {
    question: "Can suppliers receive live buyer requirements?",
    answer: "Yes, verified manufacturers receive instant alerts for live buying tenders matching their product categories and can submit direct factory quotations to buyers.",
  },
  {
    question: "Is delivery free on BulkSkart?",
    answer: "Yes. Free delivery applies to every order placed on BulkSkart. No delivery fee is added at checkout, for any order value or product category.",
  },
  {
    question: "Can I estimate a monthly installment for a bulk order?",
    answer: "Yes. The order loan calculator on the homepage estimates a monthly installment from the order value, down payment, interest rate, and tenure. Delivery on that order stays free. The figure is for planning and is not a credit approval.",
  },
];

function FadeInSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <MainLayout>
            <PageMeta
              title="BulkSkart | B2B Wholesale Marketplace & Bulk Suppliers in India"
              description="Source from verified manufacturers and wholesale suppliers in India. Free delivery on every order, free RFQs and factory-direct bulk prices."
              keywords="B2B marketplace India, wholesale suppliers India, bulk suppliers, manufacturers in India, post RFQ, factory direct wholesale, MOQ, bulk buying"
              canonical="https://www.bulkskart.com/"
              ogImage="https://www.bulkskart.com/brand/bulkskart-logo.jpg"
              ogType="website"
              breadcrumbs={[
                { name: 'Home', item: '/' },
              ]}
              faq={HOME_FAQS}
              jsonLd={{
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                '@id': 'https://www.bulkskart.com/#webpage',
                url: 'https://www.bulkskart.com/',
                name: 'BulkSkart | B2B Wholesale Marketplace & Bulk Suppliers in India',
                description: 'Source from verified manufacturers and wholesale suppliers in India. Free delivery on every order, free RFQs and factory-direct bulk prices.',
                isPartOf: { '@id': 'https://www.bulkskart.com/#website' },
                about: { '@id': 'https://www.bulkskart.com/#organization' },
                inLanguage: 'en-IN',
              }}
            />

      <HeroSection />
      <PlatformProof />
      <CategoryDiscovery />
      <FeaturedManufacturers />
      <TrendingProducts />
      <HowItWorks />
      <RfqSection />
      <LiveAuctions />
      <GlobalMarketplace />
      <OrderBenefitsSection />

      {/* ═══════════════════════════════════════════════════
          CRAWLABLE B2B MARKETPLACE OVERVIEW (SEO & BUYER GUIDE)
      ═══════════════════════════════════════════════════ */}
      <section className="py-12 bg-card/60 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <SectionHeader
                align="center"
                eyebrow="India sourcing ecosystem"
                title="India’s B2B Bulk Buying & Wholesale Platform"
                subtitle="Bridging verified Indian manufacturing clusters with global procurement professionals through transparent quotation comparison."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <div className="space-y-3 bg-background/60 p-5 rounded-2xl border border-border">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>What Bulkskart Is & Who It Is For</span>
                </h3>
                <p>
                  Bulkskart is a digital B2B wholesale marketplace for India connecting commercial buyers directly with verified production facilities. Built specifically for corporate procurement teams, retail distributors, export trading houses, and institutional buyers, Buyers deal directly with the manufacturers who list on the platform.
                </p>
                <p>
                  Whether you are an established enterprise sourcing high-volume industrial machinery or a growing retail brand restocking seasonal inventory, Bulkskart streamlines supplier discovery across all major manufacturing corridors.
                </p>
              </div>

              <div className="space-y-3 bg-background/60 p-5 rounded-2xl border border-border">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Manufacturers vs Wholesalers</span>
                </h3>
                <p>
                  Our verified network distinguishes between primary <Link to="/manufacturers" className="text-primary font-semibold hover:underline">Manufacturers</Link> offering custom OEM/ODM production runs and master <Link to="/wholesale-suppliers" className="text-primary font-semibold hover:underline">Wholesalers</Link> maintaining ready-to-ship pallet inventory.
                </p>
                <p>
                  Buyers can filter manufacturers by business type and location, such as <Link to="/manufacturers-in-tamil-nadu" className="text-primary font-semibold hover:underline">Tamil Nadu</Link>, <Link to="/manufacturers-in-coimbatore" className="text-primary font-semibold hover:underline">Coimbatore</Link>, <Link to="/manufacturers-in-chennai" className="text-primary font-semibold hover:underline">Chennai</Link>, and Gujarat.
                </p>
              </div>

              <div className="space-y-3 bg-background/60 p-5 rounded-2xl border border-border">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>RFQ Workflow & Quotation Comparison</span>
                </h3>
                <p>
                  Posting a <Link to="/post-requirement" className="text-primary font-semibold hover:underline">Request for Quotation (RFQ)</Link> is free for buyers. Specify required quantities, budget, destination and specifications.
                </p>
                <p>
                  Suppliers respond with quotations, so you can compare offers side by side.
                </p>
              </div>

              <div className="space-y-3 bg-background/60 p-5 rounded-2xl border border-border">
                <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span>MOQ Flexibility & Tiered Bulk Pricing</span>
                </h3>
                <p>
                  Each listing in our <Link to="/bulk-products" className="text-primary font-semibold hover:underline">bulk products catalog</Link> clearly displays the Minimum Order Quantity (MOQ) and price range.
                </p>
                <p>
                  Orders on BulkSkart are tracked with milestones and a status history, from confirmation to delivery.
                </p>
              </div>
            </div>

            {/* Quick Sourcing Hub Links */}
            <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="font-bold text-foreground mr-1">Popular Sourcing Hubs:</span>
              <Link to="/b2b-marketplace" className="text-muted-foreground hover:text-primary underline">B2B Marketplace</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/manufacturers-in-india" className="text-muted-foreground hover:text-primary underline">Manufacturers in India</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/wholesale-suppliers-in-india" className="text-muted-foreground hover:text-primary underline">Wholesale Suppliers India</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/manufacturers-in-tamil-nadu" className="text-muted-foreground hover:text-primary underline">Tamil Nadu Factories</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/manufacturers-in-coimbatore" className="text-muted-foreground hover:text-primary underline">Coimbatore Pumps & Textiles</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/manufacturers-in-chennai" className="text-muted-foreground hover:text-primary underline">Chennai Industrial Hub</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/blog/what-is-moq" className="text-muted-foreground hover:text-primary underline">What is MOQ?</Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/blog/how-to-find-manufacturers-in-india" className="text-muted-foreground hover:text-primary underline">Finding Indian Factories Guide</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visible FAQ: the same content as the FAQPage structured data above */}
      <section className="border-t border-border bg-background py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <SectionHeader
            align="center"
            eyebrow="FAQ"
            title="Frequently asked questions"
            subtitle="Answers about BulkSkart, bulk RFQs, supplier verification, Trade Assurance and delivery."
          />
          <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {HOME_FAQS.map((item) => (
              <details key={item.question} className="group p-5 md:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-foreground">
                  {item.question}
                  <ChevronRight className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </MainLayout>
  );
}
