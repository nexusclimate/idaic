// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Read the injected env
const SUPABASE_URL      = window.ENV.SUPABASE_URL
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY
const N8N_URL  = window.ENV.N8N_URL
const N8N_AUTH = window.ENV.N8N_AUTH
const supabase          = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Notification helper
function createNotification({ message, success = true }) {
  const container = document.getElementById('notification-list')
  if (!container) return
  container.innerHTML = ''
  const wrapper = document.createElement('div')
  wrapper.className =
    'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 font-inter'
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
                        d="M18 6L6 18M6 6l12 18"/>
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

// 3. Request OTP
document
  .getElementById('otp-request-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const domain = email.split('@')[1]?.toLowerCase();
    console.log('Checking domain:', domain);

    // 1. Check if domain is approved
    let domainApproved = false;
    try {
      const { data, error } = await supabase
        .from('org_domains')
        .select('*')
        .ilike('domain_email', domain)
        .maybeSingle();
      console.log('Supabase org_domains result:', data, error);
      if (data) domainApproved = true;
    } catch (err) {
      createNotification({ message: 'Error checking organization membership. Please try again.', success: false });
      return;
    }

    if (!domainApproved) {
      createNotification({ message: 'Your organization is not a member yet. Sign up or get in touch with the IDAIC team.', success: false });
      return;
    }

    async function sendOtp() {
      createNotification({ message: 'Sending OTP…', success: true });
      return await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
    }

    try {
      // Try to send OTP first
      let { error } = await sendOtp();
      if (!error) {
        document.getElementById('otp-request-form').classList.add('hidden');
        document.getElementById('otp-verify-form').classList.remove('hidden');
        createNotification({ message: 'OTP sent! Check your email.', success: true });
        document.getElementById('code').focus();
        return;
      }
      // If OTP fails with not found, try provisioning
      if (error.status === 422 || error.message.includes('Signups not allowed')) {
        console.log('🔍 Debug - User not found, starting provisioning flow');
        createNotification({ message: '⚠️ You are not a registered user yet, but some colleagues from your company are already members. We are setting you up now. Expect an OTP soon!', success: false });
        // Add a pause for user experience
        await new Promise(res => setTimeout(res, 1500));
        try {
          // Extract project reference from SUPABASE_URL
          const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
          if (!projectRef) {
            throw new Error('Invalid Supabase URL format');
          }
          console.log('🔍 Debug - Calling UserLogin function without auth headers');
          const provisionRes = await fetch(`https://${projectRef}.functions.supabase.co/UserLogin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const provisionResult = await provisionRes.json();
          console.log('🔍 Debug - Provision result:', provisionResult);
          if (provisionRes.ok) {
            console.log(' User provisioned successfully');
            await new Promise(res => setTimeout(res, 500));
            let retry = await sendOtp();
            if (!retry.error) {
              document.getElementById('otp-request-form').classList.add('hidden');
              document.getElementById('otp-verify-form').classList.remove('hidden');
              createNotification({ message: '✅ OTP sent! Please check your email for the login code.', success: true });
              document.getElementById('code').focus();
              return;
            } else {
              createNotification({ message: retry.error.message, success: false });
              return;
            }
          } else {
            createNotification({ message: provisionResult.error || 'Provisioning failed. Please contact support.', success: false });
            return;
          }
        } catch (fetchErr) {
          createNotification({ message: 'You are not a registered user and your organization is not a member yet. Sign up or get in touch with the IDAIC team.', success: false });
          return;
        }
      } else if (error.status === 500) {
        createNotification({ message: 'There was a problem sending your login code. Please try again or contact support.', success: false });
        return;
      } else {
        let friendlyMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Invalid login credentials. Please check your input.';
        } else if (error.message.includes('Rate limit exceeded')) {
          friendlyMessage = 'Too many attempts. Please wait a few minutes before trying again.';
        }
        createNotification({ message: friendlyMessage, success: false });
        return;
      }
    } catch (err) {
      let friendlyMessage = err.message;
      if (err.message.includes('Signups not allowed')) {
        friendlyMessage = 'This email is not registered. Please register as a member or contact support.';
      } else if (err.message.includes('Invalid login credentials')) {
        friendlyMessage = 'Invalid login credentials. Please check your input.';
      } else if (err.message.includes('Rate limit exceeded')) {
        friendlyMessage = 'Too many attempts. Please wait a few minutes before trying again.';
      }
      createNotification({ message: friendlyMessage, success: false });
    }
  });

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

      // Improved browser detection
      function detectBrowser() {
        if (navigator.userAgentData && navigator.userAgentData.brands) {
          const brands = navigator.userAgentData.brands.map(b => b.brand);
          if (brands.includes('Google Chrome')) return 'Chrome';
          if (brands.includes('Microsoft Edge')) return 'Edge';
          if (brands.includes('Chromium')) return 'Chromium';
          return brands[0] || 'Unknown';
        }
        const ua = navigator.userAgent;
        if (/chrome|crios|crmo/i.test(ua)) return 'Chrome';
        if (/firefox|fxios/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) return 'Safari';
        if (/edg/i.test(ua)) return 'Edge';
        if (/opr\//i.test(ua)) return 'Opera';
        return 'Unknown';
      }

      // Improved OS detection
      function detectOS() {
        if (navigator.userAgentData && navigator.userAgentData.platform) {
          return navigator.userAgentData.platform;
        }
        const ua = navigator.userAgent;
        if (/windows/i.test(ua)) return 'Windows';
        if (/macintosh|mac os x/i.test(ua)) return 'Mac';
        if (/linux/i.test(ua)) return 'Linux';
        if (/android/i.test(ua)) return 'Android';
        if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
        return 'Unknown';
      }

      // Track user login stats
      try {
        const ip = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip);

        let geo = {};
        try {
          // Use HTTPS for geolocation API
          geo = await fetch(`https://ip-api.com/json/${ip}`).then(res => res.json());
        } catch (geoErr) {
          console.error('❌ Failed to fetch geo info:', geoErr);
        }

        const user = data.user || {}; // data.user may be undefined, fallback to empty object
        const userId = data.user?.id || null;

        const metadata = {
          user_id: userId, // Store the Auth UUID
          email: user.email || document.getElementById('email').value.trim(),
          ip_address: ip,
          country: geo.country || 'Unknown',
          city: geo.city || 'Unknown',
          // Prefer regionName, fallback to region
          region: geo.regionName || geo.region || 'Unknown',
          device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          browser: detectBrowser(),
          os: detectOS(),
          user_agent: navigator.userAgent,
          login_time: new Date().toISOString()
        };

        await supabase.from('user_logins').insert([metadata]);
        console.log('✅ User login tracked:', metadata);
      } catch (trackErr) {
        console.error('❌ Failed to track user login:', trackErr);
      }

      window.location.href = '/app'

    } catch (err) {
      let friendlyMessage = err.message

      if (err.message.includes('Invalid login credentials')) {
        friendlyMessage = 'Invalid code. Please check your email or request a new OTP.'
      }

      createNotification({ message: friendlyMessage, success: false })
    }
  })