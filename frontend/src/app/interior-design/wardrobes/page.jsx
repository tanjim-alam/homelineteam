import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: 'Modular Wardrobe Interior Designer in Bangalore | Homeline Team',
  description:
    'Expert modular wardrobe interior design in Bangalore. Customized wardrobes, premium materials, and professional installation by Homeline Team.',
  keywords: [
    'Modular Wardrobe Interior Designer', 'Modular Wardrobe Interior Design',
    'Modular Wardrobe Interior Designer Bangalore', 'Home Interior Designers Bangalore',
    'Luxury Home Interiors Bangalore',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/wardrobes' },
  openGraph: {
    title: 'Modular Wardrobe Interior Designer in Bangalore | Homeline Team',
    description: 'Expert modular wardrobe interior design in Bangalore. Customized wardrobes, premium materials, and professional installation by Homeline Team.',
    url: 'https://www.homelineteam.com/interior-design/wardrobes',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modular Wardrobe Interior Designer in Bangalore | Homeline Team',
    description: 'Expert modular wardrobe interior design in Bangalore. Customized wardrobes, premium materials, and professional installation by Homeline Team.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchWardrobeProducts() {
  try {
    const res = await fetch(`${API_BASE}/wardrobe-products`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

const wardrobesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: 'Wardrobes', item: 'https://www.homelineteam.com/interior-design/wardrobes' },
      ],
    },
    {
      '@type': 'Service',
      name: 'Wardrobe Design Solutions',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'Premium sliding, hinged, and walk-in wardrobe designs with custom fittings and premium hardware.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
  ],
};

export default async function WardrobesPage() {
  const products = await fetchWardrobeProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(wardrobesJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary-600/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Modular{' '}
            <span className="bg-gradient-to-r from-primary-400 to-rose-400 bg-clip-text text-transparent">
              Wardrobe
            </span>{' '}
            Interior Design
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Maximise your bedroom storage with custom wardrobe designs — from sliding doors to walk-in closets, crafted for your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="tel:+919611925494"
              className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Now
            </Link>
          </div>
        </div>
      </div>

      {/* Quick features strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {['Space Optimised', 'Custom Fittings', 'Modern Styles', 'Free Installation', 'Expert Design'].map((f) => (
            <span key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Products with filter sidebar */}
      <InteriorListingClient
        products={products}
        type="wardrobes"
        basePath="/interior-design/wardrobes"
        emptyIcon="🚪"
        emptyTitle="No Products Available"
        emptyText="Our wardrobe catalogue is being updated. Contact us for custom designs."
      />

      {/* content */}
      <section className='px-5 md:px-10 py-4 space-y-6 text-gray-700'>
        <div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Modular Wardrobe Interior Design
    </h2>

    <h3 className="text-2xl font-semibold mb-4">
      Transform Your Storage Space with Expert Modular Wardrobe Interior Design
    </h3>

    <p className="mb-4">
      A well-designed <strong>wardrobe</strong> is more than just a storage unit. It plays an
      important role in keeping your home organized, functional, and visually
      appealing. Modern homeowners are increasingly choosing <strong>modular wardrobe
      interior design</strong> because it offers <strong>smart storage solutions</strong>, <strong>personalized
      layouts</strong>, and <strong>stylish finishes</strong> that complement contemporary lifestyles.
    </p>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we specialize in designing <strong>customized modular wardrobes</strong>
      that maximize available space while enhancing the aesthetics of your home.
      Whether you live in a compact apartment, spacious villa, independent
      house, or <strong>luxury residence in Bangalore</strong>, our expert designers create
      wardrobes that combine practicality with elegance.
    </p>

    <p className="mb-4">
      Many homeowners face challenges such as insufficient storage, cluttered
      bedrooms, poorly designed wardrobes, and wasted space. Our <strong>professional
      modular wardrobe design services</strong> solve these problems through <strong>intelligent
      planning</strong>, <strong>innovative storage concepts</strong>, and <strong>high-quality materials</strong>. From
      <strong> sliding wardrobes</strong> and <strong>walk-in closets</strong> to <strong>customized floor-to-ceiling
      storage systems</strong>, we deliver solutions tailored to your needs.
    </p>

    <p>
      If you are looking for a trusted <strong>Modular Wardrobe Interior Designer in Bangalore</strong>,
      <strong> Homeline Team</strong> offers <strong>complete design, manufacturing, and installation
      services</strong> that ensure a seamless and stress-free experience.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      About Our Modular Wardrobe Interior Design Services
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we believe every <strong>wardrobe</strong> should be designed around the
      lifestyle and <strong>storage requirements</strong> of its users. Our <strong>modular wardrobe
      interior design solutions</strong> are carefully planned to improve <strong>organization</strong>,
      accessibility, and visual appeal.
    </p>

    <p className="mb-4">
      Our design experts begin by understanding your daily routines, <strong>clothing
      storage needs</strong>, <strong>room dimensions</strong>, and style preferences. Based on these
      insights, we create wardrobes that make the most of every inch of
      available space.
    </p>

    <p className="mb-4">Our <strong>wardrobe solutions</strong> include:</p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Sliding Door Wardrobes</strong></li>
      <li><strong>Hinged Door Wardrobes</strong></li>
      <li><strong>Walk-In Wardrobes</strong></li>
      <li><strong>Floor-to-Ceiling Wardrobes</strong></li>
      <li><strong>Corner Wardrobes</strong></li>
      <li><strong>Mirror Wardrobes</strong></li>
      <li><strong>Open Wardrobe Concepts</strong></li>
      <li><strong>Customized Storage Systems</strong></li>
    </ul>

    <p className="mb-4">
      As an experienced <strong>Modular Wardrobe Interior Designer</strong>, we
      use advanced design tools and <strong>3D visualization technology</strong> to help clients
      visualize their wardrobe before production begins. This ensures complete
      transparency and confidence throughout the design process.
    </p>

    <p>
      Our goal is to create <strong>storage solutions</strong> that are functional, durable, and
      aesthetically pleasing while seamlessly blending with your home's interior
      design.
    </p>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Benefits of Professional Modular Wardrobe Interior Design Services
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Better Space Utilization
        </h3>
        <p>
          A <strong>professionally designed wardrobe</strong> maximizes every available corner of
          your room. <strong>Smart shelving</strong>, <strong>drawers</strong>, <strong>pull-out accessories</strong>, and
          <strong> vertical storage solutions</strong> help utilize space efficiently.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Improved Functionality
        </h3>
        <p>
          A <strong>modular wardrobe</strong> is designed to suit your storage habits. <strong>Dedicated
          compartments</strong> for clothes, accessories, shoes, handbags, and valuables
          make daily organization easier.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Enhanced Aesthetics
        </h3>
        <p>
          <strong>Modern wardrobes</strong> contribute significantly to the overall appearance of
          a bedroom. <strong>Stylish finishes</strong>, <strong>elegant designs</strong>, and <strong>premium materials</strong>
          create a sophisticated look.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Increased Property Value
        </h3>
        <p>
          Well-designed <strong>storage solutions</strong> improve the overall functionality of a
          home, making it more attractive to potential buyers and increasing
          <strong> resale value</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Personalized Designs
        </h3>
        <p>
          Every family has unique storage requirements. Professional <strong>wardrobe
          designers</strong> create fully <strong>customized layouts</strong> that align with your
          lifestyle and preferences.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Why Choose Homeline Team
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Experienced Designers
        </h3>
        <p>
          Our skilled <strong>interior designers</strong> have extensive experience creating
          <strong> customized wardrobe solutions</strong> for homes across <strong>Bangalore</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Solutions
        </h3>
        <p>
          Every wardrobe we design is tailored to the client's <strong>storage needs</strong>,
          <strong> room dimensions</strong>, and design preferences.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Quality Workmanship
        </h3>
        <p>
          We follow strict quality standards to ensure every <strong>wardrobe</strong> is built
          with precision, durability, and attention to detail.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Transparent Pricing
        </h3>
        <p>
          <strong>Homeline Team</strong> provides clear quotations and <strong>honest pricing</strong> without
          hidden charges.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          End-to-End Project Management
        </h3>
        <p>
          From <strong>consultation</strong> and design to <strong>manufacturing</strong> and <strong>installation</strong>, we
          manage every aspect of the project.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Timely Project Delivery
        </h3>
        <p>
          Our team follows efficient <strong>project schedules</strong> to ensure timely
          completion without compromising quality.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Our Design Process
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Consultation
        </h3>
        <p>
          We begin by understanding your <strong>storage requirements</strong>, <strong>room layout</strong>,
          style preferences, and budget.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Space Planning
        </h3>
        <p>
          Our designers analyze the available space and develop practical
          <strong> wardrobe layouts</strong> that maximize <strong>storage capacity</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          3D Design & Visualization
        </h3>
        <p>
          Detailed <strong>3D designs</strong> allow you to visualize the <strong>wardrobe</strong> and request
          modifications before production begins.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Material Selection
        </h3>
        <p>
          Choose from a wide range of <strong>laminates</strong>, <strong>finishes</strong>, handles,
          accessories, mirrors, and <strong>hardware</strong> options.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Execution & Installation
        </h3>
        <p>
          Our skilled craftsmen manufacture and <strong>install</strong> the wardrobe with
          precision and <strong>quality control</strong> at every stage.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Final Handover
        </h3>
        <p>
          After thorough inspection, the completed <strong>wardrobe</strong> is handed over ready
          for immediate use.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Design Styles We Offer
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Wardrobes
        </h3>
        <p>
          Sleek finishes, clean lines, and <strong>smart storage solutions</strong> define our
          <strong> modern wardrobe designs</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Contemporary Wardrobes
        </h3>
        <p>
          <strong>Contemporary wardrobes</strong> combine <strong>functionality</strong> with <strong>current design
          trends</strong> and elegant aesthetics.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Minimalist Wardrobes
        </h3>
        <p>
          <strong>Minimalist wardrobes</strong> feature <strong>clutter-free layouts</strong>, simple finishes,
          and highly <strong>organized storage</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Wardrobes
        </h3>
        <p>
          <strong>Premium materials</strong>, <strong>designer finishes</strong>, <strong>integrated lighting</strong>, and
          <strong> customized accessories</strong> create a luxurious storage experience.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Scandinavian Wardrobes
        </h3>
        <p>
          Light colors, natural textures, and functional simplicity characterize
          <strong> Scandinavian-inspired wardrobes</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Traditional Wardrobes
        </h3>
        <p>
          <strong>Classic finishes</strong>, elegant detailing, and <strong>timeless craftsmanship</strong> create
          warm and inviting interiors.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Themes
        </h3>
        <p>
          Our team can design wardrobes that perfectly match your <strong>bedroom
          interiors</strong> and <strong>personal style preferences</strong>.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Quality Materials & Craftsmanship
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, quality remains at the core of every project.
    </p>

    <p className="mb-4">
      Our <strong>modular wardrobes</strong> are built using:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Premium hardware systems</strong></li>
      <li><strong>High-quality laminates</strong></li>
      <li><strong>Durable acrylic finishes</strong></li>
      <li><strong>Moisture-resistant boards</strong></li>
      <li><strong>Soft-close hinges and channels</strong></li>
      <li><strong>Scratch-resistant surfaces</strong></li>
      <li><strong>Eco-friendly material options</strong></li>
    </ul>

    <p>
      We work with trusted suppliers to ensure every wardrobe delivers
      <strong> long-term durability</strong>, functionality, and visual appeal.
    </p>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Ideal Spaces for Modular Wardrobe Interior Design
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Apartments
        </h3>
        <p>
          <strong>Smart storage solutions</strong> maximize space in <strong>urban apartments</strong> where every
          square foot matters.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Villas
        </h3>
        <p>
          <strong>Large wardrobes</strong> with <strong>customized sections</strong>, dressing spaces, and <strong>walk-in
          closets</strong> complement spacious <strong>villa interiors</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Independent Houses
        </h3>
        <p>
          <strong>Customized wardrobe layouts</strong> can be tailored to suit unique <strong>floor plans</strong>
          and <strong>room dimensions</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Homes
        </h3>
        <p>
          <strong>Premium wardrobes</strong> with <strong>designer finishes</strong> and integrated features
          enhance <strong>luxury living</strong> experiences.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Compact Urban Homes
        </h3>
        <p>
          <strong>Space-saving wardrobe designs</strong> help maintain organization while
          improving <strong>room functionality</strong>.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Latest Modular Wardrobe Interior Design Trends
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Smart Storage Solutions
        </h3>
        <p>
          <strong>Modern wardrobes</strong> feature <strong>pull-out drawers</strong>, <strong>rotating racks</strong>, <strong>hidden
          compartments</strong>, and <strong>integrated organizers</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modular Concepts
        </h3>
        <p>
          <strong>Flexible modular designs</strong> allow homeowners to upgrade and <strong>customize
          storage</strong> as their needs evolve.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Sustainable Interiors
        </h3>
        <p>
          <strong>Eco-friendly materials</strong> and <strong>sustainable manufacturing practices</strong> are
          becoming increasingly popular.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Multi-Functional Furniture
        </h3>
        <p>
          <strong>Integrated study units</strong>, <strong>dressing areas</strong>, and <strong>storage solutions</strong> offer
          additional functionality.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Color Palettes
        </h3>
        <p>
          Neutral shades, <strong>wood textures</strong>, <strong>matte finishes</strong>, and contemporary color
          combinations dominate current <strong>wardrobe trends</strong>.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Why Customers Trust Homeline Team
    </h2>

    <p className="mb-4">
      <strong>Homeline Team</strong> has built a strong reputation as a reliable <strong>Modular Wardrobe
      Interior Designer in Bangalore</strong> by consistently delivering quality results
      and exceptional customer service.
    </p>

    <p className="mb-4">
      Homeowners trust us because of our:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Customer-first approach</strong></li>
      <li><strong>Personalized wardrobe designs</strong></li>
      <li><strong>Attention to detail</strong></li>
      <li><strong>Premium quality materials</strong></li>
      <li><strong>Professional project execution</strong></li>
      <li><strong>Transparent communication</strong></li>
      <li><strong>Local expertise in Bangalore</strong></li>
    </ul>

    <p>
      We focus on creating <strong>wardrobe solutions</strong> that improve organization,
      enhance comfort, and add <strong>lasting value</strong> to your home.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Schedule Your Modular Wardrobe Design Consultation Today
    </h2>

    <p className="mb-4">
      A thoughtfully designed <strong>modular wardrobe</strong> can transform your <strong>bedroom</strong> by
      improving <strong>storage</strong>, <strong>organization</strong>, and visual appeal. Whether you need a
      <strong> compact wardrobe</strong> for an apartment or a luxurious <strong>walk-in closet</strong> for a
      <strong> premium home</strong>, <strong>Homeline Team</strong> offers <strong>customized solutions</strong> designed around
      your lifestyle.
    </p>

    <p className="mb-4">
      If you are searching for a <strong>Modular Wardrobe Interior Designer in
      Bangalore</strong>, <strong>Home Interior Designers Bangalore</strong>, or <strong>Luxury Home Interiors
      Bangalore</strong>, our experienced team is ready to assist.
    </p>

    <p className="mb-4">
      Visit{" "}
      <a
        href="https://homelineteam.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        https://homelineteam.com
      </a>{" "}
      to explore our <strong>interior design services</strong>, browse project portfolios, and
      schedule a personalized consultation.
    </p>

    <p>
      Contact <strong>Homeline Team</strong> today and discover how our <strong>expert designers</strong> can
      create the perfect <strong>modular wardrobe solution</strong> for your home.
    </p>
  </div>
</div>
<div className="space-y-4">
  <h2 className="text-3xl font-bold mb-6">
    Frequently Asked Questions
  </h2>

  <div className="space-y-4">
    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        1. What is the cost of modular wardrobe interior design in Bangalore?
      </h3>
      <p>
        The cost varies based on size, <strong>materials</strong>, <strong>finishes</strong>, <strong>accessories</strong>, and
        customization requirements.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        2. How long does it take to complete a modular wardrobe project?
      </h3>
      <p>
        Most <strong>wardrobe projects</strong> are completed within <strong>3 to 6 weeks</strong> depending on
        complexity.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        3. Can I customize the internal storage layout?
      </h3>
      <p>
        Yes. Every <strong>wardrobe</strong> can be customized with <strong>shelves</strong>, <strong>drawers</strong>, <strong>hanging
        sections</strong>, <strong>shoe racks</strong>, and accessories.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        4. What materials are used for modular wardrobes?
      </h3>
      <p>
        We use <strong>premium laminates</strong>, <strong>acrylic finishes</strong>, <strong>moisture-resistant boards</strong>,
        and <strong>high-quality hardware</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        5. Do you provide 3D wardrobe designs before installation?
      </h3>
      <p>
        Yes. We provide detailed <strong>3D visualizations</strong> for approval before
        production begins.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        6. Is warranty available on modular wardrobes?
      </h3>
      <p>
        Yes. <strong>Warranty coverage</strong> depends on the materials and hardware selected
        for the project.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        7. How can I maintain my modular wardrobe?
      </h3>
      <p>
        Regular cleaning with a soft cloth and avoiding excessive moisture helps
        maintain the wardrobe's <strong>appearance and durability</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        8. Which wardrobe design styles do you offer?
      </h3>
      <p>
        We offer <strong>modern</strong>, <strong>contemporary</strong>, <strong>minimalist</strong>, <strong>luxury</strong>, <strong>Scandinavian</strong>,
        <strong> traditional</strong>, and <strong>customized wardrobe designs</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        9. Which Bangalore locations do you serve?
      </h3>
      <p>
        <strong>Homeline Team</strong> serves homeowners across <strong>Bangalore</strong> and surrounding areas.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        10. Why should I choose Homeline Team for modular wardrobe interior
        design?
      </h3>
      <p>
        We provide <strong>customized solutions</strong>, <strong>experienced designers</strong>, <strong>premium
        materials</strong>, <strong>transparent pricing</strong>, and <strong>professional project execution</strong>.
      </p>
    </div>
  </div>
</div>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Need a custom wardrobe for your space?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Our designers will measure your space and create the perfect storage solution tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-primary-50 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Book Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="tel:+919611925494"
              className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" /> +91 96119 25494
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
