'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag, ChevronLeft } from 'lucide-react';

const stripEmoji = (s = '') =>
  s.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/[☀-➿]/g, '').replace(/\s+/g, ' ').trim();

/* ─── Sub-category card ──────────────────────────────────────────────────── */
function SubCard({ sub, showBadge }) {
  return (
    <Link href={`/collections/${sub.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '4/3' }}>
          {sub.image ? (
            <Image
              src={sub.image}
              alt={sub.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-200" />
            </div>
          )}

          {/* Main category badge (only in "All" view) */}
          {showBadge && sub.mainCategory && (
            <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {stripEmoji(sub.mainCategory.name)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors leading-snug mb-1">
            {stripEmoji(sub.name)}
          </h3>
          {sub.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{sub.description}</p>
          )}
          <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-sky-600">
            Browse <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </article>
    </Link>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function CollectionsClient({ mainCategories = [] }) {
  const [activeId, setActiveId] = useState(null); // null = "All"

  /* Flatten all sub-categories, attaching their parent reference */
  const allSubs = useMemo(() => {
    const result = [];
    mainCategories.forEach((mc) => {
      (mc.subcategories || []).forEach((sub) => {
        result.push({
          ...(typeof sub.toObject === 'function' ? sub.toObject() : sub),
          mainCategory: { _id: mc._id, name: mc.name, slug: mc.slug },
        });
      });
      /* If a main category has no sub-categories, treat itself as a card */
      if (!mc.subcategories?.length) {
        result.push({
          _id: mc._id,
          name: mc.name,
          slug: mc.slug,
          image: mc.image || null,
          description: mc.description || null,
          mainCategory: null,
        });
      }
    });
    return result;
  }, [mainCategories]);

  /* Categories shown in the active filter */
  const visibleSubs = useMemo(() => {
    if (!activeId) return allSubs;
    return allSubs.filter((s) => s.mainCategory?._id === activeId);
  }, [allSubs, activeId]);

  /* Active main category object */
  const activeMC = useMemo(
    () => (activeId ? mainCategories.find((mc) => mc._id === activeId) ?? null : null),
    [mainCategories, activeId]
  );

  /* ── When "All" view, group by main category for sections ── */
  const sections = useMemo(() => {
    if (activeId) return null;
    const map = new Map();
    allSubs.forEach((sub) => {
      const key = sub.mainCategory?._id ?? '__root__';
      const label = sub.mainCategory ? stripEmoji(sub.mainCategory.name) : '';
      const mcId = sub.mainCategory?._id ?? null;
      if (!map.has(key)) map.set(key, { label, mcId, items: [] });
      map.get(key).items.push(sub);
    });
    return [...map.values()];
  }, [allSubs, activeId]);

  if (mainCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Collections Yet</h2>
          <p className="text-gray-500">Collections will appear here once added.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page hero ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-10 sm:py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Our <span className="text-gradient">Collections</span>
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Premium home furnishings handcrafted to elevate every room.
          </p>
        </div>
      </section>

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container-custom">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveId(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                !activeId
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>

            {mainCategories.map((mc) => (
              <button
                key={mc._id}
                onClick={() => setActiveId(mc._id === activeId ? null : mc._id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  activeId === mc._id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {stripEmoji(mc.name)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content area ───────────────────────────────────────── */}
      <div className="container-custom py-8 sm:py-12">

        {/* ─── Filtered view: one main category ─── */}
        {activeMC && (
          <>
            {/* Breadcrumb / back */}
            <button
              onClick={() => setActiveId(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              All Collections
            </button>

            {/* Main category header */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              {activeMC.image && (
                <div className="relative w-full h-36 sm:h-52 rounded-2xl overflow-hidden mb-5">
                  <Image
                    src={activeMC.image}
                    alt={activeMC.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <h2 className="absolute bottom-4 left-6 text-white text-2xl sm:text-3xl font-extrabold drop-shadow-lg">
                    {stripEmoji(activeMC.name)}
                  </h2>
                </div>
              )}
              {!activeMC.image && (
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                  {stripEmoji(activeMC.name)}
                </h2>
              )}
              {activeMC.description && (
                <p className="text-gray-500 text-sm sm:text-base">{activeMC.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {visibleSubs.length} collection{visibleSubs.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Sub-category grid */}
            {visibleSubs.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">No collections in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {visibleSubs.map((sub) => (
                  <SubCard key={sub._id} sub={sub} showBadge={false} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── All view: grouped by main category ─── */}
        {!activeMC && sections && (
          <div className="space-y-10 sm:space-y-14">
            {sections.map(({ label, mcId, items }) => (
              <section key={label || '__root__'}>
                {label && (
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">{label}</h2>
                    {mcId && items.length > 1 && (
                      <button
                        onClick={() => setActiveId(mcId)}
                        className="text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        See all <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {items.map((sub) => (
                    <SubCard key={sub._id} sub={sub} showBadge={false} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
