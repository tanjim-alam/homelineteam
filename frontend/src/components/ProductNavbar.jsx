'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import api from '@/services/api';

export default function ProductNavbar() {
    const [mainCategories, setMainCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [hoveredCategory, setHoveredCategory] = useState(null);

    // Fetch main categories and their subcategories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Get hierarchical categories data
                const data = await api.getHierarchicalCategories();

                let categoriesData = [];
                if (data && Array.isArray(data)) {
                    categoriesData = data;
                } else if (data && data.categories && Array.isArray(data.categories)) {
                    categoriesData = data.categories;
                } else if (data && data.data && Array.isArray(data.data)) {
                    categoriesData = data.data;
                } else if (data && data.success && data.data && Array.isArray(data.data)) {
                    categoriesData = data.data;
                }

                if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                    setMainCategories(categoriesData);

                    // Create subcategories lookup
                    const subcategoriesMap = {};
                    categoriesData.forEach(mainCategory => {
                        if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
                            subcategoriesMap[mainCategory._id] = mainCategory.subcategories;
                        }
                    });
                    setSubcategories(subcategoriesMap);
                } else {
                    // Fallback to main categories only
                    const mainCategoriesData = await api.getMainCategories();
                    if (Array.isArray(mainCategoriesData)) {
                        setMainCategories(mainCategoriesData);
                    } else if (mainCategoriesData && Array.isArray(mainCategoriesData.data)) {
                        setMainCategories(mainCategoriesData.data);
                    }
                }
            } catch (error) {
                // Fallback to main categories only
                try {
                    const mainCategoriesData = await api.getMainCategories();
                    if (Array.isArray(mainCategoriesData)) {
                        setMainCategories(mainCategoriesData);
                    } else if (mainCategoriesData && Array.isArray(mainCategoriesData.data)) {
                        setMainCategories(mainCategoriesData.data);
                    }
                } catch (fallbackError) {
                    // Silent error handling
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <nav className="bg-gray-50 border-b border-gray-200">
                <div className="container-custom">
                    <div className="flex items-center justify-center py-3">
                        <div className="text-gray-500">Loading categories...</div>
                    </div>
                </div>
            </nav>
        );
    }

    if (!mainCategories || mainCategories.length === 0) {
        return null;
    }



    return (
        <nav className="sticky top-[66px] z-30">
            <div className="hidden lg:flex items-center justify-center bg-primary">
                <div className="container-custom ">
                    {/* Desktop Navigation */}
                    <div className="flex items-center space-x-6 xl:space-x-8">
                        {mainCategories.map((mainCategory) => (
                            <div
                                key={mainCategory._id || mainCategory.slug}
                                className="relative group"
                                onMouseEnter={() => setHoveredCategory(mainCategory._id || mainCategory.slug)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                {/* Main Category Link */}
                                <Link
                                    href={`/collections/${mainCategory.slug}`}
                                    className="flex items-center gap-1 text-white transition-colors font-medium py-1 px-3  whitespace-nowrap"
                                >
                                    {mainCategory.name}
                                    {subcategories[mainCategory._id] && subcategories[mainCategory._id].length > 0 && (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </Link>

                                {/* Subcategories Dropdown */}
                                {subcategories[mainCategory._id] &&
                                    subcategories[mainCategory._id].length > 0 &&
                                    hoveredCategory === (mainCategory._id || mainCategory.slug) && (
                                        <div className="absolute top-full left-0 w-64 bg-primary shadow-lg z-50">
                                            <div className="">
                                                {subcategories[mainCategory._id].map((subcategory) => (
                                                    <Link
                                                        key={subcategory._id || subcategory.slug}
                                                        href={`/${mainCategory.slug}/${subcategory.slug}`}
                                                        className="block px-4 py-2 text-md font-medium text-white border-b border-gray-200 transition-colors"
                                                    >
                                                        {subcategory.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tablet Navigation */}
                <div className="hidden md:flex lg:hidden items-center justify-center">
                    <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
                        {mainCategories.map((mainCategory) => (
                            <div
                                key={mainCategory._id || mainCategory.slug}
                                className="relative group flex-shrink-0"
                                onMouseEnter={() => setHoveredCategory(mainCategory._id || mainCategory.slug)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                {/* Main Category Link */}
                                <Link
                                    href={`/collections/${mainCategory.slug}`}
                                    className="flex items-center gap-1 text-gray-700 hover:text-primary-600 transition-colors font-medium py-2 px-3 rounded-lg hover:bg-white whitespace-nowrap"
                                >
                                    {mainCategory.name}
                                    {subcategories[mainCategory._id] && subcategories[mainCategory._id].length > 0 && (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </Link>

                                {/* Subcategories Dropdown */}
                                {subcategories[mainCategory._id] &&
                                    subcategories[mainCategory._id].length > 0 &&
                                    hoveredCategory === (mainCategory._id || mainCategory.slug) && (
                                        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                            <div className="py-2">
                                                {subcategories[mainCategory._id].map((subcategory) => (
                                                    <Link
                                                        key={subcategory._id || subcategory.slug}
                                                        href={`/${mainCategory.slug}/${subcategory.slug}`}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                                                    >
                                                        {subcategory.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </nav>
    );
}
