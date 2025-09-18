'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const ModernCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features = [], 
  href, 
  buttonText, 
  gradientFrom, 
  gradientTo, 
  hoverBorderColor = 'gray-200',
  className = ''
}) => {
  return (
    <div className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-${hoverBorderColor} ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom}/5 ${gradientTo}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className="relative p-8">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
        
        {features.length > 0 && (
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        {href && buttonText && (
          <Link 
            href={href}
            className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white font-semibold px-6 py-3 rounded-xl hover:from-${gradientFrom.split('-')[0]}-600 hover:to-${gradientTo.split('-')[0]}-600 transition-all duration-300 group-hover:scale-105 shadow-lg`}
          >
            {buttonText}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ModernCard;
