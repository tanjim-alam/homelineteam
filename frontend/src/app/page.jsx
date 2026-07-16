import Hero from '@/components/Hero';
import OfferBannerSection from '@/components/OfferBannerSection';
import CategorySection from '@/components/CategorySection';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyChooseUs from '@/components/WhyChooseUs';
import InteriorDesignSection from '@/components/InteriorDesignSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Offer Banners — below hero */}
      <OfferBannerSection position="below-hero" />

      {/* Category Section */}
      <CategorySection />

      {/* Offer Banners — below categories */}
      <OfferBannerSection position="below-categories" />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Offer Banners — below products */}
      <OfferBannerSection position="below-products" />

      {/* Interior Design Section */}
      <InteriorDesignSection />

      {/* Offer Banners — below interior design */}
      <OfferBannerSection position="below-design" />

      {/* Why Choose Us */}
      <WhyChooseUs />
    </main>
  );
}
