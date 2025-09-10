import dotenv from 'dotenv'
dotenv.config()

import { db } from './index'
import { users, userProfiles } from './schema'
import bcrypt from 'bcryptjs'
import postgres from 'postgres'
import { seedFAQs } from './seed-faqs'

// Database connection string
const connectionString = process.env.DATABASE_URL!

// Create postgres client
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    console.log('⚠️  Admin user creation removed for security.')
    console.log('📝 To create admin users, use the secure role management API.')
    console.log('🔐 Only superadmin users can create admin accounts.')

    // Seed FAQs with a placeholder admin ID (this should be updated to use actual admin)
    const placeholderAdminId = 'placeholder-admin-id'
    await seedFAQs(placeholderAdminId)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📋 Security Notes:')
    console.log('   - No hardcoded admin credentials')
    console.log('   - Use secure role management for admin creation')
    console.log('   - Only superadmin can create admin accounts')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed()
}

export { seed }
