import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { env } from './env'

const supabaseUrl = env.supabase.url
const supabaseAnonKey = env.supabase.anonKey

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Function to clear Supabase session
export const clearSupabaseSession = async () => {
  try {
    await supabase.auth.signOut()
    console.log('✅ Supabase session cleared')
  } catch (error) {
    console.error('Error clearing Supabase session:', error)
  }
}

// Note: Database operations should be done via API routes, not direct imports
// The dbService is only available on the server side
// DO NOT export db here as it contains server-side postgres imports