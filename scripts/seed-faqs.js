const { execSync } = require('child_process');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import and run the FAQ seeding
const { seedFAQs } = require('../lib/db/seed-faqs.ts');

async function runSeedFAQs() {
  try {
    console.log('🌱 Starting FAQ seeding...');
    await seedFAQs();
    console.log('✅ FAQ seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ FAQ seeding failed:', error);
    process.exit(1);
  }
}

runSeedFAQs();

