import { createClient } from '@supabase/supabase-js'

// Use Vite environment variables (mapped from Netlify env vars in build command)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Basic Supabase client configuration
// Add additional helper functions here as needed


