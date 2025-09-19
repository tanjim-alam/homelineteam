import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyChooseUs from '@/components/WhyChooseUs';
import InteriorDesignCalculator from '@/components/InteriorDesignCalculator';
import InteriorDesignSection from '@/components/InteriorDesignSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Category Section */}
      <CategorySection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Interior Design Section */}
      <InteriorDesignSection />

      {/* Interior Design Calculator */}
      {/* <InteriorDesignCalculator /> */}

      {/* Why Choose Us */}
      <WhyChooseUs />
    </main>
  );
}
