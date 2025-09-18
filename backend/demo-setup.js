// Demo script to set up categories with variants
// This shows the complete structure for the variant system

const demoCurtainsCategory = {
    name: "Curtains",
    slug: "curtains",
    description: "Beautiful and elegant curtains for your home",
    seoContent: "<h2>Premium Curtain Collection</h2><p>Discover our exclusive range of curtains...</p>",
    metaData: {
        title: "Best Curtains Collection | HomeLine",
        description: "Discover our premium curtain collection with various styles, colors, and sizes",
        keywords: "curtains, home decor, window treatments, elegant curtains"
    },
    customFields: [
        {
            name: "Material",
            slug: "material",
            type: "dropdown",
            options: ["Cotton", "Polyester", "Silk", "Linen", "Velvet"],
            required: true,
            visibleOnProduct: true
        },
        {
            name: "Care Instructions",
            slug: "careInstructions",
            type: "text",
            required: false,
            visibleOnProduct: true
        }
    ],
    variantFields: [
        {
            name: "Size",
            slug: "size",
            type: "dropdown",
            options: ["Window - 5ft", "Window - 7ft", "Door - 7ft", "Long Door - 8ft", "Extra Long - 10ft"],
            required: true,
            unit: "ft",
            order: 1
        },
        {
            name: "Lining",
            slug: "lining",
            type: "dropdown",
            options: ["No Lining", "Normal Lining", "Blackout Lining", "Thermal Lining"],
            required: true,
            order: 2
        },
        {
            name: "Header",
            slug: "header",
            type: "dropdown",
            options: ["Eyelet", "Pleat", "Grommet", "Rod Pocket", "Tab Top"],
            required: true,
            order: 3
        },
        {
            name: "Color",
            slug: "color",
            type: "dropdown",
            options: ["Red", "Blue", "Green", "White", "Cream", "Gray", "Navy", "Black"],
            required: true,
            order: 4
        }
    ]
};

const demoBlindsProduct = {
    name: "Premium Roller Blinds",
    slug: "premium-roller-blinds",
    categoryId: "BLINDS_CATEGORY_ID", // Replace with actual ID
    basePrice: 899,
    description: "High-quality roller blinds with smooth operation...",
    hasVariants: true,
    variantOptions: {
        height: ["3 ft", "4 ft", "5 ft", "6 ft"],
        width: ["2 ft", "2.5 ft", "3 ft"],
        lining: ["Normal Lining", "Blackout Lining"]
    },
    variants: [
        {
            fields: {
                height: "4 ft",
                width: "2.5 ft",
                lining: "Normal Lining"
            },
            price: 899,
            mrp: 1199,
            discount: 25,
            stock: 30,
            images: ["blind-1.jpg", "blind-2.jpg"]
        },
        {
            fields: {
                height: "5 ft",
                width: "3 ft",
                lining: "Blackout Lining"
            },
            price: 1099,
            mrp: 1399,
            discount: 21,
            stock: 25,
            images: ["blind-3.jpg", "blind-4.jpg"]
        }
    ]
};

const demoBlindsCategory = {
    name: "Blinds",
    slug: "blinds",
    description: "Modern and functional blinds for your windows",
    seoContent: "<h2>Premium Blinds Collection</h2><p>Discover our modern blind solutions...</p>",
    metaData: {
        title: "Best Blinds Collection | HomeLine",
        description: "Discover our premium blind collection with various styles and sizes",
        keywords: "blinds, window blinds, roller blinds, venetian blinds, home decor"
    },
    customFields: [
        {
            name: "Material",
            slug: "material",
            type: "dropdown",
            options: ["PVC", "Aluminum", "Wood", "Fabric"],
            required: true,
            visibleOnProduct: true
        },
        {
            name: "Installation Type",
            slug: "installationType",
            type: "dropdown",
            options: ["Inside Mount", "Outside Mount"],
            required: true,
            visibleOnProduct: true
        }
    ],
    variantFields: [
        {
            name: "Height",
            slug: "height",
            type: "dropdown",
            options: ["3 ft", "4 ft", "5 ft", "6 ft", "7 ft"],
            required: true,
            unit: "ft",
            order: 1
        },
        {
            name: "Width",
            slug: "width",
            type: "dropdown",
            options: ["2 ft", "2.5 ft", "3 ft", "4 ft"],
            required: true,
            unit: "ft",
            order: 2
        },
        {
            name: "Lining",
            slug: "lining",
            type: "dropdown",
            options: ["Normal Lining", "Blackout Lining"],
            required: true,
            order: 3
        }
    ]
};

const demoCurtainsProduct = {
    name: "Elegant Grommet Curtains",
    slug: "elegant-grommet-curtains",
    categoryId: "CURTAINS_CATEGORY_ID", // Replace with actual ID
    basePrice: 1499,
    description: "Beautiful elegant curtains with grommet header design...",
    hasVariants: true,
    variantOptions: {
        size: [
            "Window - 5ft",
            "Window - 7ft",
            "Door - 7ft",
            "Long Door - 8ft",
            "Extra Long - 10ft"
        ],
        lining: [
            "No Lining",
            "Normal Lining",
            "Blackout Lining",
            "Thermal Lining"
        ],
        header: [
            "Eyelet",
            "Pleat",
            "Grommet",
            "Rod Pocket",
            "Tab Top"
        ],
        color: [
            "Red",
            "Blue",
            "Green",
            "White",
            "Cream",
            "Gray",
            "Navy",
            "Black"
        ]
    },
    variants: [
        {
            fields: {
                size: "Window - 5ft",
                lining: "No Lining",
                header: "Eyelet",
                color: "Red"
            },
            price: 1499,
            mrp: 1999,
            discount: 25,
            stock: 50,
            images: ["red-curtain-1.jpg", "red-curtain-2.jpg"]
        },
        {
            fields: {
                size: "Window - 5ft",
                lining: "No Lining",
                header: "Eyelet",
                color: "Blue"
            },
            price: 1499,
            mrp: 1999,
            discount: 25,
            stock: 45,
            images: ["blue-curtain-1.jpg", "blue-curtain-2.jpg"]
        },
        {
            fields: {
                size: "Window - 5ft",
                lining: "No Lining",
                header: "Eyelet",
                color: "Green"
            },
            price: 1499,
            mrp: 1999,
            discount: 25,
            stock: 40,
            images: ["green-curtain-1.jpg", "green-curtain-2.jpg"]
        },
        {
            size: "Window - 7ft",
            lining: "Blackout Lining",
            header: "Grommet",
            color: "Red",
            price: 1899,
            mrp: 2499,
            discount: 24,
            stock: 30,
            images: ["red-blackout-1.jpg", "red-blackout-2.jpg"]
        },
        {
            size: "Door - 7ft",
            lining: "Normal Lining",
            header: "Pleat",
            color: "Navy",
            price: 2199,
            mrp: 2799,
            discount: 21,
            stock: 25,
            images: ["navy-pleat-1.jpg", "navy-pleat-2.jpg"]
        },
        {
            size: "Long Door - 8ft",
            lining: "Thermal Lining",
            header: "Tab Top",
            color: "Cream",
            price: 2499,
            mrp: 3199,
            discount: 22,
            stock: 20,
            images: ["cream-thermal-1.jpg", "cream-thermal-2.jpg"]
        }
    ],
    metaData: {
        title: "Elegant Grommet Curtains | Multiple Sizes & Colors",
        description: "Beautiful elegant curtains available in multiple sizes, linings, headers, and colors. Perfect for any room.",
        keywords: "curtains, grommet curtains, window treatments, home decor"
    }
};

// Example of how variants work:
// Curtains variant system demonstration

module.exports = {
    demoCurtainsCategory,
    demoCurtainsProduct
};
