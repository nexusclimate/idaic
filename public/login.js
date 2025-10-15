// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Read the injected env
const SUPABASE_URL      = window.ENV.SUPABASE_URL
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY
const N8N_URL  = window.ENV.N8N_URL
const N8N_AUTH = window.ENV.N8N_AUTH
const supabase          = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Tab switching functionality
window.switchTab = function(tab) {
  const otpTab = document.getElementById('otp-tab')
  const passwordTab = document.getElementById('password-tab')
  const otpContent = document.getElementById('otp-content')
  const passwordContent = document.getElementById('password-content')
  
  if (tab === 'otp') {
    // Activate OTP tab
    otpTab.classList.add('border-[#FF9900]', 'text-[#FF9900]')
    otpTab.classList.remove('border-transparent', 'text-[#DCDCDC]')
    passwordTab.classList.add('border-transparent', 'text-[#DCDCDC]')
    passwordTab.classList.remove('border-[#FF9900]', 'text-[#FF9900]')
    
    // Show OTP content, hide password content
    otpContent.classList.remove('hidden')
    passwordContent.classList.add('hidden')
    
    // Reset password form
    document.getElementById('password').value = ''
  } else if (tab === 'password') {
    // Activate password tab
    passwordTab.classList.add('border-[#FF9900]', 'text-[#FF9900]')
    passwordTab.classList.remove('border-transparent', 'text-[#DCDCDC]')
    otpTab.classList.add('border-transparent', 'text-[#DCDCDC]')
    otpTab.classList.remove('border-[#FF9900]', 'text-[#FF9900]')
    
    // Show password content, hide OTP content
    passwordContent.classList.remove('hidden')
    otpContent.classList.add('hidden')
    
    // Reset OTP forms
    document.getElementById('email').value = ''
    document.getElementById('code').value = ''
    document.getElementById('otp-request-form').classList.remove('hidden')
    document.getElementById('otp-verify-form').classList.add('hidden')
    
    // Reset password form
    document.getElementById('password-email').value = ''
  }
}

// 2. Notification helper
function createNotification({ message, success = true, warning = false }) {
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
            success && !warning
              ? `<svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2l4-4" /></svg>`
              : warning
                ? `<svg class="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" /></svg>`
                : `<svg class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6m0-6l6 6" /></svg>`
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
      createNotification({ message: 'Your organization is not a member yet. Sign up or get in touch with the IDAIC team.', success: false, warning: true });
      return;
    }

    // 2. Check if user exists in users table
    let userExists = false;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (userData) userExists = true;
    } catch (err) {
      createNotification({ message: 'Error checking user database. Please try again.', success: false });
      return;
    }

    async function sendOtp() {
      createNotification({ message: 'Sending OTP…', success: true });
      return await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
    }

    if (!userExists) {
      createNotification({ message: 'You are not a registered user yet, but your organization is a member. We are setting you up now. Expect an OTP soon!', success: false });
      await new Promise(res => setTimeout(res, 700)); // was 1500ms, now 700ms
      try {
        // Extract project reference from SUPABASE_URL
        const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
        if (!projectRef) {
          throw new Error('Invalid Supabase URL format');
        }
        const provisionRes = await fetch(`https://${projectRef}.functions.supabase.co/UserLogin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const provisionResult = await provisionRes.json();
        if (provisionRes.ok) {
          // Wait for user to appear in users table (poll up to 1s)
          let userRowExists = false;
          for (let i = 0; i < 5; i++) { // was 10, now 5
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .eq('email', email)
              .maybeSingle();
            if (userData) {
              userRowExists = true;
              break;
            }
            await new Promise(res => setTimeout(res, 200));
          }
          if (!userRowExists) {
            createNotification({ message: 'Provisioned, but user record not found. Please try again in a moment.', success: false });
            return;
          }
          await new Promise(res => setTimeout(res, 200)); // was 500ms, now 200ms
          let retry = await sendOtp();
          if (!retry.error) {
            document.getElementById('otp-request-form').classList.add('hidden');
            document.getElementById('otp-verify-form').classList.remove('hidden');
            createNotification({ message: 'OTP sent! Please check your email for the login code.', success: true });
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
    } else {
      // User exists, send OTP as normal
      try {
        let { error } = await sendOtp();
        if (!error) {
          document.getElementById('otp-request-form').classList.add('hidden');
          document.getElementById('otp-verify-form').classList.remove('hidden');
          createNotification({ message: 'OTP sent! Check your email.', success: true });
          document.getElementById('code').focus();
          return;
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

// 5. Password Login
document
  .getElementById('password-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('password-email').value.trim()
    const password = document.getElementById('password').value.trim()
    
    // Basic validation
    if (!email || !password) {
      createNotification({ message: 'Please enter both email and password.', success: false })
      return
    }
    
    // Check if password matches IDAIC2025!
    if (password !== 'IDAIC2025!') {
      createNotification({ message: 'Invalid password. Please try again.', success: false })
      return
    }
    
    try {
      // Use the provided email for password-based login
      const adminEmail = email
      
      // For password login, we'll create a proper user in the database first
      let userId;
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminEmail)
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user with server-generated UUID
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{ email: adminEmail }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        userId = newUser.id;
      }

      // Create mock session with real UUID
      const mockSession = {
        access_token: 'password_login_' + Date.now(),
        user: {
          id: userId,
          email: adminEmail
        }
      }
      
      localStorage.setItem('idaic-token', mockSession.access_token)
      localStorage.setItem('idaic-password-login', 'true')
      localStorage.setItem('idaic-password-email', adminEmail)
      
      createNotification({ message: 'Successfully signed in with password!', success: true })
      
      // Track password login
      try {
        const ip = await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip);

        let geo = {};
        try {
          geo = await fetch(`https://ip-api.com/json/${ip}`).then(res => res.json());
        } catch (geoErr) {
          console.error('❌ Failed to fetch geo info:', geoErr);
        }

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

        const metadata = {
          user_id: userId,
          email: adminEmail,
          ip_address: ip,
          country: geo.country || 'Unknown',
          city: geo.city || 'Unknown',
          region: geo.regionName || geo.region || 'Unknown',
          device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          browser: detectBrowser(),
          os: detectOS(),
          user_agent: navigator.userAgent,
          login_time: new Date().toISOString(),
          login_method: 'password'
        };

        await supabase.from('user_logins').insert([metadata]);
        console.log('✅ Password login tracked:', metadata);
      } catch (trackErr) {
        console.error('❌ Failed to track password login:', trackErr);
      }
      
      setTimeout(() => {
        window.location.href = '/app'
      }, 1000)
      
      } catch (err) {
        createNotification({ message: 'Login failed. Please try again.', success: false })
      }
    } catch (err) {
      createNotification({ message: 'Login failed. Please try again.', success: false })
    }
  })