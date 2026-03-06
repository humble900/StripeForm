import dotenv from 'dotenv'
dotenv.config()

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection string
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create postgres client
const client = postgres(connectionString, {
  max: 5,
  idle_timeout: 30,
  connect_timeout: 30,
  max_lifetime: 60 * 30, // 30 minutes
  prepare: false, // Disable prepared statements for better compatibility
})

// Create drizzle instance
export const db = drizzle(client, { schema })

// Export schema for migrations
export * from './schema'

// Export database service
export { dbService } from './service'

// Database connection test
export async function testConnection() {
  try {
    await client`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Close database connection
export async function closeConnection() {
  await client.end()
}
