'use client';

import React, { useState } from 'react';
import {
    Truck,
    Package,
    PackageCheck,
    IndianRupee,
    MapPin,
    Clock,
    ShieldCheck,
    AlertTriangle,
    Globe,
    Mail,
    Phone,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Box,
} from 'lucide-react';

export default function ShippingInfo() {
    const [expandedSections, setExpandedSections] = useState({ processing: true });

    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const sections = [
        {
            id: 'processing',
            title: 'Order Processing Time',
            icon: Package,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        How quickly we hand your order to a courier depends on what you've bought — many of our
                        products are made to order rather than picked off a shelf.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
                            <h4 className="font-semibold text-primary-900 mb-1">Curtains &amp; Blinds</h4>
                            <p className="text-primary-800 text-sm">
                                Cut and stitched to your chosen size after you order. Allow{' '}
                                <strong>3-5 business days</strong> for production before dispatch.
                            </p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                            <h4 className="font-semibold text-green-900 mb-1">Wallpaper &amp; Cushion Covers</h4>
                            <p className="text-green-800 text-sm">
                                Dispatched from our Bengaluru warehouse within{' '}
                                <strong>1-2 business days</strong> of order confirmation.
                            </p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-1">Interior Design Packages (Kitchen, Wardrobe, 1BHK &amp; 2BHK)</h4>
                        <p className="text-gray-700 text-sm">
                            These follow a separate site-measurement and production schedule. Your design consultant
                            will confirm exact production and installation dates on your consultation call rather
                            than a fixed shipping window.
                        </p>
                    </div>
                    <p className="text-gray-500 text-sm">
                        Orders placed after 6:00 PM IST, or on Sundays and public holidays, begin processing the
                        next business day.
                    </p>
                </div>
            ),
        },
        {
            id: 'delivery',
            title: 'Delivery Timelines',
            icon: Truck,
            content: (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { label: 'Standard Delivery', value: '3-5 business days after dispatch', note: 'Most serviceable pin codes across India' },
                            { label: 'Express Delivery', value: '1-2 business days after dispatch', note: 'Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune & select metros' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-gray-900">{item.label}</p>
                                    <p className="text-gray-700 text-sm">{item.value}</p>
                                    <p className="text-gray-500 text-xs mt-1">{item.note}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-r-lg">
                        <p className="text-yellow-800 text-sm">
                            Remote or rural pin codes, and locations in the Northeast, Jammu &amp; Kashmir, and
                            Andaman &amp; Nicobar Islands, may need an additional 2-4 business days because of
                            courier network reach.
                        </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                        Put together, a made-to-measure curtain or blind order typically arrives within{' '}
                        <strong>7-10 business days</strong> of order confirmation, and ready-stock items (wallpaper,
                        cushion covers) within <strong>4-7 business days</strong>.
                    </p>
                </div>
            ),
        },
        {
            id: 'charges',
            title: 'Shipping Charges',
            icon: IndianRupee,
            content: (
                <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-green-900 mb-1">Free shipping on every order</h4>
                            <p className="text-green-800 text-sm">
                                We deliver anywhere in India at no extra cost, with no minimum order value. The
                                total shown at checkout is what you pay — no surprise charges on delivery.
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                        You can pay by Cash on Delivery or online (cards, UPI, netbanking, wallets via Razorpay) —
                        both are offered at no additional shipping cost.
                    </p>
                </div>
            ),
        },
        {
            id: 'areas',
            title: 'Delivery Areas & Installation',
            icon: MapPin,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        We currently deliver across India. Enter your delivery pin code at checkout and we'll
                        confirm serviceability and estimated delivery date for your address before you pay.
                    </p>
                    <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
                        <h4 className="font-semibold text-primary-900 mb-1">Professional Installation</h4>
                        <p className="text-primary-800 text-sm">
                            Full professional installation and in-home design consultation are available in
                            Bengaluru and select nearby cities. If you're outside our installation zone, your
                            order still ships pan-India — products arrive ready to install, and our team shares
                            setup guidance over call.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'tracking',
            title: 'Order Tracking',
            icon: PackageCheck,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Every order moves through <strong>Pending → Confirmed → Shipped → Delivered</strong>. You
                        can check the current status any time from the{' '}
                        <a href="/my-orders" className="text-primary-600 font-semibold hover:underline">My Orders</a>{' '}
                        page in your account.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Once your order is handed to our delivery partner, we'll share the courier and tracking
                        details for your shipment so you can follow it right up to your door.
                    </p>
                </div>
            ),
        },
        {
            id: 'packaging',
            title: 'Packaging & Quality Check',
            icon: Box,
            content: (
                <div className="space-y-3">
                    {[
                        'Curtains and blinds are rolled — not folded — and wrapped in protective covers to prevent creasing.',
                        'Wallpaper rolls travel in rigid cardboard tubes to keep the print and edges safe.',
                        'Cushion covers are sealed in poly-bags to keep them clean and crease-free.',
                        'Every item is quality-checked before it leaves our warehouse.',
                    ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            id: 'delays',
            title: 'Delays & Exceptions',
            icon: AlertTriangle,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Occasionally, delivery can run past the estimated window because of:
                    </p>
                    <ul className="space-y-2">
                        {[
                            'Weather disruptions or local courier network issues',
                            'Festive-season order surges (Diwali, New Year, wedding season)',
                            'Incomplete or incorrect delivery address details',
                            'Force majeure events beyond our control (strikes, natural disasters)',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-gray-700 text-sm">
                                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="text-gray-700 text-sm">
                        If your order is genuinely delayed, we'll reach out by SMS, email or a call rather than
                        leaving you to guess.
                    </p>
                </div>
            ),
        },
        {
            id: 'issues',
            title: 'Damaged, Missing or Wrong Items',
            icon: ShieldCheck,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Please inspect your package at the time of delivery wherever possible. If a product
                        arrives damaged, defective, or different from what you ordered, raise it from the{' '}
                        <a href="/my-returns" className="text-primary-600 font-semibold hover:underline">My Returns</a>{' '}
                        page — you can start a return or exchange request directly against the order.
                    </p>
                    <div className="bg-primary-50 border-l-4 border-primary-400 p-5 rounded-r-lg">
                        <p className="text-primary-800 text-sm">
                            Keep the original packaging until the issue is resolved — it helps our team process
                            damage-in-transit claims faster.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'international',
            title: 'International Shipping',
            icon: Globe,
            content: (
                <div className="space-y-3">
                    <p className="text-gray-700 leading-relaxed">
                        We currently ship within India only. We don't offer international shipping at this time —
                        if you'd like to order from outside India, write to us at{' '}
                        <a href="mailto:info@homelineteam.com" className="text-primary-600 font-semibold hover:underline">
                            info@homelineteam.com
                        </a>{' '}
                        and we'll let you know if we can help.
                    </p>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-primary-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center text-white">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                            <Truck className="w-6 h-6" />
                            <span className="font-semibold">Shipping & Delivery</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Shipping Info
                        </h1>

                        <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Free delivery across India for curtains, blinds, wallpaper, cushion covers and
                            interior design orders — here's exactly how it works.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <IndianRupee className="w-4 h-4" />
                                <span>Free shipping, pan-India</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Clock className="w-4 h-4" />
                                <span>Standard delivery in 3-5 business days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                                <nav className="space-y-2">
                                    {sections.map((section) => {
                                        const IconComponent = section.icon;
                                        return (
                                            <button
                                                key={section.id}
                                                onClick={() => toggleSection(section.id)}
                                                className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconComponent className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                                        {section.title}
                                                    </span>
                                                </div>
                                                {expandedSections[section.id] ? (
                                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="space-y-8">
                            {sections.map((section) => {
                                const IconComponent = section.icon;
                                return (
                                    <div key={section.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                                            </div>
                                            {expandedSections[section.id] ? (
                                                <ChevronUp className="w-6 h-6 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-6 h-6 text-gray-400" />
                                            )}
                                        </button>

                                        {expandedSections[section.id] && (
                                            <div className="px-6 pb-6 border-t border-gray-100 pt-6">
                                                {section.content}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            Questions About Your Delivery?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                            Our team is happy to help with delivery timelines, tracking, or installation
                            scheduling for your order.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <a
                                href="mailto:info@homelineteam.com"
                                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                Email Us
                            </a>
                            <a
                                href="tel:+919611925494"
                                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Phone className="w-5 h-5" />
                                Call Us
                            </a>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">Email Support</h3>
                                <p className="text-primary-100 text-sm">info@homelineteam.com</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">Phone Support</h3>
                                <p className="text-primary-100 text-sm">+91 9611925494 · Mon-Sat, 9 AM-7 PM IST</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">Ships From</h3>
                                <p className="text-primary-100 text-sm">Bengaluru, Karnataka</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
