// Seeding script to populate categories in local database
require('dotenv').config();
const mongoose = require('mongoose');
const MainCategory = require('./models/MainCategory');
const Category = require('./models/Category');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homelineteam');
    console.log('✓ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('✓ Cleared existing categories');

    // Create or get main categories
    const mainCategories = await MainCategory.find();
    console.log(`✓ Found ${mainCategories.length} main categories`);

    if (mainCategories.length === 0) {
      console.log('⚠ No main categories found. Creating sample main categories...');
      const newMainCategories = await MainCategory.insertMany([
        { name: 'Hardwear', slug: 'hardwear', order: 1, isActive: true },
        { name: 'Floor Solution', slug: 'floor-solution', order: 2, isActive: true },
        { name: 'Wall Solution', slug: 'wall-solution', order: 3, isActive: true },
        { name: 'Window Solution', slug: 'window-solution', order: 4, isActive: true }
      ]);
      console.log(`✓ Created ${newMainCategories.length} main categories`);
    }

    // Get all main categories
    const allMainCategories = await MainCategory.find();

    // Sample categories to seed (matching your production data)
    const categoriesToSeed = [
      {
        name: 'Artificial Vertical Grass',
        slug: 'artificial-vertical-grass',
        description: 'Explore our artificial vertical grass collection featuring premium quality and modern designs.',
        mainCategoryId: allMainCategories[0]?._id, // Hardwear
        order: 1,
        isActive: true,
        customFields: [],
        variantFields: []
      },
      {
        name: 'Pvc Vinyl Flooring Planks',
        slug: 'pvc-vinyl-flooring-planks',
        description: 'Explore our pvc vinyl flooring planks collection featuring premium quality and modern designs.',
        mainCategoryId: allMainCategories[1]?._id, // Floor Solution
        order: 2,
        isActive: true,
        customFields: [],
        variantFields: []
      },
      {
        name: 'Curtain Accessories',
        slug: 'curtain-accessories',
        description: 'Explore our curtain accessories collection featuring premium quality and modern designs.',
        mainCategoryId: allMainCategories[3]?._id, // Window Solution
        order: 3,
        isActive: true,
        customFields: [],
        variantFields: []
      }
    ];

    // Insert categories
    const insertedCategories = await Category.insertMany(categoriesToSeed);
    console.log(`✓ Created ${insertedCategories.length} categories:`);
    insertedCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
