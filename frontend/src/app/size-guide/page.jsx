'use client';

import React, { useState } from 'react';
import {
    Ruler,
    PanelLeft,
    Calculator,
    Square,
    SlidersHorizontal,
    Lightbulb,
    CheckCircle,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

export default function SizeGuide() {
    const [expandedSections, setExpandedSections] = useState({ curtains: true });

    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const sections = [
        {
            id: 'curtains',
            title: 'Curtains — How to Measure',
            icon: Ruler,
            content: (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
                            <h4 className="font-semibold text-primary-900 mb-1">Rod / Track Width</h4>
                            <p className="text-primary-800 text-sm">
                                Measure the full length of the rod or track end to end — not the window itself.
                                For a well-draped look, curtains typically need 1.5-2x the rod width in fabric
                                fullness.
                            </p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                            <h4 className="font-semibold text-green-900 mb-1">Drop / Length</h4>
                            <p className="text-green-800 text-sm">
                                Measure from the rod or track down to where you want the curtain to end — the
                                floor, the sill, or a few inches below the sill are the usual choices.
                            </p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <p className="text-gray-700 text-sm">
                            <strong>Rod-pocket vs. eyelet:</strong> eyelet (grommet) curtains hang a little closer
                            to the rod, so they need a slightly shorter drop measurement than rod-pocket styles.
                        </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                        On the product page, enter your width and height in the unit shown and the price updates
                        automatically for your exact size.
                    </p>
                </div>
            ),
        },
        {
            id: 'blinds',
            title: 'Blinds — How to Measure',
            icon: PanelLeft,
            content: (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-1">Inside Mount</h4>
                            <p className="text-blue-800 text-sm">
                                Measure the exact width and height inside the window recess. This gives a neater,
                                built-in finish, but needs enough recess depth to fit the brackets.
                            </p>
                        </div>
                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                            <h4 className="font-semibold text-amber-900 mb-1">Outside Mount</h4>
                            <p className="text-amber-800 text-sm">
                                Measure the area you want covered, extending a few cm beyond the window frame on
                                each side and above the top for better light and privacy coverage.
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                        Always measure at two points — top and bottom for width, left and right for height — and
                        use the smaller reading for inside mount or the larger reading for outside mount, since
                        walls and recesses are rarely perfectly even.
                    </p>
                </div>
            ),
        },
        {
            id: 'wallpaper',
            title: 'Wallpaper — Roll Coverage Calculator',
            icon: Calculator,
            content: (
                <div className="space-y-4">
                    <div className="bg-primary-50 border-l-4 border-primary-400 p-6 rounded-r-lg">
                        <p className="text-primary-800 text-sm">
                            A standard roll covers roughly <strong>57 sq ft</strong> of wall (about 21in × 33ft) —
                            that's the default our calculator uses unless a specific product lists a different
                            roll size.
                        </p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        On any wallpaper product page, enter your wall's width and height in feet and we'll
                        estimate the number of rolls and the total cost for you — no separate math needed.
                    </p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-sm">
                            The calculator estimates exact coverage — it doesn't add extra for wastage. For bold
                            or patterned designs that need to be matched at the seams, we'd suggest ordering one
                            roll more than the estimate to cover trims and corners.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'cushions',
            title: 'Cushion Covers — Standard Sizes',
            icon: Square,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Cushion covers are generally offered in standard inch sizes — commonly{' '}
                        <strong>12″×12″, 16″×16″, 18″×18″ and 20″×20″</strong>. Check the "Select Options" section
                        on each product page for the exact sizes available for that design.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['12″ × 12″', '16″ × 16″', '18″ × 18″', '20″ × 20″'].map((size) => (
                            <div key={size} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="font-bold text-gray-900 text-sm">{size}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-500 text-sm">
                        Measure your cushion insert edge-to-edge — covers are made to fit that size snugly for a
                        filled, non-baggy look rather than a loose one.
                    </p>
                </div>
            ),
        },
        {
            id: 'custom-size',
            title: 'Ordering a Custom Size',
            icon: SlidersHorizontal,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                        Many of our curtain and blind products let you enter your own width and height directly
                        on the product page instead of picking from preset options.
                    </p>
                    <div className="space-y-3">
                        {[
                            'The unit used — mm, cm or ft — is shown for that product.',
                            'A minimum and maximum size is set per product; enter a value inside that range.',
                            'Your price is calculated live from a base price per unit as soon as you enter a size.',
                        ].map((item) => (
                            <div key={item} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                        <p className="text-amber-800 text-sm">
                            If a product doesn't show custom size fields, it's only available in the preset
                            options listed. Use <strong>Book Now</strong> on that product to ask our team about a
                            custom order.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: 'tips',
            title: 'Measuring Tips',
            icon: Lightbulb,
            content: (
                <div className="space-y-3">
                    {[
                        'Use a steel measuring tape, not a fabric one — it won\'t stretch and gives a more accurate reading.',
                        'Measure twice — window and wall dimensions are rarely perfectly even, so take two readings and go with the more conservative one.',
                        'Round to the nearest unit shown for the product rather than estimating in a different unit and converting.',
                        'When in doubt, go slightly larger for curtains and blinds, and slightly over for wallpaper — trimming excess is easier than running short mid-installation.',
                    ].map((tip) => (
                        <div key={tip} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{tip}</span>
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-primary-50">
            {/* Hero */}
            <div className="relative overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center text-white">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                            <Ruler className="w-6 h-6" />
                            <span className="font-semibold">Size Guide</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Get the Fit Right
                        </h1>

                        <p className="text-xl sm:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                            How to measure for curtains, blinds, wallpaper and cushion covers — plus how our
                            custom-size and roll calculator tools work.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Custom sizes priced live on the product page</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Calculator className="w-4 h-4" />
                                <span>Built-in wallpaper roll calculator</span>
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

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                            Not Sure About Your Measurements?
                        </h2>
                        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                            Use "Book Now" on any product to request a callback, or reach our team directly — we
                            offer free in-home design consultation in Bengaluru and select nearby cities, and can
                            help remotely everywhere else.
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
                        <p className="text-primary-100 text-sm">Mon-Sat, 9:00 AM - 7:00 PM IST</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
