'use client';

import React, { useState } from 'react';
import {
    RotateCcw,
    RefreshCw,
    ListChecks,
    Banknote,
    Truck,
    PackageCheck,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Phone,
    MapPin,
    ChevronDown,
    ChevronUp,
    Info,
} from 'lucide-react';

const RETURN_REASONS = [
    'Defective Product',
    'Wrong Item Received',
    'Not as Described',
    'Damaged During Shipping',
    'Changed Mind',
    'Wrong Size',
    'Quality Issue',
    'Other',
];

const STATUS_FLOW = [
    { label: 'Pending', desc: 'Your request has been submitted and is awaiting review.' },
    { label: 'Approved', desc: 'We\'ve accepted the request and are arranging pickup.' },
    { label: 'Processing', desc: 'Your return is being processed after pickup.' },
    { label: 'Shipped', desc: 'The item is on its way back to us.' },
    { label: 'Received', desc: 'We\'ve received the item and are inspecting it.' },
    { label: 'Completed', desc: 'Refund issued or exchange dispatched.' },
];

export default function ReturnsExchanges() {
    const [expandedSections, setExpandedSections] = useState({ eligibility: true });

    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const sections = [
        {
            id: 'eligibility',
            title: 'Eligibility for Return or Exchange',
            icon: CheckCircle,
            content: (
                <div className="space-y-4">
                    <div className="bg-primary-50 border-l-4 border-primary-400 p-6 rounded-r-lg">
                        <p className="text-primary-800 text-sm">
                            A return or exchange can be requested once your order status shows{' '}
                            <strong>Delivered</strong> — there's no need to wait, you can raise a request as soon
                            as it arrives.
                        </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        Requests are made per item, not per order — so if only one thing in your order has an
                        issue, only that item needs to be returned. The rest of your order is unaffected.
                    </p>
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-800 text-sm">
                            Curtains and blinds are cut to the measurements you provide, so it's worth
                            double-checking width, height and quantity before you confirm your order. That said,
                            we still accept wrong-size and change-of-mind returns on these — getting it right the
                            first time just saves you a pickup.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'how-to',
            title: 'How to Start a Return or Exchange',
            icon: RotateCcw,
            content: (
                <div className="space-y-4">
                    <div className="space-y-4">
                        {[
                            { step: '1', title: 'Open the order', desc: 'Go to My Orders and find the delivered order you want to return or exchange.' },
                            { step: '2', title: 'Tap Return/Exchange', desc: 'This opens the return request form for that order.' },
                            { step: '3', title: 'Choose return or exchange', desc: 'Pick "Return for Refund" to get your money back, or "Exchange" to replace the item.' },
                            { step: '4', title: 'Select items, reason & condition', desc: 'Choose the item(s), a reason for the return, and the condition they\'re in.' },
                            { step: '5', title: 'Add refund & pickup details', desc: 'For returns, share the bank account for your refund and the address we should collect the item from.' },
                            { step: '6', title: 'Submit & track', desc: 'You\'ll land on My Returns, where you can follow your request through to completion.' },
                        ].map((s) => (
                            <div key={s.step} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 font-semibold text-sm">{s.step}</span>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-900">{s.title}</h5>
                                    <p className="text-gray-600 text-sm">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a
                        href="/my-orders"
                        className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                        Go to My Orders
                    </a>
                </div>
            ),
        },
        {
            id: 'reasons',
            title: 'Accepted Return Reasons',
            icon: ListChecks,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 text-sm">
                        You'll pick one of these when you submit a request for each item:
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                        {RETURN_REASONS.map((reason) => (
                            <div key={reason} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                <span className="text-gray-700 text-sm font-medium">{reason}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            id: 'return-vs-exchange',
            title: 'Return vs. Exchange',
            icon: RefreshCw,
            content: (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
                        <h4 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5" /> Return for Refund
                        </h4>
                        <p className="text-primary-800 text-sm">
                            We collect the item and refund you to the bank account you provide once it's received
                            and inspected.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" /> Exchange
                        </h4>
                        <p className="text-blue-800 text-sm">
                            Tell us what you'd like instead — a different size or colour, for example — and our
                            team will contact you to arrange the swap.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'refunds',
            title: 'Refunds & Bank Details',
            icon: Banknote,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        For a return, we ask for your bank account details (account holder name, account number,
                        bank name and IFSC code) up front, so we're ready to transfer your refund as soon as the
                        return is approved and the item is received — no separate follow-up needed from you.
                    </p>
                    <div className="bg-green-50 border-l-4 border-green-400 p-5 rounded-r-lg">
                        <p className="text-green-800 text-sm">
                            You'll see the estimated refund amount on the request form before you submit, based
                            on the price of the item(s) you're returning.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'pickup',
            title: 'Return Pickup',
            icon: Truck,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        We arrange pickup for returned items — just confirm the address (it's pre-filled from
                        your order, but you can edit it) when you submit the request. There's nothing to courier
                        or drop off yourself.
                    </p>
                </div>
            ),
        },
        {
            id: 'tracking',
            title: 'Track or Cancel Your Request',
            icon: PackageCheck,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Every request moves through a clear set of stages, visible any time on the{' '}
                        <a href="/my-returns" className="text-primary-600 font-semibold hover:underline">My Returns</a>{' '}
                        page:
                    </p>
                    <div className="space-y-3">
                        {STATUS_FLOW.map((s, i) => (
                            <div key={s.label} className="flex items-start gap-3">
                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-gray-600 font-semibold text-xs">{i + 1}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{s.label}</p>
                                    <p className="text-gray-500 text-xs">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-start gap-3">
                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Rejected / Cancelled</p>
                                <p className="text-gray-500 text-xs">
                                    A request may be rejected on review, or you can cancel it yourself from My
                                    Returns while it's still Pending.
                                </p>
                            </div>
                        </div>
                    </div>
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
                            <RotateCcw className="w-6 h-6" />
                            <span className="font-semibold">Returns & Exchanges</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Returns & Exchanges
                        </h1>

                        <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Not quite right? Request a return or exchange straight from your order — here's how
                            it works, start to finish.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Clock className="w-4 h-4" />
                                <span>Request anytime after delivery</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Truck className="w-4 h-4" />
                                <span>Free pickup on returns</span>
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
                                <a
                                    href="/my-returns"
                                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-primary-500 text-primary-600 text-sm font-bold rounded-xl hover:bg-primary-50 transition-colors"
                                >
                                    View My Returns
                                </a>
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
                            Need Help With a Return?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                            Our team can help you pick the right reason, track a pickup, or sort out a refund
                            that's taking longer than expected.
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
                                <h3 className="font-semibold mb-2">Returns Address</h3>
                                <p className="text-primary-100 text-sm">B Narayanapura, Mahadevapura, Bengaluru, Karnataka 560093</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
