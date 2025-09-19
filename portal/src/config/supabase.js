import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Add real-time subscription helpers
export const subscribeToSubmissions = (callback) => {
  return supabase
    .channel('submissions_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profile_submissions'
      },
      callback
    )
    .subscribe()
}

// Helper function to get submissions with status
export const getSubmissionsWithStatus = async (status = null) => {
  let query = supabase
    .from('user_profile_submissions')
    .select(`
      id,
      email_status,
      email_sent_at,
      email_attempted_at,
      email_error,
      submitted_at,
      user_profiles (
        name,
        email,
        category
      )
    `)
    .order('submitted_at', { ascending: false })

  if (status) {
    query = query.eq('email_status', status)
  }

  const { data, error } = await query.limit(50)
  if (error) throw error
  return data
}

// Helper function to process pending emails
export const processPendingEmails = async () => {
  const response = await fetch('/.netlify/functions/processPendingEmails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw new Error('Failed to process emails')
  }

  return response.json()
}


