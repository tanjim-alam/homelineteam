'use client';

import React, { useState } from 'react';
import {
    Shield,
    Lock,
    Eye,
    Globe,
    Mail,
    Phone,
    MapPin,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    AlertTriangle,
    FileText,
    Users,
    Database,
    Cookie,
    Building,
    MessageSquare,
    ShieldCheck,
    ArrowRight,
    Download,
    Calendar,
    Clock,
    Target
} from 'lucide-react';

export default function PrivacyPolicy() {
    const [expandedSections, setExpandedSections] = useState({});
    const [activeTab, setActiveTab] = useState('overview');

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'data', label: 'Data Collection', icon: Database },
        { id: 'usage', label: 'Data Usage', icon: Users },
        { id: 'security', label: 'Security', icon: ShieldCheck },
        { id: 'rights', label: 'Your Rights', icon: CheckCircle }
    ];

    const sections = [
        {
            id: 'introduction',
            title: 'Personal Information Collection, Use, Disclosure and Consent',
            icon: Shield,
            content: (
                <div className="space-y-6">
                    <div className="bg-primary-50 border-l-4 border-primary-400 p-6 rounded-r-lg">
                        <div className="flex items-start">
                            <AlertTriangle className="w-6 h-6 text-primary-600 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="text-lg font-semibold text-primary-900 mb-2">What We Collect</h4>
                                <p className="text-primary-800">
                                    Personal Information may include your name, email address, age, home address, phone number,
                                    marital status, income, credit history, medical information, education, employment information
                                    and social registration numbers.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            We are committed to providing our clients, customers, members ("you", "your" or "them") with
                            exceptional service. Providing exceptional service may involve the collection, use and, at times,
                            the disclosure of your Personal Information. Protecting your Personal Information is one of our
                            highest priorities.
                        </p>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                            While we have always respected your privacy and safeguarded all Personal Information, we have
                            strengthened our commitment to this goal. This is to continue to provide exceptional service to
                            you and to comply with all laws regarding the collection, use and disclosure of Personal Information.
                        </p>
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            We will inform you of why and how we collect, use and disclose Personal Information; obtain your
                            consent, as required; and handle Personal Information according to applicable law. Our privacy
                            commitment includes ensuring the accuracy, confidentiality, and security of your Personal Information
                            and allowing you to request access to, and correction of, your personal information.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'purposes',
            title: 'Purposes for Collection',
            icon: Target,
            content: (
                <div className="space-y-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                        We will only collect Personal Information that is necessary to fulfill the following purposes:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            'To verify identity',
                            'To identify your preferences',
                            'To open and manage an account',
                            'To ensure you receive a high standard of service',
                            'To meet regulatory requirements',
                            'Other legal reasons as apply to the goods and services requested'
                        ].map((purpose, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <span className="text-gray-700 font-medium">{purpose}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: 'consent',
            title: 'Consent Management',
            icon: CheckCircle,
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Lock className="w-5 h-5 text-purple-600 mr-2" />
                            How We Obtain Consent
                        </h4>
                        <p className="text-gray-700 mb-4">
                            We will obtain your consent to collect, use or disclose Personal Information. In some cases,
                            we can do so without your consent (see below). You can provide consent orally, in writing,
                            electronically or through an authorized representative.
                        </p>
                        <p className="text-gray-700">
                            You provide implied consent where our purpose for collecting using or disclosing your Personal
                            Information would be considered obvious or reasonable in the circumstances.
                        </p>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                        <h4 className="text-lg font-semibold text-red-900 mb-3">When We May Collect Without Consent</h4>
                        <ul className="space-y-2 text-red-800">
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                When permitted or required by law
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                In an emergency that threatens an individual's life, health, or personal security
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                When the Personal Information is available from a public source
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                                For the purposes of collecting a debt or protection from fraud
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'data-protection',
            title: 'Data Protection & Security',
            icon: ShieldCheck,
            content: (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-primary-50 p-6 rounded-xl">
                            <h4 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Data Protection
                            </h4>
                            <ul className="space-y-3 text-primary-800">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <span>We will not sell your Personal Information to other parties</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <span>We retain data only as long as necessary</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <span>We ensure accuracy and completeness</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                                    <span>You can request corrections to your data</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl">
                            <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                                <Lock className="w-5 h-5 mr-2" />
                                Security Measures
                            </h4>
                            <ul className="space-y-3 text-green-800">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Passwords and encryption</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Firewalls and restricted access</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Secure data destruction</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Regular security audits</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'log-data',
            title: 'Log Data & Analytics',
            icon: Eye,
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                        <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            What We Track
                        </h4>
                        <p className="text-indigo-800 mb-4">
                            We may collect information that your browser sends whenever you visit our Service ("Log Data").
                            This Log Data may include:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                'IP Address',
                                'Browser Type & Version',
                                'Pages Visited',
                                'Time & Date of Visit',
                                'Time Spent on Pages',
                                'Referring Website'
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-indigo-700">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                        <h4 className="text-lg font-semibold text-yellow-900 mb-2">Third-Party Analytics</h4>
                        <p className="text-yellow-800">
                            We may use third party services such as Google Analytics that collect, monitor and
                            analyze this type of information. These third party service providers have their own
                            privacy policies addressing how they use such information.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'cookies',
            title: 'Cookies Policy',
            icon: Cookie,
            content: (
                <div className="space-y-6">
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                        <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                            <Cookie className="w-5 h-5 mr-2" />
                            What Are Cookies?
                        </h4>
                        <p className="text-orange-800 mb-4">
                            Cookies are files with small amount of data, which may include an anonymous unique identifier.
                            Cookies are sent to your browser from a web site and stored on your computer's hard drive.
                        </p>
                        <div className="bg-white p-4 rounded-lg">
                            <h5 className="font-semibold text-orange-900 mb-2">Cookie Settings</h5>
                            <p className="text-orange-700 text-sm">
                                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                However, if you do not accept cookies, you may not be able to use some portions of our Service.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'international',
            title: 'International Data Transfer',
            icon: Globe,
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                            <Globe className="w-5 h-5 mr-2" />
                            Data Transfer Information
                        </h4>
                        <p className="text-blue-800 mb-4">
                            Your information, including Personal Information, may be transferred to — and maintained on —
                            computers located outside of your province, country or other governmental jurisdiction where
                            the data protection laws may differ than those from your jurisdiction.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-blue-300">
                            <h5 className="font-semibold text-blue-900 mb-2">India Processing</h5>
                            <p className="text-blue-700 text-sm">
                                If you are located outside India and choose to provide information to us, please note that we
                                transfer the information, including Personal Information, to India and process it there.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'children',
            title: 'Children\'s Privacy',
            icon: Users,
            content: (
                <div className="space-y-6">
                    <div className="bg-pink-50 border-l-4 border-pink-400 p-6 rounded-r-lg">
                        <h4 className="text-lg font-semibold text-pink-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Age Restrictions
                        </h4>
                        <p className="text-pink-800 mb-4">
                            Our Service does not address anyone under the age of 18 ("Minor").
                        </p>
                        <p className="text-pink-800 mb-4">
                            We do not knowingly collect personally identifiable information from Minors. If you are a parent
                            or guardian and you are aware that your Minor has provided us with Personal Information, please
                            contact us.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-pink-300">
                            <p className="text-pink-700 text-sm font-medium">
                                If we become aware that we have collected Personal Information from Minors without verification
                                of parental consent, we take steps to remove that information from our servers.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'changes',
            title: 'Policy Changes',
            icon: Calendar,
            content: (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            How We Notify You
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-semibold text-sm">1</span>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-900">Website Updates</h5>
                                    <p className="text-gray-600 text-sm">We will notify you of any changes by posting the new Privacy Policy on this page.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-semibold text-sm">2</span>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-900">Email Notification</h5>
                                    <p className="text-gray-600 text-sm">For material changes, we will notify you through the email address you have provided us.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-semibold text-sm">3</span>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-900">Website Notice</h5>
                                    <p className="text-gray-600 text-sm">We may place a prominent notice on our website for significant changes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-red-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-primary">
                <div className="absolute inset-0 bg-primary"></div>
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-primary"
                    ></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-primary">
                    <div className="text-center text-white">
                        <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                            <Shield className="w-6 h-6" />
                            <span className="font-semibold">Privacy & Data Protection</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Privacy Policy
                        </h1>

                        <p className="text-xl sm:text-2xl text-red-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Your privacy matters to us. Learn how we collect, use, and protect your personal information.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Calendar className="w-4 h-4" />
                                <span>Last updated: November 10, 2020</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Clock className="w-4 h-4" />
                                <span>Reading time: 8 minutes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
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
                                            <div className="px-6 pb-6 border-t border-gray-100">
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
                            Questions About Your Privacy?
                        </h2>
                        <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                            We're here to help. Contact us if you have any questions about our privacy practices or your personal data.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <a
                                href="mailto:support@homelineteam.com"
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
                                <p className="text-red-100 text-sm">support@homelineteam.com</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">Phone Support</h3>
                                <p className="text-red-100 text-sm">+91-9611 925 494</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">Location</h3>
                                <p className="text-red-100 text-sm">India</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}