'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  CheckCircle, Phone, Star, Clock, Shield, Tag,
  Award, Headphones, Sparkles, ThumbsUp, Ruler, Users,
} from 'lucide-react';
import InquiryModal from '@/components/interior/InquiryModal';
import BookingModal from '@/components/interior/BookingModal';

/* ── Image Slider ──────────────────────────────────────────────────── */
function ImageSlider({ images, altBase }) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent(i => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const next = useCallback(() => setCurrent(i => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] group">
        <Image
          src={images[current]}
          alt={`${altBase} ${current + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority={current === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10">
            {current + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative rounded-xl overflow-hidden bg-gray-100 aspect-square ring-2 transition-all duration-200 ${i === current ? 'ring-primary-500' : 'ring-transparent hover:ring-primary-300'}`}
            >
              <Image src={img} alt={`${altBase} ${i + 1}`} fill className="object-cover" sizes="20vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


/* ── Why Choose HomelineTeam ───────────────────────────────────────── */
const whyChoose = [
  { icon: Award,      title: 'Expert Designers',    desc: '10+ years of design expertise across 500+ homes in India.' },
  { icon: Sparkles,   title: 'Premium Materials',   desc: 'ISI-certified, scratch-resistant materials built to last.' },
  { icon: Clock,      title: 'On-Time Delivery',    desc: 'Projects delivered on schedule — we respect your time.' },
  { icon: Headphones, title: '24/7 Support',        desc: 'Dedicated support from consultation to post-install.' },
  { icon: Ruler,      title: 'Custom Solutions',    desc: 'Every design tailored exactly to your space and style.' },
  { icon: ThumbsUp,   title: 'Best Price Promise',  desc: 'Transparent pricing with no hidden costs, ever.' },
];

function WhyChooseUs() {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-100 text-primary-600 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          <Users className="w-3 h-3" /> Why HomelineTeam
        </span>
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-6">
        Why Thousands of Homeowners{' '}
        <span className="text-primary-600">Trust Us</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {whyChoose.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors duration-200 group">
              <div className="w-9 h-9 bg-primary-100 group-hover:bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                <Icon className="w-4 h-4 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Similar Products ──────────────────────────────────────────────── */
function SimilarCard({ product, basePath }) {
  const image = product.mainImages?.[0];
  const discount = product.discount || (product.mrp && product.basePrice
    ? Math.round((1 - product.basePrice / product.mrp) * 100) : 0);

  return (
    <Link
      href={`${basePath}/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Sparkles className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2 mb-1">{product.name}</h4>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-extrabold text-gray-900">₹{product.basePrice?.toLocaleString('en-IN')}</span>
          <span className="w-6 h-6 bg-primary-50 group-hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors duration-200 border border-primary-100 group-hover:border-primary-600">
            <ArrowRight className="w-3 h-3 text-primary-600 group-hover:text-white transition-colors" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Main Detail Client ────────────────────────────────────────────── */
export default function DesignDetailClient({
  product,
  similar = [],
  backHref,
  backLabel,
  basePath,
  detailSections,
}) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const discount = product.discount || (product.mrp && product.basePrice
    ? Math.round((1 - product.basePrice / product.mrp) * 100) : 0);

  const images = product.mainImages || [];

  return (
    <>
      <InquiryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productName={product.name}
        sourcePage={basePath}
      />
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        product={product}
        sourcePage={basePath}
      />

      <div className="container-custom py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10">

          {/* Left — Image slider */}
          <div>
            {images.length > 0 ? (
              <ImageSlider images={images} altBase={product.name} />
            ) : (
              <div className="rounded-2xl bg-gray-100 aspect-[4/3] flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div>
            {product.category && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full mb-3 inline-block">
                {product.category.replace(/-/g, ' ')}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {product.isFeatured && (
              <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-4">
                <Star className="w-3 h-3" /> Featured Design
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{product.basePrice?.toLocaleString('en-IN')}
              </span>
              {product.mrp && product.mrp > product.basePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Save ₹{(product.mrp - product.basePrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
              {discount > 0 && (
                <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{discount}% OFF</span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.description}</p>
            )}

            {/* detailSections: category-specific metadata chips passed from server */}
            {detailSections}

            {/* CTAs */}
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-3.5 rounded-xl transition-colors shadow-md shadow-green-100"
              >
                Book Now <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-3 rounded-xl transition-colors"
                >
                  Get This Design <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold px-5 py-3 rounded-xl transition-colors"
                >
                  <Phone className="w-4 h-4" /> Book Consultation
                </button>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
              {['Free Installation', 'Expert Design', '5-Year Warranty', 'Pan-India Delivery'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose HomelineTeam */}
        <div className="mb-8">
          <WhyChooseUs />
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">You May Also Like</h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.slice(0, 4).map(p => (
                <SimilarCard key={p._id || p.slug} product={p} basePath={basePath} />
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Book Consultation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
