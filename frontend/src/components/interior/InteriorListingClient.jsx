'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Star, Filter, X, ChevronDown, ChevronUp,
  Phone, CheckCircle, ChefHat, Home, IndianRupee, Palette,
} from 'lucide-react';
import InquiryModal from '@/components/interior/InquiryModal';

/* ── filter constants (match /collections/* pages exactly) ── */
const KITCHEN_LAYOUTS = ['L Shape', 'Parallel Shape', 'Straight Shape'];
const LAYOUT_MAP      = { 'L Shape': 'l-shape', 'Parallel Shape': 'parallel', 'Straight Shape': 'straight' };
const WARDROBE_MAP    = { '2 Door': '2-door', '3 Door': '3-door', '4 Door': '4-door', '5 Door': '5-door', 'Sliding': 'sliding' };
const BHK1_WARDROBE   = ['2 Door', '3 Door', '4 Door'];
const BHK2_WARDROBE1  = ['2 Door', '3 Door', '4 Door', '5 Door', 'Sliding'];
const BHK2_WARDROBE2  = ['2 Door', '3 Door', '4 Door', '5 Door'];

const TYPE_CONFIG = {
  kitchen:   { countLabel: 'kitchens',  modalTitle: 'Book Free Kitchen Design Session' },
  wardrobes: { countLabel: 'wardrobes', modalTitle: 'Book Free Wardrobe Design Session' },
  '1bhk':    { countLabel: 'packages',  modalTitle: 'Book Free 1 BHK Design Session' },
  '2bhk':    { countLabel: 'packages',  modalTitle: 'Book Free 2 BHK Design Session' },
};

/* ── helpers ── */
function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

function buildFilters(products, type) {
  const prices   = products.map(p => p.basePrice).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 500000;

  if (type === 'kitchen')
    return { layouts: KITCHEN_LAYOUTS, minPrice, maxPrice };
  if (type === '1bhk')
    return { layouts: KITCHEN_LAYOUTS, wardrobeTypes: BHK1_WARDROBE, minPrice, maxPrice };
  if (type === '2bhk')
    return { layouts: KITCHEN_LAYOUTS, wardrobe1Types: BHK2_WARDROBE1, wardrobe2Types: BHK2_WARDROBE2, minPrice, maxPrice };
  if (type === 'wardrobes') {
    const doorTypes = uniq(products.flatMap(p => p.availableTypes || p.availableDoorTypes || [])).sort();
    return { doorTypes, minPrice, maxPrice };
  }
  return { minPrice, maxPrice };
}

function matches(product, active, type) {
  if (active.priceMin !== '' && product.basePrice < Number(active.priceMin)) return false;
  if (active.priceMax !== '' && product.basePrice > Number(active.priceMax)) return false;

  if (type === 'kitchen' && active.layouts.length) {
    const pt = (product.defaultLayout?.type || '').toLowerCase();
    const pn = (product.defaultLayout?.name || '').toLowerCase();
    const ok = active.layouts.some(l => {
      const api = LAYOUT_MAP[l] || '';
      return pt === api || pn.includes(api) ||
        (product.availableLayouts || []).some(al =>
          (al.type || '').toLowerCase() === api || (al.name || '').toLowerCase().includes(api));
    });
    if (!ok) return false;
  }

  if (type === '1bhk') {
    if (active.layouts.length && !active.layouts.some(l => product.kitchenLayout === LAYOUT_MAP[l])) return false;
    if (active.wardrobeType.length && !active.wardrobeType.some(w => product.wardrobeType === WARDROBE_MAP[w])) return false;
  }

  if (type === '2bhk') {
    if (active.layouts.length && !active.layouts.some(l => product.kitchenLayout === LAYOUT_MAP[l])) return false;
    if (active.wardrobe1Type.length && !active.wardrobe1Type.some(w => product.wardrobe1Type === WARDROBE_MAP[w])) return false;
    if (active.wardrobe2Type.length && !active.wardrobe2Type.some(w => product.wardrobe2Type === WARDROBE_MAP[w])) return false;
  }

  if (type === 'wardrobes' && active.doorTypes.length) {
    const types = (product.availableTypes || product.availableDoorTypes || []).map(d => d.toLowerCase());
    if (!active.doorTypes.some(d => types.includes(d.toLowerCase()))) return false;
  }

  return true;
}

const SORT_OPTIONS = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A–Z' },
];

function sortProducts(products, sort) {
  const arr = [...products];
  if (sort === 'price-asc')  return arr.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
  if (sort === 'price-desc') return arr.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
  if (sort === 'name-asc')   return arr.sort((a, b) => a.name.localeCompare(b.name));
  return arr;
}

/* ── filter option button ── */
function FilterOption({ label, selected, onClick, small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer ${small ? 'p-1.5' : 'p-2'} rounded-md border text-left text-gray-700 transition-all duration-200 ${
        selected
          ? 'border-primary-600 bg-primary-100 text-primary-900'
          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`${small ? 'text-xs' : 'text-sm'} font-medium`}>{label}</span>
        {selected && <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />}
      </div>
    </button>
  );
}

/* ── product card ── */
function ProductCard({ product, basePath, placeholderIcon, onBook }) {
  const discount = product.discount || (product.mrp && product.basePrice
    ? Math.round((1 - product.basePrice / product.mrp) * 100) : 0);
  const image = product.mainImages?.[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <Link href={`${basePath}/${product.slug}`} className="flex-1 flex flex-col">
        <div className="relative overflow-hidden bg-gray-50 aspect-[4/3]">
          {image ? (
            <Image src={image} alt={product.name} fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-200">
              {placeholderIcon}
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
              {discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 group-hover:text-primary-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2 flex-1">{product.description}</p>
          )}
          <div className="flex items-baseline gap-2 mt-auto pt-3 border-t border-gray-100">
            <span className="text-lg font-extrabold text-gray-900">
              ₹{product.basePrice?.toLocaleString('en-IN')}
            </span>
            {product.mrp && product.mrp > product.basePrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`${basePath}/${product.slug}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-primary-600 border border-primary-200 rounded-xl py-2 hover:bg-primary-50 transition-colors cursor-pointer"
        >
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onBook(product)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl py-2 transition-colors cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" /> Book
        </button>
      </div>
    </div>
  );
}

/* ── sidebar filters ── */
function SidebarFilters({ filters, active, type, toggle, setActive, clearAll, productCount, onBookConsultation }) {
  const priceStep = filters.maxPrice > 100000 ? 5000 : 1000;
  const cfg       = TYPE_CONFIG[type] || TYPE_CONFIG.kitchen;

  return (
    <div className="bg-gradient-to-b from-primary-50 to-primary-100 rounded-2xl p-4 border border-primary-200 shadow-lg lg:sticky lg:top-8 lg:h-fit">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Filters</h3>
        <p className="text-sm text-gray-600">{productCount} {cfg.countLabel} found</p>
      </div>

      <div className="space-y-4">

        {/* Kitchen Type — kitchen / 1bhk / 2bhk */}
        {(type === 'kitchen' || type === '1bhk' || type === '2bhk') && filters.layouts?.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-primary-600" /> Kitchen Type
            </h4>
            <div className="space-y-1">
              {filters.layouts.map(l => (
                <FilterOption key={l} label={l} selected={active.layouts.includes(l)} onClick={() => toggle('layouts', l)} />
              ))}
            </div>
          </div>
        )}

        {/* 1BHK: Wardrobe Type */}
        {type === '1bhk' && filters.wardrobeTypes?.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary-600" /> Wardrobe Type
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {filters.wardrobeTypes.map(w => (
                <FilterOption key={w} label={w} selected={active.wardrobeType.includes(w)} onClick={() => toggle('wardrobeType', w)} small />
              ))}
            </div>
          </div>
        )}

        {/* 2BHK: Wardrobe 1 */}
        {type === '2bhk' && filters.wardrobe1Types?.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary-600" /> Wardrobe 1
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {filters.wardrobe1Types.map(w => (
                <FilterOption key={w} label={w} selected={active.wardrobe1Type.includes(w)} onClick={() => toggle('wardrobe1Type', w)} small />
              ))}
            </div>
          </div>
        )}

        {/* 2BHK: Wardrobe 2 */}
        {type === '2bhk' && filters.wardrobe2Types?.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary-600" /> Wardrobe 2
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {filters.wardrobe2Types.map(w => (
                <FilterOption key={w} label={w} selected={active.wardrobe2Type.includes(w)} onClick={() => toggle('wardrobe2Type', w)} small />
              ))}
            </div>
          </div>
        )}

        {/* Wardrobes: door types */}
        {type === 'wardrobes' && filters.doorTypes?.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-primary-600" /> Wardrobe Type
            </h4>
            <div className="space-y-1">
              {filters.doorTypes.map(d => (
                <FilterOption key={d} label={d} selected={active.doorTypes.includes(d)} onClick={() => toggle('doorTypes', d)} />
              ))}
            </div>
          </div>
        )}

        {/* Style (when available) */}
        {filters.styles?.length > 0 && (
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-primary-600" /> Style
            </h4>
            <div className="space-y-1">
              {filters.styles.map(s => (
                <FilterOption key={s} label={s} selected={active.styles.includes(s)} onClick={() => toggle('styles', s)} />
              ))}
            </div>
          </div>
        )}

        {/* Price range */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-primary-600" /> Price Range
          </h4>
          <div className="flex gap-2">
            <input
              type="number" placeholder="Min" value={active.priceMin}
              onChange={e => setActive(p => ({ ...p, priceMin: e.target.value }))} step={priceStep}
              className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-text"
            />
            <input
              type="number" placeholder="Max" value={active.priceMax}
              onChange={e => setActive(p => ({ ...p, priceMax: e.target.value }))} step={priceStep}
              className="w-full p-2 border text-gray-700 border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-text"
            />
          </div>
          {filters.minPrice < filters.maxPrice && (
            <p className="text-xs text-gray-400 text-center mt-2">
              ₹{filters.minPrice.toLocaleString('en-IN')} – ₹{filters.maxPrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Footer: clear + book */}
        <div className="flex flex-col gap-2 pt-3 border-t border-primary-200">
          <button
            onClick={clearAll}
            className="flex items-center cursor-pointer justify-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-md transition-all duration-200"
          >
            <X className="w-4 h-4" /> Clear all
          </button>
          <button
            onClick={onBookConsultation}
            className="bg-primary-600 hover:bg-primary-700 cursor-pointer text-white px-3 py-2 rounded-md text-sm font-semibold shadow-md transition-all duration-200"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main component ── */
export default function InteriorListingClient({ products, type, basePath, emptyIcon, emptyTitle, emptyText }) {
  const cfg     = TYPE_CONFIG[type] || TYPE_CONFIG.kitchen;
  const filters = useMemo(() => buildFilters(products, type), [products, type]);

  const [active, setActive] = useState({
    styles: [], layouts: [], doorTypes: [],
    wardrobeType: [], wardrobe1Type: [], wardrobe2Type: [],
    priceMin: '', priceMax: '',
  });
  const [sort, setSort]             = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [bookProduct, setBookProduct] = useState(null);
  const [bookCategory, setBookCategory] = useState(false);

  const toggle = (key, value) => setActive(prev => ({
    ...prev,
    [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
  }));

  const clearAll = () => setActive({
    styles: [], layouts: [], doorTypes: [],
    wardrobeType: [], wardrobe1Type: [], wardrobe2Type: [],
    priceMin: '', priceMax: '',
  });

  const activeCount =
    active.styles.length + active.layouts.length + active.doorTypes.length +
    active.wardrobeType.length + active.wardrobe1Type.length + active.wardrobe2Type.length +
    (active.priceMin !== '' ? 1 : 0) + (active.priceMax !== '' ? 1 : 0);

  const filtered = useMemo(
    () => sortProducts(products.filter(p => matches(p, active, type)), sort),
    [products, active, sort, type]
  );

  const modalOpen  = bookProduct !== null || bookCategory;
  const modalName  = bookProduct?.name || 'Interior Design';
  const modalTitle = bookProduct ? 'Book Free Design Session' : cfg.modalTitle;
  const closeModal = () => { setBookProduct(null); setBookCategory(false); };

  if (products.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-6xl mb-4">{emptyIcon}</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">{emptyTitle}</h2>
        <p className="text-gray-500 text-sm mb-6">{emptyText}</p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
          Contact Us <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <InquiryModal isOpen={modalOpen} onClose={closeModal} productName={modalName} sourcePage={basePath} title={modalTitle} />

      {/* Mobile filter toggle */}
      <div className="lg:hidden bg-white border-b sticky top-20 z-20">
        <div className="container-custom py-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 text-gray-700 hover:text-primary-600 w-full py-2 px-4 bg-gray-50 rounded-lg border transition-all hover:bg-gray-100 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
            {activeCount > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="container-custom py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-80 w-full`}>
            <SidebarFilters
              filters={filters} active={active} type={type}
              toggle={toggle} setActive={setActive} clearAll={clearAll}
              productCount={products.length}
              onBookConsultation={() => setBookCategory(true)}
            />
          </div>

          {/* Products area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filtered.length}</span> {cfg.countLabel}
                  {activeCount > 0 && (
                    <span className="text-primary-600 ml-1">({activeCount} filter{activeCount !== 1 ? 's' : ''} applied)</span>
                  )}
                </div>
                <select
                  value={sort} onChange={e => setSort(e.target.value)}
                  className="border border-gray-200 text-gray-900 cursor-pointer rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  ...active.layouts.map(l      => ({ key: `l-${l}`,  label: l,         clear: () => toggle('layouts', l) })),
                  ...active.wardrobeType.map(w  => ({ key: `w-${w}`,  label: w,         clear: () => toggle('wardrobeType', w) })),
                  ...active.wardrobe1Type.map(w => ({ key: `w1-${w}`, label: `W1: ${w}`, clear: () => toggle('wardrobe1Type', w) })),
                  ...active.wardrobe2Type.map(w => ({ key: `w2-${w}`, label: `W2: ${w}`, clear: () => toggle('wardrobe2Type', w) })),
                  ...active.doorTypes.map(d     => ({ key: `d-${d}`,  label: d,         clear: () => toggle('doorTypes', d) })),
                  ...active.styles.map(s        => ({ key: `s-${s}`,  label: s,         clear: () => toggle('styles', s) })),
                ].map(chip => (
                  <span key={chip.key} className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full font-medium">
                    {chip.label}
                    <button onClick={chip.clear} className="cursor-pointer hover:text-primary-900"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {(active.priceMin !== '' || active.priceMax !== '') && (
                  <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full font-medium">
                    ₹{active.priceMin || '0'} – ₹{active.priceMax || '∞'}
                    <button onClick={() => setActive(p => ({ ...p, priceMin: '', priceMax: '' }))} className="cursor-pointer hover:text-primary-900"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={clearAll} className="text-xs text-primary-600 font-medium underline cursor-pointer hover:text-primary-800">
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-700 font-semibold mb-1">No results match your filters</p>
                <p className="text-gray-500 text-sm mb-4">Try adjusting or clearing your filters</p>
                <button onClick={clearAll} className="text-sm text-primary-600 font-bold hover:underline cursor-pointer">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p._id || p.slug} product={p} basePath={basePath} placeholderIcon={emptyIcon} onBook={setBookProduct} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
