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

    // Create super admin user (using Firebase UID as ID)
    const superAdminPassword = 'admin123'
    const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12)
    const superAdminFirebaseUid = 'xBesp0ZBq5h0vS34Ka6eIvFRkmf1' // From migration

    let superAdmin
    try {
      [superAdmin] = await db.insert(users).values({
        id: superAdminFirebaseUid,
        email: 'admin@stripeform.com',
        passwordHash: superAdminPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        status: 'active',
        emailVerified: true,
        subscriptionTier: 'enterprise',
        subscriptionStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning()
      console.log('✅ Super admin user created:', superAdmin.email)
    } catch (error: any) {
      if (error.code === '23505') { // Duplicate key error
        console.log('ℹ️ Super admin user already exists')
        superAdmin = { id: superAdminFirebaseUid, email: 'admin@stripeform.com' }
      } else {
        throw error
      }
    }

    // Create super admin profile
    await db.insert(userProfiles).values({
      userId: superAdmin.id,
      company: 'StripeForm',
      bio: 'System Administrator',
      timezone: 'UTC',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log('✅ Super admin user created:', superAdmin.email)
    console.log('📝 Password:', superAdminPassword)

    // Create regular admin user
    const adminPassword = 'admin123'
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12)
    const adminFirebaseUid = 'admin-example-uid-123' // Generate a test Firebase UID

    const [admin] = await db.insert(users).values({
      id: adminFirebaseUid,
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      subscriptionTier: 'pro',
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    // Create admin profile
    await db.insert(userProfiles).values({
      userId: admin.id,
      company: 'Example Corp',
      bio: 'Administrator',
      timezone: 'UTC',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    console.log('✅ Admin user created:', admin.email)
    console.log('📝 Password:', adminPassword)

    // Seed FAQs
    await seedFAQs(admin.id)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📋 Created users:')
    console.log(`   - Super Admin: ${superAdmin.email} (${superAdminPassword})`)
    console.log(`   - Admin: ${admin.email} (${adminPassword})`)

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
