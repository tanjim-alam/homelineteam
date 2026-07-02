import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: '1 BHK Interior Design Packages in Bangalore | Homeline Team',
  description:
    'Affordable 1 BHK interior design packages in Bangalore with modular solutions, customized designs, and expert execution by Homeline Team.',
  keywords: [
    '1 BHK Interior Design Packages', '1 BHK Interior Design Bangalore',
    'Home Interior Designers Bangalore', 'Affordable Interior Design Packages',
    'Luxury Home Interiors Bangalore',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/1bhk-package' },
  openGraph: {
    title: '1 BHK Interior Design Packages in Bangalore | Homeline Team',
    description: 'Affordable 1 BHK interior design packages in Bangalore with modular solutions, customized designs, and expert execution by Homeline Team.',
    url: 'https://www.homelineteam.com/interior-design/1bhk-package',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1 BHK Interior Design Packages in Bangalore | Homeline Team',
    description: 'Affordable 1 BHK interior design packages in Bangalore with modular solutions, customized designs, and expert execution by Homeline Team.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchOneBHKPackages() {
  try {
    const res = await fetch(`${API_BASE}/1bhk-packages`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.packages)) return data.packages;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch {
    return [];
  }
}

const oneBHKJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: '1 BHK Package', item: 'https://www.homelineteam.com/interior-design/1bhk-package' },
      ],
    },
    {
      '@type': 'Service',
      name: '1 BHK Interior Design Package',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'All-inclusive 1 BHK interior package — modular kitchen, wardrobe, TV unit, false ceiling and more.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
  ],
};

export default async function OneBHKPackagePage() {
  const packages = await fetchOneBHKPackages();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(oneBHKJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-sky-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-sky-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-sky-600/20 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            1 BHK{' '}
            <span className="bg-gradient-to-r from-sky-400 to-rose-400 bg-clip-text text-transparent">
              Interior
            </span>{' '}
            Packages
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            All-inclusive interior packages for 1 BHK apartments — kitchen, wardrobe, furniture and more. Beautiful, budget-smart, delivered fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
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
          {['Complete Setup', 'Budget Friendly', 'Fast Delivery', 'Free Installation', 'Expert Consultation'].map((f) => (
            <span key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Packages with filter sidebar */}
      <InteriorListingClient
        products={packages}
        type="1bhk"
        basePath="/interior-design/1bhk-package"
        emptyIcon="🏠"
        emptyTitle="No Packages Available"
        emptyText="Our 1 BHK packages are being updated. Contact us for a custom quote."
      />

      {/* What's Included section */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">What's Typically Included</h2>
            <p className="text-gray-500 text-sm">Every 1 BHK package comes with comprehensive home essentials</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Modular Kitchen', 'Wardrobe', 'TV Unit', 'Foyer Design', 'False Ceiling', 'Lighting'].map((item) => (
              <div key={item} className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 text-center">
                <CheckCircle className="w-5 h-5 text-sky-500" />
                <span className="text-xs font-semibold text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className='px-5 md:px-10 py-4 space-y-6 text-gray-700'>
        <div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      1 BHK Interior Design Packages
    </h2>

    <h3 className="text-2xl font-semibold mb-4">
      Create a Beautiful and Functional 1 BHK Home with Expert Interior Design
    </h3>

    <p className="mb-4">
      A <strong>1 BHK home</strong> may have limited space, but with the right <strong>interior design</strong>,
      it can offer exceptional comfort, functionality, and style. Whether you
      are a first-time homeowner, a working professional, a young couple, or an
      investor, a thoughtfully designed <strong>1 BHK apartment</strong> can significantly
      improve your everyday living experience.
    </p>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we specialize in customized <strong>1 BHK Interior Design
      Packages in Bangalore</strong> that maximize every square foot while reflecting
      your personal style. Our design solutions focus on <strong>intelligent space
      planning</strong>, <strong>modular furniture</strong>, <strong>efficient storage</strong>, and <strong>modern aesthetics</strong> to
      create homes that feel spacious, organized, and welcoming.
    </p>

    <p className="mb-4">
      Many homeowners struggle with space constraints, insufficient storage,
      cluttered layouts, and poor room functionality. <strong>Professional interior
      design</strong> helps overcome these challenges through <strong>smart design strategies</strong>,
      <strong> customized furniture</strong>, and carefully selected materials.
    </p>

    <p className="mb-4">
      Whether you are furnishing a newly purchased apartment or renovating an
      existing home, <strong>Homeline Team</strong> provides <strong>end-to-end interior solutions</strong> that
      combine creativity, <strong>quality craftsmanship</strong>, and <strong>practical functionality</strong>.
      Our goal is to transform your <strong>1 BHK</strong> into a beautiful living space that
      perfectly suits your lifestyle and budget.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      About Our 1 BHK Interior Design Packages
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we understand that every homeowner has unique
      requirements. Our <strong>1 BHK Interior Design Packages</strong> are designed to provide
      <strong> complete interior solutions</strong> that balance aesthetics, functionality, and
      affordability.
    </p>

    <p className="mb-4">
      Our packages typically include:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Modular wardrobe design</strong></li>
      <li><strong>Modular kitchen design</strong></li>
      <li><strong>Living room interiors</strong></li>
      <li><strong>Bedroom interior design</strong></li>
      <li><strong>TV unit design</strong></li>
      <li><strong>Space-saving furniture</strong></li>
      <li><strong>False ceiling solutions</strong></li>
      <li><strong>Lighting design</strong></li>
      <li><strong>Storage optimization</strong></li>
      <li><strong>Custom furniture design</strong></li>
    </ul>

    <p className="mb-4">
      Our experienced <strong>interior designers</strong> carefully assess your home's layout,
      lifestyle requirements, and design preferences before developing
      customized solutions.
    </p>

    <p className="mb-4">
      Using advanced design software and <strong>3D visualization tools</strong>, we help you
      visualize your home before execution begins. This ensures complete
      transparency and confidence throughout the project.
    </p>

    <p>
      As trusted <strong>Home Interior Designers in Bangalore</strong>, we focus on delivering
      interiors that are practical, stylish, and built for long-term use.
    </p>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Benefits of Professional Interior Design Packages
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Better Space Utilization
        </h3>
        <p>
          A <strong>professional interior design package</strong> helps maximize available space
          through <strong>intelligent layouts</strong>, <strong>built-in storage</strong>, and <strong>multifunctional
          furniture solutions</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Improved Functionality
        </h3>
        <p>
          Every room is planned to enhance daily convenience and usability. From
          <strong> storage placement</strong> to <strong>furniture arrangements</strong>, every detail serves a
          purpose.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Enhanced Aesthetics
        </h3>
        <p>
          A professionally designed home creates a cohesive and visually
          appealing environment that reflects your personality and lifestyle.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Increased Property Value
        </h3>
        <p>
          Quality <strong>interiors</strong> can significantly improve your property's <strong>market
          appeal</strong> and <strong>resale value</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Personalized Designs
        </h3>
        <p>
          Every aspect of the design is tailored to your preferences, ensuring a
          unique home that feels truly yours.
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
          Our team of skilled <strong>interior designers</strong> has extensive experience
          designing compact and <strong>luxury homes</strong> across <strong>Bangalore</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Solutions
        </h3>
        <p>
          We create <strong>personalized interiors</strong> based on your lifestyle, budget, and
          aesthetic preferences.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Quality Workmanship
        </h3>
        <p>
          From <strong>material selection</strong> to <strong>installation</strong>, we maintain strict quality
          standards at every stage.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Transparent Pricing
        </h3>
        <p>
          Our <strong>1 BHK Interior Design Packages</strong> are clearly defined with
          <strong> transparent pricing</strong> and no hidden costs.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          End-to-End Project Management
        </h3>
        <p>
          <strong>Homeline Team</strong> manages the entire process from concept development to
          final handover.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Timely Project Delivery
        </h3>
        <p>
          We follow structured <strong>project timelines</strong> to ensure your home is
          completed on schedule.
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
          The process begins with a detailed discussion about your lifestyle,
          <strong> design goals</strong>, <strong>storage needs</strong>, and budget.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Space Planning
        </h3>
        <p>
          Our experts develop <strong>efficient layouts</strong> that maximize <strong>functionality</strong>
          while maintaining visual balance.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          3D Design & Visualization
        </h3>
        <p>
          Detailed <strong>3D renderings</strong> allow you to review and refine your <strong>interiors</strong>
          before execution begins.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Material Selection
        </h3>
        <p>
          Choose from a wide range of <strong>laminates</strong>, <strong>finishes</strong>, fabrics, <strong>hardware</strong>,
          and decorative materials.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Execution & Installation
        </h3>
        <p>
          Our skilled team handles manufacturing, <strong>installation</strong>, and <strong>quality
          control</strong> to ensure flawless results.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Final Handover
        </h3>
        <p>
          After comprehensive quality checks, your completed <strong>1 BHK home</strong> is delivered
          ready for comfortable living.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Design Styles We Offer
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Interiors
        </h3>
        <p>
          Clean lines, sleek finishes, and functional layouts define <strong>modern
          interior design</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Contemporary Interiors
        </h3>
        <p>
          <strong>Contemporary designs</strong> blend current trends with timeless elegance and
          practicality.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Minimalist Interiors
        </h3>
        <p>
          Simple forms, uncluttered spaces, and <strong>efficient storage</strong> create a calm
          and organized environment.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Interiors
        </h3>
        <p>
          <strong>Premium materials</strong>, sophisticated detailing, and <strong>customized furnishings</strong>
          create an upscale living experience.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Scandinavian Interiors
        </h3>
        <p>
          Natural textures, light colors, and functional simplicity characterize
          <strong> Scandinavian-inspired homes</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Traditional Interiors
        </h3>
        <p>
          <strong>Classic design elements</strong> and <strong>timeless craftsmanship</strong> create warm and
          welcoming spaces.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Themes
        </h3>
        <p>
          Our designers can create <strong>personalized themes</strong> tailored to your
          individual taste and lifestyle.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Quality Materials & Craftsmanship
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we believe that superior <strong>interiors</strong> begin with <strong>quality
      materials</strong> and <strong>expert workmanship</strong>.
    </p>

    <p className="mb-4">
      Our projects feature:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Premium hardware systems</strong></li>
      <li><strong>High-quality laminates</strong></li>
      <li><strong>Durable acrylic finishes</strong></li>
      <li><strong>Moisture-resistant boards</strong></li>
      <li><strong>Soft-close channels and hinges</strong></li>
      <li><strong>Engineered wood solutions</strong></li>
      <li><strong>Sustainable material options</strong></li>
    </ul>

    <p>
      Through our trusted supplier network, we ensure that every material meets
      high standards of durability, functionality, and visual appeal.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Ideal Spaces for This Service
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Apartments
        </h3>
        <p>
          Our <strong>1 BHK Interior Design Packages</strong> are specifically designed to
          optimize <strong>apartment living</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Villas
        </h3>
        <p>
          Compact guest suites and secondary living spaces within villas can
          benefit from <strong>efficient interior solutions</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Independent Houses
        </h3>
        <p>
          <strong>Single-bedroom layouts</strong> in independent homes can be transformed into
          highly <strong>functional living environments</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Homes
        </h3>
        <p>
          Premium 1 BHK units can be enhanced with <strong>luxury finishes</strong> and
          <strong> custom-designed interiors</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Compact Urban Homes
        </h3>
        <p>
          <strong>Smart storage</strong> and <strong>multifunctional furniture</strong> make urban homes more
          spacious and comfortable.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 leading-8">
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
          Hidden storage compartments, <strong>modular wardrobes</strong>, and <strong>pull-out
          organizers</strong> help maximize space.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modular Concepts
        </h3>
        <p>
          <strong>Modular furniture</strong> offers flexibility, convenience, and efficient use
          of available space.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Sustainable Interiors
        </h3>
        <p>
          <strong>Eco-friendly materials</strong> and <strong>energy-efficient solutions</strong> are increasingly
          popular among homeowners.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Multi-Functional Furniture
        </h3>
        <p>
          <strong>Multi-functional furniture</strong> that serves multiple purposes is ideal for maximizing
          functionality in <strong>compact homes</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Color Palettes
        </h3>
        <p>
          Neutral shades, earthy tones, textured finishes, and natural
          materials continue to dominate <strong>interior design trends</strong>.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Why Customers Trust Homeline Team
    </h2>

    <p className="mb-4">
      <strong>Homeline Team</strong> has earned the trust of homeowners across <strong>Bangalore</strong> through
      consistent quality, transparency, and customer satisfaction.
    </p>

    <p className="mb-4">
      Clients choose us because we provide:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Customized interior solutions</strong></li>
      <li><strong>Professional project management</strong></li>
      <li><strong>Attention to detail</strong></li>
      <li><strong>Premium quality materials</strong></li>
      <li><strong>Transparent communication</strong></li>
      <li><strong>Reliable customer support</strong></li>
      <li><strong>Local expertise in Bangalore</strong></li>
    </ul>

    <p>
      We believe every home deserves <strong>thoughtful design</strong>, regardless of size. Our
      team works closely with homeowners to create interiors that are both
      <strong> practical and visually stunning</strong>.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Schedule Your 1 BHK Interior Design Consultation Today
    </h2>

    <p className="mb-4">
      A professionally designed <strong>1 BHK</strong> can dramatically improve comfort,
      organization, and everyday living. With <strong>smart planning</strong>, <strong>customized
      furniture</strong>, and <strong>premium finishes</strong>, <strong>Homeline Team</strong> helps transform <strong>compact
      spaces</strong> into beautiful, functional homes.
    </p>

    <p className="mb-4">
      Whether you need a <strong>complete home makeover</strong>, <strong>modular interiors</strong>, <strong>bedroom
      design</strong>, or <strong>customized storage solutions</strong>, our experts are ready to help.
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
      to explore our portfolio, learn more about our <strong>interior design packages</strong>,
      and schedule a personalized consultation.
    </p>

    <p>
      Contact <strong>Homeline Team</strong> today and discover why homeowners trust us for
      affordable, stylish, and high-quality <strong>1 BHK Interior Design Packages in
      Bangalore</strong>.
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
        1. What is included in your 1 BHK Interior Design Package?
      </h3>
      <p>
        Our packages typically include <strong>modular kitchen design</strong>, <strong>wardrobes</strong>,
        <strong> bedroom interiors</strong>, <strong>living room design</strong>, <strong>storage solutions</strong>, and <strong>custom
        furniture</strong> options.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        2. How much does a 1 BHK interior design project cost in Bangalore?
      </h3>
      <p>
        The cost depends on design scope, <strong>materials</strong>, customization, and project
        requirements. We offer <strong>flexible packages</strong> to suit different budgets.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        3. Can I customize the package according to my needs?
      </h3>
      <p>
        Yes. Every <strong>1 BHK interior package</strong> can be customized based on your preferences,
        lifestyle, and budget.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        4. What materials do you use for interiors?
      </h3>
      <p>
        We use <strong>premium laminates</strong>, <strong>engineered wood</strong>, <strong>moisture-resistant boards</strong>,
        <strong> acrylic finishes</strong>, and <strong>high-quality hardware</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        5. How long does a 1 BHK interior project take?
      </h3>
      <p>
        Most <strong>1 BHK interior projects</strong> are completed within <strong>4 to 8 weeks</strong> depending on the scope
        and customization.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        6. Do you provide warranties?
      </h3>
      <p>
        Yes. <strong>Warranty coverage</strong> depends on the materials, hardware, and products
        selected.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        7. How do I maintain modular interiors?
      </h3>
      <p>
        Regular cleaning and proper usage help maintain the appearance and
        durability of <strong>modular furniture</strong> and <strong>storage systems</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        8. Which interior design styles do you offer?
      </h3>
      <p>
        We offer <strong>modern</strong>, <strong>contemporary</strong>, <strong>minimalist</strong>, <strong>Scandinavian</strong>, <strong>luxury</strong>,
        <strong> traditional</strong>, and <strong>customized design styles</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        9. Which areas in Bangalore do you serve?
      </h3>
      <p>
        <strong>Homeline Team</strong> provides <strong>interior design services throughout Bangalore</strong> and
        surrounding areas.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        10. Why should I choose Homeline Team?
      </h3>
      <p>
        Our <strong>experienced designers</strong>, <strong>transparent pricing</strong>, <strong>quality workmanship</strong>,
        <strong> customized solutions</strong>, and <strong>timely project delivery</strong> make us a trusted
        choice for homeowners.
      </p>
    </div>
  </div>
</div>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to transform your 1 BHK?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Talk to our designers for a personalised package. We'll create a complete interior plan that fits your budget and style.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-sky-600 hover:bg-sky-50 font-bold px-6 py-3 rounded-xl transition-colors"
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
