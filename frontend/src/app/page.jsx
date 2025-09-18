import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import FeaturedProducts from '@/components/FeaturedProducts';
import WhyChooseUs from '@/components/WhyChooseUs';
import InteriorDesignSection from '@/components/InteriorDesignSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CategorySection />
      <FeaturedProducts />
      <InteriorDesignSection />
      <WhyChooseUs />
    </div>
  );
}
