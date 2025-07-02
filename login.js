<script type="module">
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

  // Netlify will inject these at build time
  const SUPABASE_URL   = import.meta.env.SUPABASE_URL
  const SUPABASE_KEY   = import.meta.env.SUPABASE_ANON_KEY
  const supabase       = createClient(SUPABASE_URL, SUPABASE_KEY)

  // … your OTP signInWithOtp / verifyOtp flow …
</script>
