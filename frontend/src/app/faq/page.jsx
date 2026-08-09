'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    HelpCircle,
    ShoppingBag,
    CreditCard,
    Truck,
    RotateCcw,
    Paintbrush,
    User,
    Mail,
    Phone,
    Search,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

const CATEGORIES = [
    { id: 'ordering', label: 'Ordering', icon: ShoppingBag },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
    { id: 'design', label: 'Installation & Design', icon: Paintbrush },
    { id: 'account', label: 'Account & Support', icon: User },
];

const FAQS = [
    {
        category: 'ordering',
        q: 'How do I place an order?',
        a: 'Browse a category (Curtains, Blinds, Wallpaper, Cushion Covers or Interior Design), open a product, choose any options or a custom size, and add it to your cart. When you\'re ready, head to checkout to confirm your delivery address and payment method.',
    },
    {
        category: 'ordering',
        q: 'Do I need an account to order?',
        a: 'Yes — you\'ll need to sign in before checkout. This lets us tie the order to your account so you can track it, request returns, and see your order history from My Orders.',
    },
    {
        category: 'ordering',
        q: 'Can I order curtains or blinds in a custom size?',
        a: 'Yes, on products that support it — enter your width and height right on the product page and the price recalculates automatically based on those measurements. Double-check your numbers before adding to cart, since these are cut to size.',
    },
    {
        category: 'ordering',
        q: 'What does the "Book Now" button do?',
        a: 'It\'s a quick way to request a callback for that product — leave your name, phone number and city, and our team will reach out to help you finalize details. No payment is needed upfront.',
    },
    {
        category: 'payments',
        q: 'What payment methods do you accept?',
        a: 'Cash on Delivery, and online payment by card, UPI, netbanking or wallet through Razorpay.',
    },
    {
        category: 'payments',
        q: 'Is paying online safe?',
        a: 'Yes. Online payments are processed through Razorpay\'s secure payment gateway — we never see or store your card, UPI or bank details on our servers.',
    },
    {
        category: 'shipping',
        q: 'How long does delivery take?',
        a: 'Standard delivery is 3-5 business days after dispatch; express delivery (1-2 business days) is available in Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune and other select metros. See our full Shipping Info page for details by product type.',
        link: { href: '/shipping-info', label: 'Read Shipping Info' },
    },
    {
        category: 'shipping',
        q: 'Is shipping free?',
        a: 'Yes — delivery is free across India on every order, with no minimum order value.',
    },
    {
        category: 'shipping',
        q: 'Do you deliver all over India?',
        a: 'Yes, pan-India. Remote or rural pin codes may take a few extra business days because of courier network reach.',
    },
    {
        category: 'shipping',
        q: 'How do I track my order?',
        a: 'Open My Orders — every order shows its current stage (Pending → Confirmed → Shipped → Delivered), and once it\'s handed to our delivery partner we share courier and tracking details there too.',
        link: { href: '/my-orders', label: 'Go to My Orders' },
    },
    {
        category: 'returns',
        q: 'What is your return and exchange policy?',
        a: 'Once an order is marked Delivered, you can request a return (for a refund) or an exchange straight from My Orders — per item, so only the piece with an issue needs to go back. See Returns & Exchanges for the full step-by-step.',
        link: { href: '/returns-exchanges', label: 'Read Returns & Exchanges' },
    },
    {
        category: 'returns',
        q: 'How do refunds work?',
        a: 'When you submit a return, you provide your bank account details up front. Once we\'ve received and inspected the item, the refund is transferred to that account.',
    },
    {
        category: 'returns',
        q: 'Can I cancel a return request after submitting it?',
        a: 'Yes — while it\'s still in Pending status, you can cancel it yourself from the My Returns page.',
        link: { href: '/my-returns', label: 'Go to My Returns' },
    },
    {
        category: 'design',
        q: 'Do you offer professional installation?',
        a: 'Yes. Full professional installation and free in-home design consultation are available in Bengaluru and select nearby cities. Outside that zone, products still ship pan-India ready to install, with setup guidance from our team over a call.',
    },
    {
        category: 'design',
        q: 'How does the interior design process work?',
        a: 'Three steps: a free consultation where our designers hear your vision, a design & approval stage with 3D design, material selection and budget sign-off, and finally expert execution — precision installation by our craftsmen.',
        link: { href: '/interior-design', label: 'Explore Interior Design' },
    },
    {
        category: 'design',
        q: 'Is the design consultation really free?',
        a: 'Yes, there\'s no charge for the initial consultation — it\'s the first step before any design or material decisions are made.',
    },
    {
        category: 'account',
        q: 'I forgot my password. What do I do?',
        a: 'Use the "Forgot Password" link on the sign-in page to reset it by email.',
        link: { href: '/auth/forgot-password', label: 'Reset Password' },
    },
    {
        category: 'account',
        q: 'Where can I see my past orders?',
        a: 'All your orders — past and current — are listed on the My Orders page, along with their status and any returns raised against them.',
        link: { href: '/my-orders', label: 'Go to My Orders' },
    },
    {
        category: 'account',
        q: 'How do I get in touch with support?',
        a: 'Call or email us — our team is available Monday to Saturday, 9:00 AM to 7:00 PM IST.',
        link: { href: '/contact', label: 'Contact Us' },
    },
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return FAQS.filter((f) => {
            const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
            const matchesSearch = !term || f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term);
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm]);

    const toggle = (idx) => setOpenIndex((prev) => (prev === idx ? null : idx));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-primary-50">
            {/* Hero */}
            <div className="relative overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center text-white">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                        <HelpCircle className="w-6 h-6" />
                        <span className="font-semibold">Frequently Asked Questions</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        How Can We Help?
                    </h1>
                    <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Answers to what customers ask us most about ordering, delivery, returns and design services.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search questions…"
                            className="w-full pl-12 pr-4 py-3.5 rounded-full text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Category filter */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All Questions
                        </button>
                        {CATEGORIES.map((c) => {
                            const Icon = c.icon;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveCategory(c.id)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === c.id
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Q&A list */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-700 font-bold mb-1">No matching questions</p>
                        <p className="text-gray-500 text-sm mb-6">
                            Try a different search term, or reach out — we're happy to help directly.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((f, idx) => {
                            const isOpen = openIndex === idx;
                            const cat = CATEGORIES.find((c) => c.id === f.category);
                            const Icon = cat?.icon || HelpCircle;
                            return (
                                <div key={f.q} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <button
                                        onClick={() => toggle(idx)}
                                        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{f.q}</h3>
                                        </div>
                                        {isOpen ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.25rem] sm:pl-[4.75rem]">
                                            <p className="text-gray-600 text-sm leading-relaxed">{f.a}</p>
                                            {f.link && (
                                                <Link
                                                    href={f.link.href}
                                                    className="inline-flex items-center gap-1 mt-3 text-primary-600 text-sm font-semibold hover:underline"
                                                >
                                                    {f.link.label} →
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Still Have a Question?</h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Our team is happy to help with anything not covered here.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="mailto:info@homelineteam.com"
                            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            Email Us
                        </a>
                        <a
                            href="tel:+919611925494"
                            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" />
                            Call Us
                        </a>
                    </div>
                    <p className="text-primary-100 text-sm mt-6">Mon-Sat, 9:00 AM - 7:00 PM IST</p>
                </div>
            </div>
        </div>
    );
}
