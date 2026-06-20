import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: 'Modular Kitchen Interior Designer in Bangalore | Homeline Team',
  description:
    'Expert modular kitchen interior design in Bangalore. Custom layouts, smart storage, premium finishes, and professional installation by Homeline Team.',
  keywords: [
    'Modular Kitchen Interior Designer', 'Modular Kitchen Interior Design',
    'Modular Kitchen Interior Designer Bangalore', 'Home Interior Designers Bangalore',
    'Luxury Home Interiors Bangalore',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/kitchen' },
  openGraph: {
    title: 'Modular Kitchen Interior Designer in Bangalore | Homeline Team',
    description: 'Expert modular kitchen interior design in Bangalore. Custom layouts, smart storage, premium finishes, and professional installation by Homeline Team.',
    url: 'https://www.homelineteam.com/interior-design/kitchen',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modular Kitchen Interior Designer in Bangalore | Homeline Team',
    description: 'Expert modular kitchen interior design in Bangalore. Custom layouts, smart storage, premium finishes, and professional installation by Homeline Team.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchKitchenProducts() {
  try {
    const res = await fetch(`${API_BASE}/kitchen-products`, { next: { revalidate: 3600 } });
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

const kitchenJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: 'Modular Kitchen', item: 'https://www.homelineteam.com/interior-design/kitchen' },
      ],
    },
    {
      '@type': 'Service',
      name: 'Modular Kitchen Design',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'Custom modular kitchen designs with smart storage, premium finishes, and professional installation.',
      areaServed: { '@type': 'Country', name: 'India' },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Modular Kitchen Designs' },
    },
  ],
};

export default async function KitchenPage() {
  const products = await fetchKitchenProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(kitchenJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            Modular{' '}
            <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
              Kitchen
            </span>{' '}
            Designs
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Transform your kitchen with custom modular designs — smart storage, premium finishes, and layouts built for the way you cook.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
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
          {['Custom Layouts', 'Premium Materials', 'Free Installation', '5-Year Warranty', 'Expert Designers'].map((f) => (
            <span key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Products with filter sidebar */}
      <InteriorListingClient
        products={products}
        type="kitchen"
        basePath="/interior-design/kitchen"
        emptyIcon="🍳"
        emptyTitle="No Products Available"
        emptyText="Our kitchen catalogue is being updated. Contact us for custom designs."
      />

      {/* content */}
      <section className='px-5 md:px-10 py-4 space-y-6 text-gray-700'>
        <div className="space-y-6 text-gray-700 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Transform Your Cooking Space with Expert Modular Kitchen Interior Design
    </h2>

    <p className="mb-4">
      A well-designed <strong>kitchen</strong> is more than just a place to cook. It is the heart
      of your home where families gather, meals are prepared, and memories are
      created. A thoughtfully planned <strong>modular kitchen</strong> improves <strong>functionality</strong>,
      maximizes <strong>storage</strong>, and enhances the overall beauty of your living space.
    </p>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we specialize in creating <strong>modern, practical, and stylish
      modular kitchen interior designs</strong> that match your lifestyle and preferences.
      Whether you own an apartment, villa, independent house, or <strong>luxury residence
      in Bangalore</strong>, our expert designers help transform ordinary kitchens into
      efficient and elegant spaces.
    </p>

    <p className="mb-4">
      Many homeowners struggle with limited storage, poor layouts, cluttered
      countertops, and outdated kitchen designs. Our <strong>professional modular kitchen
      solutions</strong> address these challenges through <strong>intelligent space planning</strong>,
      <strong> premium materials</strong>, and <strong>customized layouts</strong>. From <strong>compact urban kitchens</strong> to
      spacious <strong>luxury cooking areas</strong>, <strong>Homeline Team</strong> delivers personalized
      solutions that combine aesthetics with everyday functionality.
    </p>

    <p>
      If you are looking for the best <strong>modular kitchen interior designer in
      Bangalore</strong>, our team is committed to providing <strong>innovative designs</strong>, <strong>quality
      craftsmanship</strong>, and <strong>end-to-end project management</strong> that ensures a seamless
      experience from concept to completion.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      About Our Modular Kitchen Design Services
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we believe every kitchen should reflect the unique needs
      of its users. Our <strong>modular kitchen interior design services</strong> focus on
      creating practical, stylish, and highly functional kitchens that improve
      daily living.
    </p>

    <p className="mb-4">
      We begin by understanding your <strong>cooking habits</strong>, <strong>storage requirements</strong>,
      family size, and design preferences. Based on these insights, our
      designers create <strong>customized kitchen layouts</strong> that optimize every inch of
      available space.
    </p>

    <p className="mb-4">Our <strong>modular kitchen solutions</strong> include:</p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>L-shaped kitchens</strong></li>
      <li><strong>U-shaped kitchens</strong></li>
      <li><strong>Parallel kitchens</strong></li>
      <li><strong>Island kitchens</strong></li>
      <li><strong>Straight-line kitchens</strong></li>
      <li><strong>Open kitchen concepts</strong></li>
      <li><strong>Customized storage solutions</strong></li>
    </ul>

    <p className="mb-4">
      Using advanced design tools and <strong>3D visualization technology</strong>, we help
      clients visualize their future kitchen before execution begins. This
      ensures complete transparency and confidence throughout the project.
    </p>

    <p>
      As a trusted <strong>custom modular kitchen interior designer in Bangalore</strong>,
      <strong> Homeline Team</strong> combines creativity, <strong>technical expertise</strong>, and <strong>premium
      materials</strong> to deliver kitchens that are both beautiful and durable.
    </p>
  </div>
</div>
<div className="space-y-6 text-gray-700 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Benefits of Professional Interior Design Services
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Better Space Utilization
        </h3>
        <p>
          Professional designers understand how to maximize available space
          efficiently. <strong>Smart storage solutions</strong>, <strong>corner units</strong>, <strong>pull-out systems</strong>,
          and <strong>vertical storage options</strong> help eliminate clutter while improving
          accessibility.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Improved Functionality
        </h3>
        <p>
          A <strong>modular kitchen</strong> is designed around your workflow. Proper placement
          of <strong>appliances</strong>, <strong>cooking zones</strong>, and <strong>storage areas</strong> ensures convenience
          and efficiency during everyday use.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Enhanced Aesthetics
        </h3>
        <p>
          An expertly designed kitchen elevates the overall appearance of your
          home. <strong>Modern finishes</strong>, <strong>elegant color schemes</strong>, and <strong>seamless layouts</strong>
          create a visually appealing environment.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Increased Property Value
        </h3>
        <p>
          Quality interior design can significantly enhance the value of your
          property. Potential buyers often consider <strong>modern kitchens</strong> a major
          selling point.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Personalized Designs
        </h3>
        <p>
          Every family has different requirements. Professional designers
          customize layouts, <strong>storage solutions</strong>, <strong>finishes</strong>, and accessories
          according to your lifestyle.
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
          Our skilled designers bring years of experience in <strong>residential
          interior design</strong> and <strong>modular kitchen planning</strong> across <strong>Bangalore</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Solutions
        </h3>
        <p>
          We understand that no two homes are alike. Every <strong>kitchen</strong> we design is
          tailored to suit your specific needs and preferences.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Quality Workmanship
        </h3>
        <p>
          We maintain strict quality standards throughout the project, ensuring
          precision, durability, and flawless execution.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Transparent Pricing
        </h3>
        <p>
          <strong>Homeline Team</strong> provides <strong>clear project estimates</strong> with no hidden charges,
          helping homeowners make informed decisions.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          End-to-End Project Management
        </h3>
        <p>
          From <strong>design consultation</strong> to <strong>installation</strong> and final handover, we manage
          every stage of the project professionally.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Timely Project Delivery
        </h3>
        <p>
          We value your time and ensure projects are completed within agreed
          <strong> timelines</strong> without compromising quality.
        </p>
      </div>
    </div>
  </div>

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
          The process begins with an in-depth discussion about your
          requirements, budget, <strong>design preferences</strong>, and lifestyle needs.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Space Planning
        </h3>
        <p>
          Our experts analyze the available area and create <strong>optimized layouts</strong>
          that maximize <strong>efficiency and functionality</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          3D Design & Visualization
        </h3>
        <p>
          Detailed <strong>3D designs</strong> allow you to visualize the final <strong>kitchen</strong> and make
          necessary adjustments before production begins.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Material Selection
        </h3>
        <p>
          Clients can choose from a wide range of <strong>laminates</strong>, <strong>finishes</strong>,
          <strong> countertops</strong>, <strong>hardware</strong>, and accessories to match their style
          preferences.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Execution & Installation
        </h3>
        <p>
          Our experienced team handles manufacturing, <strong>installation</strong>, and <strong>quality
          checks</strong> to ensure flawless implementation.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Final Handover
        </h3>
        <p>
          After thorough inspection and quality assurance, we deliver your
          completed <strong>modular kitchen</strong> ready for everyday use.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 text-gray-700 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Design Styles We Offer
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Modular Kitchens
        </h3>
        <p>
          Clean lines, sleek finishes, and <strong>innovative storage solutions</strong> define
          our <strong>modern kitchen designs</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Contemporary Kitchens
        </h3>
        <p>
          <strong>Contemporary kitchens</strong> combine <strong>current design trends</strong> with practical
          functionality and timeless appeal.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Minimalist Kitchens
        </h3>
        <p>
          Simple layouts, <strong>clutter-free storage</strong>, and <strong>elegant finishes</strong> create a
          sophisticated minimalist look.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Modular Kitchens
        </h3>
        <p>
          <strong>Premium materials</strong>, <strong>designer finishes</strong>, <strong>smart appliances</strong>, and exclusive
          detailing deliver a luxurious experience.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Scandinavian Kitchens
        </h3>
        <p>
          Light color palettes, natural materials, and functional simplicity
          characterize <strong>Scandinavian-inspired kitchens</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Traditional Kitchens
        </h3>
        <p>
          <strong>Classic designs</strong> with warm finishes and <strong>timeless detailing</strong> create
          inviting and elegant spaces.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Themes
        </h3>
        <p>
          Our designers can create <strong>personalized kitchen themes</strong> that reflect your
          individual taste and <strong>home interiors</strong>.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Quality Materials & Craftsmanship
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, quality is a top priority. We use carefully selected
      <strong> quality materials</strong> and trusted manufacturing practices to ensure <strong>long-lasting
      performance</strong>.
    </p>

    <p className="mb-4">Our kitchens feature:</p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Premium hardware systems</strong></li>
      <li><strong>High-quality laminates</strong></li>
      <li><strong>Durable acrylic finishes</strong></li>
      <li><strong>Moisture-resistant boards</strong></li>
      <li><strong>Scratch-resistant surfaces</strong></li>
      <li><strong>Soft-close hinges and channels</strong></li>
      <li><strong>Sustainable material options</strong></li>
    </ul>

    <p>
      Through our trusted supplier network, we source materials that meet high
      standards of durability, functionality, and aesthetics.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Ideal Spaces for Modular Kitchen Design
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Apartments
        </h3>
        <p>
          <strong>Smart storage solutions</strong> maximize functionality in <strong>compact apartment
          kitchens</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Villas
        </h3>
        <p>
          <strong>Large kitchen layouts</strong> can incorporate <strong>islands</strong>, <strong>breakfast counters</strong>, and
          luxury features.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Independent Houses
        </h3>
        <p>
          <strong>Customized kitchen designs</strong> complement unique <strong>floor plans</strong> and
          architectural styles.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Homes
        </h3>
        <p>
          <strong>Premium finishes</strong> and advanced features create exceptional culinary
          spaces.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Compact Urban Homes
        </h3>
        <p>
          <strong>Space-saving designs</strong> ensure practicality without compromising style.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Latest Interior Design Trends
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Smart Storage Solutions
        </h3>
        <p>
          <strong>Pull-out units</strong>, <strong>hidden compartments</strong>, and <strong>organized storage systems</strong> are
          increasingly popular among homeowners.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modular Concepts
        </h3>
        <p>
          <strong>Flexible modular designs</strong> offer adaptability, convenience, and
          efficient <strong>space management</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Sustainable Interiors
        </h3>
        <p>
          <strong>Eco-friendly materials</strong> and <strong>energy-efficient solutions</strong> continue to gain
          importance.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Multi-Functional Furniture
        </h3>
        <p>
          <strong>Integrated seating</strong>, <strong>breakfast counters</strong>, and <strong>versatile storage features</strong>
          enhance usability.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Color Palettes
        </h3>
        <p>
          <strong>Neutral tones</strong>, <strong>earthy shades</strong>, <strong>matte finishes</strong>, and <strong>natural textures</strong> are
          trending in <strong>contemporary kitchen interiors</strong>.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 text-gray-700 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Why Customers Trust Homeline Team
    </h2>

    <p className="mb-4">
      <strong>Homeline Team</strong> has earned the trust of homeowners across
      <strong> Bangalore</strong> through our commitment to quality and customer satisfaction.
    </p>

    <p className="mb-4">
      Clients choose us because we offer:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Personalized design solutions</strong></li>
      <li><strong>Transparent communication</strong></li>
      <li><strong>Professional project execution</strong></li>
      <li><strong>Attention to every detail</strong></li>
      <li><strong>Reliable customer support</strong></li>
      <li><strong>High-quality materials</strong></li>
      <li><strong>Local expertise in Bangalore</strong></li>
    </ul>

    <p>
      Our goal is to create kitchens that combine beauty, <strong>functionality</strong>, and
      <strong> long-term value</strong>.
    </p>

    <p className="mt-4">
      Whether you are <strong>renovating an existing kitchen</strong> or <strong>designing a new home</strong>,
      our team is dedicated to delivering results that exceed expectations.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Schedule Your Modular Kitchen Design Consultation Today
    </h2>

    <p className="mb-4">
      A well-designed <strong>modular kitchen</strong> can transform your daily
      living experience while adding lasting value to your home. With <strong>expert
      planning</strong>, <strong>premium materials</strong>, and <strong>customized solutions</strong>,
      <strong> Homeline Team</strong> helps homeowners create kitchens that are
      stylish, practical, and built to last.
    </p>

    <p className="mb-4">
      If you are searching for
      <strong> affordable modular kitchen design in Bangalore</strong>,
      <strong> professional interior designers in Bangalore</strong>, or
      <strong> luxury home interiors Bangalore</strong>, our team is ready to
      help.
    </p>

    <p className="mb-4">
      Visit{" "}
      <a
        href="https://homelineteam.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold underline"
      >
        https://homelineteam.com
      </a>{" "}
      to explore our portfolio, learn more about our <strong>interior design services</strong>, and schedule a
      personalized consultation with our experts today.
    </p>

    <p>
      Let <strong>Homeline Team</strong> bring your dream kitchen to life with
      <strong> innovative design</strong>, <strong>superior craftsmanship</strong>, and <strong>exceptional customer
      service</strong>.
    </p>
  </div>
</div>
<div className="space-y-4">
  <h2 className="text-3xl font-bold mb-6 text-black">
    Frequently Asked Questions
  </h2>

  <div className="space-y-4 text-gray-700">
    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        1. How much does a modular kitchen interior design cost in Bangalore?
      </h3>
      <p>
        The cost depends on kitchen size, <strong>materials</strong>, <strong>finishes</strong>, <strong>accessories</strong>, and
        customization requirements. <strong>Homeline Team</strong> offers solutions for various
        budgets.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        2. How long does a modular kitchen project take?
      </h3>
      <p>
        Most <strong>modular kitchen projects</strong> are completed within <strong>4 to 8 weeks</strong>, depending on
        complexity and customization.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        3. Can I customize the kitchen design according to my needs?
      </h3>
      <p>
        Yes. Every <strong>modular kitchen</strong> is customized based on your space,
        lifestyle, <strong>storage requirements</strong>, and design preferences.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        4. What materials do you use for modular kitchens?
      </h3>
      <p>
        We use <strong>high-quality laminates</strong>, <strong>acrylic finishes</strong>, <strong>moisture-resistant
        boards</strong>, <strong>premium hardware</strong>, and <strong>durable countertop materials</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        5. Do you provide 3D kitchen designs before execution?
      </h3>
      <p>
        Yes. We create detailed <strong>3D visualizations</strong> to help clients review and
        approve designs before production.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        6. Do your modular kitchens come with a warranty?
      </h3>
      <p>
        Yes. <strong>Warranty coverage</strong> varies depending on the materials and
        components selected for the project.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        7. How do I maintain my modular kitchen?
      </h3>
      <p>
        Regular cleaning with mild cleaning products and avoiding excessive
        moisture helps maintain the kitchen's <strong>appearance and durability</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        8. What design styles are available?
      </h3>
      <p>
        We offer <strong>modern</strong>, <strong>contemporary</strong>, <strong>minimalist</strong>, <strong>luxury</strong>, <strong>Scandinavian</strong>,
        <strong> traditional</strong>, and fully <strong>customized kitchen designs</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        9. Which areas in Bangalore do you serve?
      </h3>
      <p>
        <strong>Homeline Team</strong> provides <strong>modular kitchen interior design services across
        Bangalore</strong> and surrounding areas.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        10. Why should I choose Homeline Team for modular kitchen design?
      </h3>
      <p>
        Our <strong>experienced designers</strong>, <strong>customized solutions</strong>, <strong>quality materials</strong>,
        <strong> transparent pricing</strong>, and <strong>end-to-end project management</strong> make us a
        trusted choice for homeowners.
      </p>
    </div>
  </div>
</div>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Not sure which kitchen suits you?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Get a free consultation with our expert designers. We'll help you pick the perfect layout and finish for your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-xl transition-colors"
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
