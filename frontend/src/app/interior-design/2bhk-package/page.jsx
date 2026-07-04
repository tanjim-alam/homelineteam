import Link from 'next/link';
import { ArrowRight, CheckCircle, Phone, Sparkles } from 'lucide-react';
import InteriorListingClient from '@/components/interior/InteriorListingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.homelineteam.com';

export const metadata = {
  title: '2 BHK Interior Package – Full Home Design | HomelineTeam',
  description:
    'Premium 2 BHK interior design packages — kitchen, wardrobes, living room, false ceiling and furniture. Expert consultation, warranty included.',
  keywords: [
    '2bhk interior package', '2 bhk design', 'interior design 2bhk', '2bhk home design',
    'full home interior package', '2bhk furniture package', 'HomelineTeam 2bhk',
  ],
  alternates: { canonical: 'https://www.homelineteam.com/interior-design/2bhk-package' },
  openGraph: {
    title: '2 BHK Interior Package | HomelineTeam',
    description: 'Complete 2 BHK interior design — premium quality, full home transformation.',
    url: 'https://www.homelineteam.com/interior-design/2bhk-package',
    siteName: 'HomelineTeam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2 BHK Interior Package | HomelineTeam',
    description: 'Full-home 2 BHK interior — kitchen, wardrobes, living room, false ceiling and more.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

async function fetchTwoBHKPackages() {
  try {
    const res = await fetch(`${API_BASE}/2bhk-packages`, { next: { revalidate: 3600 } });
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

const twoBHKJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.homelineteam.com' },
        { '@type': 'ListItem', position: 2, name: 'Interior Design', item: 'https://www.homelineteam.com/interior-design' },
        { '@type': 'ListItem', position: 3, name: '2 BHK Package', item: 'https://www.homelineteam.com/interior-design/2bhk-package' },
      ],
    },
    {
      '@type': 'Service',
      name: '2 BHK Interior Design Package',
      provider: { '@type': 'Organization', name: 'HomelineTeam', url: 'https://www.homelineteam.com' },
      description: 'Premium full-home 2 BHK interior package — kitchen, wardrobes, living room, and furniture. Expert consultation included.',
      areaServed: { '@type': 'Country', name: 'India' },
    },
  ],
};

export default async function TwoBHKPackagePage() {
  const packages = await fetchTwoBHKPackages();

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(twoBHKJsonLd) }} />
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 py-16 sm:py-20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 container-custom text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary-600/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Interior Design
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
            2 BHK{' '}
            <span className="bg-gradient-to-r from-primary-400 to-rose-400 bg-clip-text text-transparent">
              Interior
            </span>{' '}
            Packages
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Premium full-home interior packages for 2 BHK apartments — expert consultation, premium quality, and complete home transformation.
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
          {['Premium Quality', 'Full Home Design', 'Expert Consultation', 'Free Installation', 'Warranty Included'].map((f) => (
            <span key={f} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Packages with filter sidebar */}
      <InteriorListingClient
        products={packages}
        type="2bhk"
        basePath="/interior-design/2bhk-package"
        emptyIcon="🏢"
        emptyTitle="No Packages Available"
        emptyText="Our 2 BHK packages are being updated. Contact us for a custom quote."
      />

      {/* What's Included section */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">What's Typically Included</h2>
            <p className="text-gray-500 text-sm">Every 2 BHK package covers your complete home</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Modular Kitchen', '2 Wardrobes', 'Living Room', 'TV Unit', 'False Ceiling', 'Lighting & More'].map((item) => (
              <div key={item} className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 text-center">
                <CheckCircle className="w-5 h-5 text-primary-500" />
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
      Transform Your <strong>2 BHK Home</strong> into a Stylish and Functional Living Space
    </h2>

    <p className="mb-4">
      A <strong>2 BHK home</strong> offers the perfect balance between comfort and practicality. Whether you are a young family, working professional, investor, or homeowner upgrading your lifestyle, a thoughtfully designed <strong>interior</strong> can significantly improve your daily living experience. Professional <strong>interior design</strong> goes beyond aesthetics—it enhances <strong>functionality</strong>, maximizes <strong>space utilization</strong>, and creates a home that truly reflects your personality.
    </p>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, we offer customized <strong>2 BHK Interior Design Packages in Bangalore</strong> designed to meet the unique needs of modern homeowners. Our experienced designers understand the challenges that many <strong>2 BHK homeowners</strong> face, including limited storage, inefficient layouts, lack of organization, and inconsistent design themes. Through <strong>smart space planning</strong>, <strong>modular interiors</strong>, <strong>custom furniture</strong>, and premium finishes, we transform ordinary apartments into beautiful and highly functional homes.
    </p>

    <p className="mb-4">
      From <strong>modular kitchens</strong> and <strong>wardrobes</strong> to <strong>living room interiors</strong> and <strong>bedroom designs</strong>, Homeline Team provides <strong>complete home interior solutions</strong> that combine creativity, craftsmanship, and practical design. Whether you prefer a <strong>modern</strong>, <strong>minimalist</strong>, <strong>luxury</strong>, or <strong>customized style</strong>, our team is dedicated to delivering interiors that match your vision and lifestyle.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      About Our <strong>Interior Design Packages</strong>
    </h2>

    <p className="mb-4">
      Homeline Team specializes in complete <strong>2 BHK Interior Design Packages</strong> that
      simplify the entire <strong>home interior</strong> journey. Our <strong>interior design packages</strong> are designed to
      provide homeowners with end-to-end solutions that cover every important
      aspect of <strong>interior design and execution</strong>.
    </p>

    <p className="mb-4">
      Our comprehensive <strong>2 BHK packages</strong> typically include:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Modular kitchen design</strong></li>
      <li><strong>Bedroom interior design</strong></li>
      <li><strong>Modular wardrobes</strong></li>
      <li><strong>Living room interior design</strong></li>
      <li><strong>TV unit design</strong></li>
      <li><strong>Dining area design</strong></li>
      <li><strong>Storage solutions</strong></li>
      <li><strong>Custom furniture design</strong></li>
      <li><strong>False ceiling concepts</strong></li>
      <li><strong>Decorative lighting solutions</strong></li>
      <li><strong>Home renovation and interior upgrades</strong></li>
    </ul>

    <p className="mb-4">
      Every project begins with a detailed understanding of your requirements,
      lifestyle, preferences, and budget. Our <strong>interior designers</strong> then create
      personalized <strong>interior concepts</strong> that maximize both functionality and
      aesthetics.
    </p>

    <p className="mb-4">
      Using advanced <strong>3D visualization technology</strong>, we help homeowners preview
      their <strong>interiors before execution</strong> begins. This allows complete clarity and
      confidence throughout the <strong>interior design process</strong>.
    </p>

    <p>
      As trusted <strong>Home Interior Designers Bangalore</strong> homeowners rely on, we focus
      on delivering practical, elegant, and long-lasting interiors that improve
      everyday living.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Benefits of Professional Interior Design Services Package
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Better Space Utilization
        </h3>
        <p>
          A well-designed <strong>2 BHK home</strong> makes efficient use of every available
          square foot. <strong>Smart storage solutions</strong>, <strong>modular furniture</strong>, and
          optimized layouts help reduce clutter and improve organization.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Improved Functionality
        </h3>
        <p>
          <strong>Professional interior design</strong> ensures that every room serves its
          intended purpose effectively. From <strong>kitchen workflows</strong> to <strong>bedroom
          storage planning</strong>, functionality remains at the center of every design
          decision.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Enhanced Aesthetics
        </h3>
        <p>
          A professionally designed home creates a cohesive look that feels
          balanced, welcoming, and visually appealing. Carefully selected
          <strong> materials</strong>, <strong>finishes</strong>, colors, and <strong>furniture</strong> enhance the overall
          atmosphere.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Increased Property Value
        </h3>
        <p>
          Quality <strong>interiors</strong> can increase the <strong>market value</strong> of your property.
          Well-designed homes are more attractive to potential buyers and
          tenants.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Personalized Designs
        </h3>
        <p>
          Every homeowner has unique preferences. Our designers customize
          layouts, <strong>furniture</strong>, finishes, and <strong>storage solutions</strong> to suit your
          individual lifestyle and taste.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 leading-8">
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
          Our <strong>interior designers</strong> bring extensive experience in <strong>residential
          interior design projects</strong> across <strong>Bangalore</strong>. We understand local design
          preferences, apartment layouts, and modern living requirements.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Solutions
        </h3>
        <p>
          No two homes are the same. We create fully <strong>customized interiors</strong> based
          on your family's needs, lifestyle, and budget.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Quality Workmanship
        </h3>
        <p>
          We use skilled craftsmen, <strong>premium materials</strong>, and proven installation
          practices to ensure exceptional quality and durability.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Transparent Pricing
        </h3>
        <p>
          Our <strong>2 BHK Interior Design Packages</strong> are offered with clear and
          <strong> transparent pricing</strong>. There are no hidden charges or unexpected costs.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          End-to-End Project Management
        </h3>
        <p>
          From concept development to final handover, <strong>Homeline Team</strong> manages
          every aspect of the project, ensuring a hassle-free experience.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Timely Project Delivery
        </h3>
        <p>
          We follow structured <strong>project timelines</strong> and maintain regular
          communication to ensure projects are delivered on schedule.
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
          The journey begins with a detailed <strong>consultation</strong> where we understand
          your requirements, preferences, lifestyle, and budget expectations.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Space Planning
        </h3>
        <p>
          Our experts carefully analyze the available space and create efficient
          layouts that maximize comfort, <strong>storage</strong>, and <strong>functionality</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          3D Design & Visualization
        </h3>
        <p>
          Detailed <strong>3D renderings</strong> allow you to visualize your <strong>interiors</strong> before
          execution, ensuring complete satisfaction with the proposed design.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Material Selection
        </h3>
        <p>
          We guide you through selecting <strong>laminates</strong>, <strong>finishes</strong>, fabrics,
          <strong> hardware</strong>, countertops, and decorative materials that align with your
          design goals.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Execution & Installation
        </h3>
        <p>
          Our experienced team oversees manufacturing, <strong>installation</strong>, and
          quality checks to ensure flawless implementation.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Final Handover
        </h3>
        <p>
          Once all quality inspections are completed, your finished <strong>2 BHK home</strong> is
          handed over ready for comfortable living.
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
          Clean lines, sleek furniture, <strong>smart storage</strong>, and contemporary
          finishes define <strong>modern interior design</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Contemporary Interiors
        </h3>
        <p>
          <strong>Contemporary interiors</strong> blend current design trends with timeless
          elements to create sophisticated living spaces.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Minimalist Interiors
        </h3>
        <p>
          Simple forms, uncluttered layouts, and <strong>efficient storage solutions</strong>
          create calm and organized environments.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Interiors
        </h3>
        <p>
          <strong>Premium materials</strong>, designer finishes, <strong>customized furniture</strong>, and
          elegant detailing define <strong>luxury interior design</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Scandinavian Interiors
        </h3>
        <p>
          <strong>Scandinavian-inspired homes</strong> feature light colors, natural textures,
          functionality, and simplicity.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Traditional Interiors
        </h3>
        <p>
          Classic design elements, warm finishes, and timeless craftsmanship
          create inviting and elegant spaces.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Customized Themes
        </h3>
        <p>
          Our designers can develop <strong>personalized themes</strong> that reflect your
          individual preferences and lifestyle.
        </p>
      </div>
    </div>
  </div>
</div>
<div className="space-y-6 leading-8">
  <div>
    <h2 className="text-3xl font-bold mb-4">
      Quality Materials & Craftsmanship
    </h2>

    <p className="mb-4">
      At <strong>Homeline Team</strong>, quality remains the foundation of every project. We
      believe beautiful <strong>interiors</strong> should also be durable and long-lasting.
    </p>

    <p className="mb-4">
      Our projects feature:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Premium hardware systems</strong></li>
      <li><strong>High-quality laminates</strong></li>
      <li><strong>Engineered wood solutions</strong></li>
      <li><strong>Acrylic and PU finishes</strong></li>
      <li><strong>Moisture-resistant materials</strong></li>
      <li><strong>Soft-close hinges and channels</strong></li>
      <li><strong>Sustainable interior materials</strong></li>
    </ul>

    <p>
      We partner with trusted suppliers and manufacturers to ensure consistent
      quality across every project.
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
          <strong>2 BHK apartments</strong> are among the most popular residential formats in
          <strong> Bangalore</strong> and benefit greatly from <strong>professional space planning</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Villas
        </h3>
        <p>
          Guest suites and compact villa layouts can be enhanced through
          <strong> customized interior design solutions</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Independent Houses
        </h3>
        <p>
          <strong>2 BHK independent homes</strong> require tailored layouts that maximize
          <strong> storage</strong> and <strong>functionality</strong>.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Luxury Homes
        </h3>
        <p>
          <strong>Premium materials</strong> and <strong>bespoke design solutions</strong> create elegant and
          luxurious living environments.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Compact Urban Homes
        </h3>
        <p>
          Efficient <strong>interior design strategies</strong> help homeowners maximize available space
          while maintaining comfort and style.
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
          Hidden storage, <strong>modular wardrobes</strong>, <strong>pull-out organizers</strong>, and
          multifunctional cabinets are becoming increasingly popular.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Interior Design Concepts
        </h3>
        <p>
          Flexible <strong>modular interiors</strong> offer convenience, adaptability, and
          improved organization.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Sustainable Interiors
        </h3>
        <p>
          <strong>Eco-friendly materials</strong> and <strong>energy-efficient solutions</strong> are gaining
          popularity among environmentally conscious homeowners.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Multi-Functional Furniture
        </h3>
        <p>
          <strong>Multi-functional furniture</strong> that serves multiple purposes helps maximize functionality
          in modern homes.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">
          Modern Color Palettes
        </h3>
        <p>
          Neutral tones, earthy shades, <strong>natural wood textures</strong>, and soft matte
          finishes continue to dominate <strong>interior design trends</strong>.
        </p>
      </div>
    </div>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Why Customers Trust Homeline Team
    </h2>

    <p className="mb-4">
      Homeowners across <strong>Bangalore</strong> choose <strong>Homeline Team</strong> because of our
      commitment to quality, transparency, and customer satisfaction.
    </p>

    <p className="mb-4">
      Our clients appreciate:
    </p>

    <ul className="list-disc pl-6 space-y-2 mb-4">
      <li><strong>Personalized interior solutions</strong></li>
      <li><strong>Attention to detail</strong></li>
      <li><strong>Professional project execution</strong></li>
      <li><strong>High-quality materials</strong></li>
      <li><strong>Transparent communication</strong></li>
      <li><strong>Timely delivery</strong></li>
      <li><strong>Local expertise in Bangalore</strong></li>
    </ul>

    <p>
      Our mission is to create homes that are functional, beautiful, and
      designed around the people who live in them.
    </p>
  </div>

  <div>
    <h2 className="text-3xl font-bold mb-4">
      Schedule Your 2 BHK Interior Design Consultation Today
    </h2>

    <p className="mb-4">
      A professionally designed <strong>2 BHK home</strong> can improve comfort, organization,
      and overall quality of life. Whether you need <strong>modular interiors</strong>, <strong>custom
      furniture</strong>, <strong>bedroom design</strong>, <strong>living room interiors</strong>, or <strong>complete home
      renovation solutions</strong>, Homeline Team is here to help.
    </p>

    <p className="mb-4">
      As one of the trusted providers of <strong>2 BHK Interior Design Packages in
      Bangalore</strong>, we deliver personalized solutions that align with your vision,
      lifestyle, and budget.
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
      to explore our portfolio, discover our <strong>interior design services</strong>, and
      schedule a personalized consultation.
    </p>

    <p>
      Contact <strong>Homeline Team</strong> today and let our expert designers transform your <strong>2
      BHK home</strong> into a stylish, functional, and comfortable living space.
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
        1. What is included in a 2 BHK Interior Design Package?
      </h3>
      <p>
        Our packages typically include <strong>modular kitchen design</strong>, <strong>wardrobes</strong>,
        <strong> bedroom interiors</strong>, <strong>living room interiors</strong>, <strong>storage solutions</strong>, and <strong>custom
        furniture</strong> options.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        2. How much does a 2 BHK interior design package cost in Bangalore?
      </h3>
      <p>
        The cost depends on the scope of work, <strong>materials</strong> selected,
        customization requirements, and design preferences.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        3. Can I customize my interior design package?
      </h3>
      <p>
        Yes. Every <strong>2 BHK interior package</strong> can be tailored to suit your lifestyle, design
        preferences, and budget.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        4. What materials do you use for interiors?
      </h3>
      <p>
        We use <strong>premium laminates</strong>, <strong>engineered wood</strong>, <strong>acrylic finishes</strong>,
        <strong> moisture-resistant boards</strong>, and <strong>high-quality hardware</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        5. How long does a 2 BHK interior project take?
      </h3>
      <p>
        Most <strong>2 BHK interior projects</strong> are completed within <strong>6 to 10 weeks</strong> depending on design
        complexity and customization.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        6. Do you provide warranty on interiors?
      </h3>
      <p>
        Yes. <strong>Warranty coverage</strong> varies based on the materials, hardware, and
        products selected.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        7. How do I maintain modular interiors?
      </h3>
      <p>
        Regular cleaning and proper care help maintain the appearance and
        functionality of <strong>modular furniture</strong> and <strong>storage systems</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        8. Which design styles do you offer?
      </h3>
      <p>
        We offer <strong>modern</strong>, <strong>contemporary</strong>, <strong>minimalist</strong>, <strong>Scandinavian</strong>, <strong>luxury</strong>,
        <strong> traditional</strong>, and <strong>customized interior styles</strong>.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        9. Which Bangalore locations do you serve?
      </h3>
      <p>
        <strong>Homeline Team</strong> provides <strong>interior design services across Bangalore</strong> and
        nearby locations.
      </p>
    </div>

    <div className="border rounded-lg p-5">
      <h3 className="text-xl font-semibold mb-2">
        10. Why should I choose Homeline Team for my 2 BHK interior project?
      </h3>
      <p>
        We offer <strong>experienced designers</strong>, <strong>customized solutions</strong>, <strong>premium
        materials</strong>, <strong>transparent pricing</strong>, <strong>professional project management</strong>, and
        <strong> timely delivery</strong>.
      </p>
    </div>
  </div>
</div>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-rose-700 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to transform your 2 BHK?
          </h2>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xl mx-auto">
            Our expert designers will craft a personalised plan for your full home — premium quality that fits your budget.
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
