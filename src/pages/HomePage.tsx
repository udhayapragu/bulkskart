import React from 'react';
import PageMeta from '@/components/common/PageMeta';
import CategoryTiles from '@/components/home/landing/CategoryTiles';
import FeaturedProducts from '@/components/home/landing/FeaturedProducts';
import JoinBanner from '@/components/home/landing/JoinBanner';
import LandingHero from '@/components/home/landing/LandingHero';
import LiveAuctions from '@/components/home/landing/LiveAuctions';
import LiveRequirements from '@/components/home/landing/LiveRequirements';
import LoanCalculatorCard from '@/components/home/landing/LoanCalculatorCard';
import PromiseCards from '@/components/home/landing/PromiseCards';
import StatsBar from '@/components/home/landing/StatsBar';
import TradeRoutes from '@/components/home/landing/TradeRoutes';
import VerifiedManufacturers from '@/components/home/landing/VerifiedManufacturers';
import WhyChoose from '@/components/home/landing/WhyChoose';
import MainLayout from '@/components/layouts/MainLayout';
import { useCategoryTree, useMarketplaceOverview } from '@/hooks/useHomepageData';

export default function HomePage() {
  const overview = useMarketplaceOverview();
  const tree = useCategoryTree();
  const supplierCountries = overview.data?.supplierCountries ?? null;
  // The hero says "India and N other countries", so India is not counted twice.
  const otherCountryCount = supplierCountries
    ? supplierCountries.filter((item) => item.country.toLowerCase() !== 'india').length
    : null;

  return (
    <MainLayout>
      <PageMeta
        title="BulkSkart | B2B Wholesale Marketplace & Bulk Suppliers in India"
        description="Source from verified manufacturers and wholesale suppliers in India and abroad. Compare quotations, post a buying requirement and follow live auctions on BulkSkart."
        keywords="B2B marketplace India, wholesale suppliers India, bulk suppliers, manufacturers in India, post RFQ, factory direct wholesale, MOQ, bulk buying"
        canonical="https://www.bulkskart.com/"
        ogImage="https://www.bulkskart.com/brand/bulkskart-logo.jpg"
        ogType="website"
        breadcrumbs={[{ name: 'Home', item: '/' }]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://www.bulkskart.com/#webpage',
          url: 'https://www.bulkskart.com/',
          name: 'BulkSkart | B2B Wholesale Marketplace & Bulk Suppliers in India',
          inLanguage: 'en-IN',
          isPartOf: { '@id': 'https://www.bulkskart.com/#website' },
          about: { '@id': 'https://www.bulkskart.com/#organization' },
        }}
      />

      <LandingHero categories={tree.data?.top ?? null} countryCount={otherCountryCount} />
      <StatsBar overview={overview} />
      <PromiseCards />
      <CategoryTiles />
      <FeaturedProducts />
      <VerifiedManufacturers />
      <LiveRequirements activeCount={overview.data?.activeRequirements ?? null} />
      <LiveAuctions liveCount={overview.data?.liveAuctions ?? null} />
      <TradeRoutes overview={overview} />
      <LoanCalculatorCard />
      <WhyChoose />
      <JoinBanner />
    </MainLayout>
  );
}
