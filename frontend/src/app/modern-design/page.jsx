'use client';

import React, { useState, useEffect } from 'react';
import {
    Palette,
    Home,
    Building,
    Sparkles,
    ArrowRight,
    CheckCircle,
    Star,
    Users,
    Award,
    Camera,
    Lightbulb,
    Heart,
    Quote,
    ChevronRight,
    Play,
    Download,
    Phone,
    Mail,
    MapPin,
    Instagram,
    Facebook,
    Twitter,
    Youtube
} from 'lucide-react';
import Link from 'next/link';

export default function ModernDesign() {
    const [activeTab, setActiveTab] = useState('residential');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const designServices = [
        {
            icon: Home,
            title: 'Residential Design',
            description: 'Transform your home into a modern sanctuary with our comprehensive residential design services.',
            features: ['Space Planning', 'Color Consultation', 'Furniture Selection', 'Lighting Design'],
            price: 'Starting from ₹50,000'
        },
        {
            icon: Building,
            title: 'Commercial Design',
            description: 'Create inspiring workspaces that boost productivity and reflect your brand identity.',
            features: ['Office Layout', 'Brand Integration', 'Employee Wellness', 'Sustainability Focus'],
            price: 'Starting from ₹1,00,000'
        },
        {
            icon: Sparkles,
            title: 'Luxury Interiors',
            description: 'Exclusive high-end designs that combine luxury with functionality for discerning clients.',
            features: ['Custom Furniture', 'Premium Materials', 'Art Integration', 'Personal Styling'],
            price: 'Starting from ₹2,00,000'
        }
    ];

    const portfolioProjects = [
        {
            id: 1,
            title: 'Modern Minimalist Living Room',
            category: 'Residential',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
            description: 'A clean, contemporary living space with neutral tones and natural materials.',
            area: '450 sq ft',
            duration: '6 weeks',
            budget: '₹2.5 Lakhs'
        },
        {
            id: 2,
            title: 'Scandinavian Kitchen Design',
            category: 'Residential',
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
            description: 'Light-filled kitchen with white cabinetry and wooden accents.',
            area: '320 sq ft',
            duration: '4 weeks',
            budget: '₹1.8 Lakhs'
        },
        {
            id: 3,
            title: 'Corporate Office Space',
            category: 'Commercial',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
            description: 'Open-plan office design promoting collaboration and creativity.',
            area: '2000 sq ft',
            duration: '8 weeks',
            budget: '₹5.2 Lakhs'
        },
        {
            id: 4,
            title: 'Luxury Master Bedroom',
            category: 'Luxury',
            image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
            description: 'Opulent bedroom design with custom furniture and premium finishes.',
            area: '380 sq ft',
            duration: '5 weeks',
            budget: '₹4.5 Lakhs'
        },
        {
            id: 5,
            title: 'Modern Restaurant Interior',
            category: 'Commercial',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            description: 'Contemporary restaurant design with industrial elements and warm lighting.',
            area: '1200 sq ft',
            duration: '7 weeks',
            budget: '₹3.8 Lakhs'
        },
        {
            id: 6,
            title: 'Contemporary Bathroom',
            category: 'Residential',
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop',
            description: 'Spa-like bathroom with modern fixtures and natural stone finishes.',
            area: '180 sq ft',
            duration: '3 weeks',
            budget: '₹1.2 Lakhs'
        }
    ];

    const testimonials = [
        {
            name: 'Priya Sharma',
            location: 'Mumbai',
            project: '3BHK Apartment',
            rating: 5,
            text: 'The team transformed our outdated apartment into a modern masterpiece. Their attention to detail and creative solutions exceeded our expectations.',
            image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
        },
        {
            name: 'Rajesh Kumar',
            location: 'Delhi',
            project: 'Office Renovation',
            rating: 5,
            text: 'Professional, punctual, and incredibly talented. Our new office space has improved employee morale and productivity significantly.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        {
            name: 'Anita Patel',
            location: 'Bangalore',
            project: 'Luxury Villa',
            rating: 5,
            text: 'From concept to completion, the entire process was seamless. The final result is exactly what we envisioned and more.',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        }
    ];

    const processSteps = [
        {
            step: '01',
            title: 'Consultation',
            description: 'We discuss your vision, lifestyle, and budget to understand your needs.',
            icon: Users
        },
        {
            step: '02',
            title: 'Design Concept',
            description: 'Our team creates initial concepts and 3D visualizations for your approval.',
            icon: Lightbulb
        },
        {
            step: '03',
            title: 'Planning',
            description: 'Detailed project planning including timelines, materials, and cost breakdown.',
            icon: CheckCircle
        },
        {
            step: '04',
            title: 'Execution',
            description: 'Professional implementation with regular updates and quality control.',
            icon: Award
        }
    ];

    const filteredProjects = portfolioProjects.filter(project =>
        activeTab === 'all' || project.category.toLowerCase() === activeTab
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm font-medium">Award-Winning Design Studio</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Modern Design
                            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Redefined
                            </span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Transform your spaces with cutting-edge interior design that combines functionality,
                            aesthetics, and sustainability for the modern lifestyle.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/interior-design"
                            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-2"
                        >
                            Start Your Project
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button
                            onClick={() => setIsVideoModalOpen(true)}
                            className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center gap-2"
                        >
                            <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Watch Our Story
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-white/20">
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">500+</div>
                            <div className="text-gray-300">Projects Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">15+</div>
                            <div className="text-gray-300">Years Experience</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">98%</div>
                            <div className="text-gray-300">Client Satisfaction</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl sm:text-4xl font-bold text-white mb-2">25+</div>
                            <div className="text-gray-300">Awards Won</div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce"></div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                            Our Design Services
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            From concept to completion, we offer comprehensive design solutions
                            tailored to your unique vision and lifestyle.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {designServices.map((service, index) => (
                            <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <service.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                                <ul className="space-y-2 mb-6">
                                    {service.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                                    <Link
                                        href="/interior-design"
                                        className="group/btn bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2"
                                    >
                                        Learn More
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                            Our Portfolio
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Explore our latest projects and see how we transform spaces into
                            beautiful, functional environments.
                        </p>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap justify-center gap-4">
                            {['all', 'residential', 'commercial', 'luxury'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 capitalize ${activeTab === tab
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                                onClick={() => setSelectedProject(project)}
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                                            {project.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                                    <p className="text-gray-600 mb-4">{project.description}</p>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-gray-500">Area</div>
                                            <div className="font-semibold text-gray-900">{project.area}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Duration</div>
                                            <div className="font-semibold text-gray-900">{project.duration}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500">Budget</div>
                                            <div className="font-semibold text-gray-900">{project.budget}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                            Our Design Process
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We follow a systematic approach to ensure every project is delivered
                            on time, within budget, and exceeds expectations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {processSteps.map((step, index) => (
                            <div key={index} className="text-center group">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                            What Our Clients Say
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Don't just take our word for it. Here's what our satisfied clients
                            have to say about their experience with us.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-8 group hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>

                                <Quote className="w-8 h-8 text-blue-500 mb-4" />

                                <p className="text-gray-700 mb-6 leading-relaxed italic">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-gray-600 text-sm">{testimonial.location}</div>
                                        <div className="text-blue-600 text-sm font-medium">{testimonial.project}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                        Ready to Transform Your Space?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Let's discuss your project and create something extraordinary together.
                        Our team is ready to bring your vision to life.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/interior-design"
                            className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                        >
                            Start Your Project
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/contact"
                            className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" />
                            Schedule Consultation
                        </Link>
                    </div>
                </div>
            </section>

            {/* Project Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="relative">
                            <img
                                src={selectedProject.image}
                                alt={selectedProject.title}
                                className="w-full h-64 sm:h-80 object-cover rounded-t-2xl"
                            />
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    {selectedProject.category}
                                </span>
                            </div>

                            <h3 className="text-3xl font-bold text-gray-900 mb-4">{selectedProject.title}</h3>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">{selectedProject.description}</p>

                            <div className="grid grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{selectedProject.area}</div>
                                    <div className="text-gray-600">Area</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{selectedProject.duration}</div>
                                    <div className="text-gray-600">Duration</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{selectedProject.budget}</div>
                                    <div className="text-gray-600">Budget</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/interior-design"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                                >
                                    Start Similar Project
                                </Link>
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Modal */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Our Design Story</h3>
                            <button
                                onClick={() => setIsVideoModalOpen(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                            <div className="text-center text-white">
                                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Video content would be embedded here</p>
                                <p className="text-sm text-gray-400 mt-2">This is a placeholder for the actual video</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

