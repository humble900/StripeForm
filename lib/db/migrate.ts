import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection string
const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

// Create postgres client
const client = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
})

// Create drizzle instance
const db = drizzle(client, { schema })

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Test connection
    await client`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' })
    
    console.log('✅ Database migration completed successfully')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
}

export { runMigrations }
