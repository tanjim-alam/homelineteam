import { Heart, Users, Award, Sparkles, CheckCircle, Star } from 'lucide-react';
import Metadata from '@/components/Metadata';
import { generateAboutMetadata } from '@/utils/metadata';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Passion for Design",
      description: "We believe every home deserves to be beautiful, comfortable, and uniquely yours."
    },
    {
      icon: Award,
      title: "Quality First",
      description: "Every product is crafted with the finest materials and attention to detail."
    },
    {
      icon: Users,
      title: "Customer Centric",
      description: "Your satisfaction is our priority. We're here to help you create your dream home."
    },
    {
      icon: Sparkles,
      title: "Innovation",
      description: "We constantly explore new designs and technologies to bring you the best."
    }
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "Started with a vision to transform Indian homes" },
    { year: "2021", title: "First 1000 Customers", description: "Reached our first major milestone" },
    { year: "2022", title: "Expanded Collections", description: "Added new product categories" },
    { year: "2023", title: "50,000+ Happy Customers", description: "Became a trusted name in home furnishings" },
    { year: "2024", title: "Innovation Hub", description: "Launched our design consultation services" }
  ];

  return (
    <>
      <Metadata {...generateAboutMetadata()} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-primary-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>
        
        <div className="relative z-10 container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-glass px-6 py-3 rounded-full shadow-lg mb-6">
            <Heart className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">Our Story</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            About{' '}
            <span className="text-gradient">
              HomeLine
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're passionate about helping Indian families create beautiful, comfortable, and inspiring homes. 
            Our journey began with a simple belief: every home deserves to be extraordinary.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize beautiful home design by making premium furnishings accessible to every Indian family. 
                We believe that a well-designed home has the power to transform lives, create memories, and inspire creativity.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From our humble beginnings in Mumbai, we've grown to serve thousands of happy customers across India, 
                helping them turn their houses into homes they love.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary-100 to-pink-100 rounded-3xl p-8 text-center">
              <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Heart className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Made with Love</h3>
              <p className="text-gray-600">
                Every product in our collection is thoughtfully selected and crafted with care, 
                ensuring it meets our high standards of quality and design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from product selection to customer service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small startup to a trusted name in home furnishings, here's how we've grown.
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-200 to-primary-400"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A passionate group of designers, craftsmen, and customer service experts dedicated to making your home beautiful.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-16 h-16 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Design Team</h3>
              <p className="text-gray-600">
                Our expert designers stay ahead of trends to bring you the latest in home fashion.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Control</h3>
              <p className="text-gray-600">
                Every product undergoes rigorous quality checks before reaching your home.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Support</h3>
              <p className="text-gray-600">
                Our friendly team is here to help you make the right choices for your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-primary-50">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Your Home Transformation?
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Join thousands of happy customers who have already transformed their homes with HomeLine. 
              Let's create something beautiful together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/collections" className="btn-primary group">
                <span>Explore Collections</span>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
              
              <a href="/contact" className="btn-secondary group">
                <span>Get in Touch</span>
                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
