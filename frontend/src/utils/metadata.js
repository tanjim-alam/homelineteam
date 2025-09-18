// Utility functions for generating dynamic SEO metadata

export const generateProductMetadata = (product) => {
  
  if (!product) return getDefaultMetadata();
  
  const { metaData, name, description, mainImages } = product;
  
  // Ensure keywords is always an array
  let keywords = metaData?.keywords;
  if (keywords && !Array.isArray(keywords)) {
    // If keywords is a string, split by commas
    keywords = keywords.split(',').map(k => k.trim()).filter(k => k);
  } else if (!keywords) {
    // Default keywords if none provided
    keywords = [name, 'home furnishings', 'homeline', 'quality furniture'];
  }
  
  return {
    title: metaData?.title || `${name} - Homeline`,
    description: metaData?.description || description || `Discover ${name} at Homeline. Premium home furnishings with quality and style.`,
    keywords: keywords,
    ogImage: metaData?.ogImage || (mainImages && mainImages.length > 0 ? mainImages[0] : '/default-product-image.jpg'),
    ogTitle: metaData?.title || name,
    ogDescription: metaData?.description || description || `Premium ${name} from Homeline`,
  };
};

export const generateCategoryMetadata = (category) => {
  
  if (!category) return getDefaultMetadata();
  
  const { metaData, name, description, image } = category;

  
  // Ensure keywords is always an array
  let keywords = metaData?.keywords;
  if (keywords && !Array.isArray(keywords)) {
    // If keywords is a string, split by commas
    keywords = keywords.split(',').map(k => k.trim()).filter(k => k);
  } else if (!keywords) {
    // Default keywords if none provided
    keywords = [name, 'collection', 'home furnishings', 'homeline', 'furniture'];
  }
  
  const generatedMetadata = {
    title: metaData?.title || `${name} Collection - Homeline`,
    description: metaData?.description || description || `Explore our ${name} collection at Homeline. Find the perfect pieces for your home.`,
    keywords: keywords,
    ogImage: metaData?.ogImage || image || '/default-category-image.jpg',
    ogTitle: metaData?.title || `${name} Collection`,
    ogDescription: metaData?.description || description || `Discover our ${name} collection`,
  };
  
  return generatedMetadata;
};

export const generateHomeMetadata = () => {
  return {
    title: 'Homeline - Premium Home Furnishings',
    description: 'Discover premium home furnishings and furniture at Homeline. Quality, style, and comfort for your perfect home.',
    keywords: ['home furnishings', 'furniture', 'homeline', 'premium furniture', 'home decor'],
    ogImage: '/hero-bg-1.jpg',
    ogTitle: 'Homeline - Premium Home Furnishings',
    ogDescription: 'Quality home furnishings and furniture for your perfect home',
  };
};

export const generateCollectionsMetadata = () => {
  return {
    title: 'Collections - Homeline',
    description: 'Explore our curated collections of premium home furnishings. Find the perfect style for every room.',
    keywords: ['collections', 'home furnishings', 'furniture', 'homeline', 'curated'],
    ogImage: '/hero-bg-2.jpg',
    ogTitle: 'Collections - Homeline',
    ogDescription: 'Curated collections of premium home furnishings',
  };
};

export const generateSearchMetadata = (query) => {
  return {
    title: `Search Results for "${query}" - Homeline`,
    description: `Find the perfect home furnishings matching "${query}" at Homeline. Quality products for your home.`,
    keywords: [query, 'search', 'home furnishings', 'furniture', 'homeline'],
    ogTitle: `Search: ${query}`,
    ogDescription: `Search results for ${query} at Homeline`,
  };
};

export const generateAboutMetadata = () => {
  return {
    title: 'About Us - Homeline',
    description: 'Learn about Homeline\'s commitment to quality home furnishings. Our story, values, and dedication to your home.',
    keywords: ['about us', 'homeline', 'company', 'values', 'home furnishings'],
    ogTitle: 'About Us - Homeline',
    ogDescription: 'Learn about Homeline\'s commitment to quality',
  };
};

export const generateContactMetadata = () => {
  return {
    title: 'Contact Us - Homeline',
    description: 'Get in touch with Homeline. We\'re here to help you find the perfect home furnishings and answer your questions.',
    keywords: ['contact', 'homeline', 'support', 'customer service', 'home furnishings'],
    ogTitle: 'Contact Us - Homeline',
    ogDescription: 'Get in touch with Homeline for support',
  };
};

export const generateCartMetadata = () => {
  return {
    title: 'Shopping Cart - Homeline',
    description: 'Review your shopping cart at Homeline. Add, remove, or modify items before checkout.',
    keywords: ['shopping cart', 'homeline', 'checkout', 'home furnishings'],
    ogTitle: 'Shopping Cart - Homeline',
    ogDescription: 'Review your shopping cart items',
  };
};

export const generateCheckoutMetadata = () => {
  return {
    title: 'Checkout - Homeline',
    description: 'Complete your purchase at Homeline. Secure checkout for your home furnishings.',
    keywords: ['checkout', 'purchase', 'homeline', 'payment', 'home furnishings'],
    ogTitle: 'Checkout - Homeline',
    ogDescription: 'Complete your purchase securely',
  };
};

const getDefaultMetadata = () => {
  return {
    title: 'Homeline - Premium Home Furnishings',
    description: 'Discover premium home furnishings and furniture at Homeline. Quality, style, and comfort for your perfect home.',
    keywords: ['home furnishings', 'furniture', 'homeline', 'premium'],
    ogImage: '/hero-bg-1.jpg',
    ogTitle: 'Homeline - Premium Home Furnishings',
    ogDescription: 'Quality home furnishings for your perfect home',
  };
};

// Helper function to generate structured data for products
export const generateProductStructuredData = (product) => {
  if (!product) return null;
  
  const { name, description, basePrice, mrp, mainImages, variants } = product;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": mainImages && mainImages.length > 0 ? mainImages : undefined,
    "brand": {
      "@type": "Brand",
      "name": "Homeline"
    },
    "offers": {
      "@type": "Offer",
      "price": basePrice,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Homeline"
      }
    }
  };
  
  // Add MRP if available
  if (mrp && mrp > basePrice) {
    structuredData.offers.highPrice = mrp;
    structuredData.offers.lowPrice = basePrice;
  }
  
  // Add variants if available
  if (variants && variants.length > 0) {
    structuredData.hasVariant = variants.map(variant => ({
      "@type": "Product",
      "name": `${name} - ${variant.fields && Object.values(variant.fields).join(' ') || 'Variant'}`,
      "offers": {
        "@type": "Offer",
        "price": variant.price || basePrice,
        "priceCurrency": "INR",
        "availability": (variant.stock && variant.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    }));
  }
  
  return structuredData;
};

// Helper function to generate structured data for categories
export const generateCategoryStructuredData = (category) => {
  if (!category) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "image": category.image,
    "url": `/collections/${category.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${category.name} Collection`
    }
  };
};
