// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Read the injected env
const SUPABASE_URL     = window.ENV.SUPABASE_URL
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY
const supabase         = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Notification helper (unchanged)
function createNotification({ message, success = true }) {
  const container = document.getElementById('notification-list')
  if (!container) return
  container.innerHTML = ''
  const wrapper = document.createElement('div')
  wrapper.className =
    'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5'
  wrapper.innerHTML = `
    <div class="p-4">
      <div class="flex items-start">
        <div class="shrink-0">
          ${
            success
              ? `<svg class="size-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>`
              : `<svg class="size-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M18 6L6 18M6 6l12 12"/>
                </svg>`
          }
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-medium text-gray-900">${message}</p>
        </div>
        <div class="ml-4 flex shrink-0">
          <button aria-label="Close notification">
            <svg class="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72
                       a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72
                       a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72
                       a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`
  container.appendChild(wrapper)
  wrapper.querySelector('button').addEventListener('click', () => wrapper.remove())
}

// 3. Request OTP with optimistic UI + proper try/catch
document
  .getElementById('otp-request-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value.trim()

    // 3a. Immediate UI flip & “Sending…” toast
    document.getElementById('otp-request-form').classList.add('hidden')
    document.getElementById('otp-verify-form').classList.remove('hidden')
    createNotification({ message: 'Sending OTP…', success: true })

    try {
      // 3b. Fire the Supabase call
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error

      // 3c. Success update
      createNotification({ message: 'OTP sent! Check your email.', success: true })
      document.getElementById('code').focus()

    } catch (err) {
      // 3d. Revert UI on error
      document.getElementById('otp-request-form').classList.remove('hidden')
      document.getElementById('otp-verify-form').classList.add('hidden')
      createNotification({ message: err.message, success: false })
    }
  })

// 4. Verify OTP
document
  .getElementById('otp-verify-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('email').value.trim()
    const code  = document.getElementById('code').value.trim()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })
      if (error) throw error

      localStorage.setItem('idaic-token', data.session.access_token)
      createNotification({ message: 'Successfully signed in!', success: true })
      window.location.href = '/main.html'

    } catch (err) {
      createNotification({ message: err.message, success: false })
    }
  })
