// login.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// 1. Read the injected env
const SUPABASE_URL      = window.ENV.SUPABASE_URL
const SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY
const N8N_URL  = window.ENV.N8N_URL
const N8N_AUTH = window.ENV.N8N_AUTH
const supabase          = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper function to get redirect URL after login
function getRedirectUrl() {
  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');
  
  if (returnTo) {
    // Store in localStorage for App.jsx to pick up
    localStorage.setItem('idaic-requested-page', returnTo);
    return `/app?page=${encodeURIComponent(returnTo)}`;
  }
  
  // Check localStorage for requested page
  const requestedPage = localStorage.getItem('idaic-requested-page');
  if (requestedPage) {
    return `/app?page=${encodeURIComponent(requestedPage)}`;
  }
  
  // Default redirect
  return '/app';
}

// Check if user was redirected due to blocked role
window.addEventListener('DOMContentLoaded', () => {
  const blockedRole = localStorage.getItem('idaic-blocked-role');
  if (blockedRole) {
    localStorage.removeItem('idaic-blocked-role');
    if (blockedRole === 'new') {
      createNotification({ 
        message: 'Your account is pending approval. The IDAIC team will review your submission and get in touch with you soon.', 
        success: false, 
        warning: true 
      });
    } else if (blockedRole === 'declined') {
      createNotification({ 
        message: 'Access to your account has been declined. Please contact the IDAIC team if you believe this is an error.', 
        success: false 
      });
    }
  }
});

// Enhanced browser and OS detection functions
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

function detectBrowserVersion() {
  const ua = navigator.userAgent;
  const match = ua.match(/(?:Chrome|Firefox|Safari|Edge|Opera)\/(\d+)/i);
  return match ? match[1] : 'Unknown';
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

// Enhanced device and browser metadata collection
function getEnhancedDeviceMetadata() {
  const metadata = {
    device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    browser: detectBrowser(),
    browser_version: detectBrowserVersion(),
    os: detectOS(),
    user_agent: navigator.userAgent,
    language: navigator.language || 'Unknown',
    languages: navigator.languages ? navigator.languages.join(',') : 'Unknown',
    platform: navigator.platform || 'Unknown',
    cookie_enabled: navigator.cookieEnabled ? 'Yes' : 'No',
    do_not_track: navigator.doNotTrack || 'Unknown',
    screen_width: window.screen ? window.screen.width : null,
    screen_height: window.screen ? window.screen.height : null,
    screen_color_depth: window.screen ? window.screen.colorDepth : null,
    viewport_width: window.innerWidth || null,
    viewport_height: window.innerHeight || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
    timezone_offset: new Date().getTimezoneOffset(),
    online_status: navigator.onLine ? 'Online' : 'Offline',
    hardware_concurrency: navigator.hardwareConcurrency || null,
    device_memory: navigator.deviceMemory || null
  };
  
  return metadata;
}

// Shared function to fetch IP and geolocation data with enhanced metadata
async function fetchIPAndLocation() {
  let ip = 'Unknown';
  let geo = {
    country: 'Unknown',
    countryCode: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    regionCode: 'Unknown',
    timezone: 'Unknown',
    isp: 'Unknown',
    org: 'Unknown',
    asn: 'Unknown',
    latitude: null,
    longitude: null,
    postalCode: 'Unknown'
  };

  try {
    // Try multiple IP services with fallbacks for better reliability
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://api64.ipify.org?format=json',
      'https://icanhazip.com',
      'https://ifconfig.me/ip'
    ];

    for (const service of ipServices) {
      try {
        const ipResponse = await Promise.race([
          fetch(service, { 
            method: 'GET',
            headers: service.includes('ipify') ? { 'Accept': 'application/json' } : {}
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('IP fetch timeout')), 3000))
        ]);
        
        if (ipResponse.ok) {
          let fetchedIP = 'Unknown';
          
          // Handle different response formats
          if (service.includes('ipify')) {
            try {
              const ipData = await ipResponse.json();
              fetchedIP = ipData.ip || 'Unknown';
            } catch (jsonErr) {
              console.warn(`⚠️ Failed to parse JSON from ${service}:`, jsonErr);
              continue; // Try next service
            }
          } else {
            // For text-based services like icanhazip.com and ifconfig.me
            try {
              const ipText = await ipResponse.text();
              fetchedIP = ipText.trim() || 'Unknown';
            } catch (textErr) {
              console.warn(`⚠️ Failed to read text from ${service}:`, textErr);
              continue; // Try next service
            }
          }
          
          // Validate IP format (basic IPv4 check)
          const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
          if (fetchedIP && fetchedIP !== 'Unknown' && ipv4Regex.test(fetchedIP)) {
            ip = fetchedIP;
            console.log(`✅ IP address fetched successfully from ${service}:`, ip);
            break; // Success, exit loop
          } else {
            console.warn(`⚠️ Invalid IP format from ${service}:`, fetchedIP);
            // Continue to next service
          }
        } else {
          console.warn(`⚠️ HTTP error from ${service}:`, ipResponse.status, ipResponse.statusText);
        }
      } catch (serviceErr) {
        console.warn(`⚠️ Failed to fetch IP from ${service}:`, serviceErr.message);
        // Continue to next service
      }
    }
    
    if (ip === 'Unknown') {
      console.warn('⚠️ All client-side IP fetch services failed. Server will attempt to capture IP from request headers.');
    }
  } catch (ipErr) {
    console.warn('⚠️ Client-side IP fetch failed. Server will attempt to capture IP from request headers:', ipErr.message);
  }

  // If we got an IP, fetch geolocation data
  if (ip && ip !== 'Unknown') {
    try {
      // Try ip-api.com first (free, comprehensive data, no API key required)
      // Fields: status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,asname,zip,query
      const geoResponse = await Promise.race([
        fetch(`https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,zip`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Geo fetch timeout')), 5000))
      ]);

      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        
        // ip-api.com returns status field - check if successful
        if (geoData.status === 'success') {
          geo = {
            country: geoData.country || 'Unknown',
            countryCode: geoData.countryCode || 'Unknown',
            city: geoData.city || 'Unknown',
            region: geoData.regionName || geoData.region || 'Unknown',
            regionCode: geoData.region || 'Unknown',
            timezone: geoData.timezone || 'Unknown',
            isp: geoData.isp || 'Unknown',
            org: geoData.org || 'Unknown',
            asn: geoData.as ? geoData.as.split(' ')[0] : 'Unknown', // Extract ASN number from "AS12345 ISP Name"
            latitude: geoData.lat || null,
            longitude: geoData.lon || null,
            postalCode: geoData.zip || 'Unknown'
          };
          console.log('✅ Enhanced geolocation data fetched from ip-api.com:', geo);
        } else {
          console.warn('⚠️ ip-api.com returned error:', geoData.message);
        }
      }
    } catch (geoErr) {
      console.error('❌ Failed to fetch geolocation from ip-api.com:', geoErr);
      
      // Fallback: Try ipapi.co as backup (also free, no API key required)
      try {
        const fallbackResponse = await Promise.race([
          fetch(`https://ipapi.co/${ip}/json/`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Fallback geo fetch timeout')), 5000))
        ]);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (!fallbackData.error) {
            geo = {
              country: fallbackData.country_name || fallbackData.country || 'Unknown',
              countryCode: fallbackData.country_code || fallbackData.country || 'Unknown',
              city: fallbackData.city || 'Unknown',
              region: fallbackData.region || 'Unknown',
              regionCode: fallbackData.region_code || 'Unknown',
              timezone: fallbackData.timezone || 'Unknown',
              isp: fallbackData.org || fallbackData.isp || 'Unknown',
              org: fallbackData.org || 'Unknown',
              asn: fallbackData.asn || 'Unknown',
              latitude: fallbackData.latitude || null,
              longitude: fallbackData.longitude || null,
              postalCode: fallbackData.postal || 'Unknown'
            };
            console.log('✅ Enhanced geolocation data fetched from ipapi.co (fallback):', geo);
          }
        } else {
          console.warn(`⚠️ ipapi.co returned HTTP ${fallbackResponse.status}`);
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback geolocation also failed:', fallbackErr);
        
        // Additional fallback: Try ip-api.com with HTTP (non-HTTPS) endpoint
        try {
          const altResponse = await Promise.race([
            fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,zip`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Alt geo fetch timeout')), 5000))
          ]);
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.status === 'success') {
              geo = {
                country: altData.country || 'Unknown',
                countryCode: altData.countryCode || 'Unknown',
                city: altData.city || 'Unknown',
                region: altData.regionName || altData.region || 'Unknown',
                regionCode: altData.region || 'Unknown',
                timezone: altData.timezone || 'Unknown',
                isp: altData.isp || 'Unknown',
                org: altData.org || 'Unknown',
                asn: altData.as ? altData.as.split(' ')[0] : 'Unknown',
                latitude: altData.lat || null,
                longitude: altData.lon || null,
                postalCode: altData.zip || 'Unknown'
              };
              console.log('✅ Enhanced geolocation data fetched from ip-api.com (HTTP endpoint):', geo);
            }
          }
        } catch (altErr) {
          console.warn('⚠️ Alternative geolocation endpoint also failed:', altErr.message);
        }
        
        // Last resort: Try ipgeolocation.io (free tier available)
        try {
          const lastResortResponse = await Promise.race([
            fetch(`https://api.ipgeolocation.io/ipgeo?ip=${ip}&apiKey=free`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Last resort geo fetch timeout')), 5000))
          ]);
          
          if (lastResortResponse.ok) {
            const lastResortData = await lastResortResponse.json();
            if (lastResortData.ip) {
              geo = {
                country: lastResortData.country_name || 'Unknown',
                countryCode: lastResortData.country_code2 || 'Unknown',
                city: lastResortData.city || 'Unknown',
                region: lastResortData.state_prov || 'Unknown',
                regionCode: lastResortData.state_code || 'Unknown',
                timezone: lastResortData.time_zone?.name || 'Unknown',
                isp: lastResortData.isp || 'Unknown',
                org: lastResortData.organization || 'Unknown',
                asn: lastResortData.asn || 'Unknown',
                latitude: lastResortData.latitude || null,
                longitude: lastResortData.longitude || null,
                postalCode: lastResortData.zipcode || 'Unknown'
              };
              console.log('✅ Enhanced geolocation data fetched from ipgeolocation.io (last resort):', geo);
            }
          }
        } catch (lastResortErr) {
          console.error('❌ All geolocation services failed:', lastResortErr);
        }
      }
    }
  }

  return { ip, geo };
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

    // 2. Check if user exists in users table and their role
    let userExists = false;
    let userRole = null;
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', email)
        .maybeSingle();
      if (userData) {
        userExists = true;
        userRole = userData.role;
      }
    } catch (err) {
      createNotification({ message: 'Error checking user database. Please try again.', success: false });
      return;
    }

    // Check if user role is "new" or "declined" - block login
    if (userRole === 'new') {
      createNotification({ 
        message: 'Your account is pending approval. The IDAIC team will review your submission and get in touch with you soon.', 
        success: false, 
        warning: true 
      });
      return;
    }

    if (userRole === 'declined') {
      createNotification({ 
        message: 'Access to your account has been declined. Please contact the IDAIC team if you believe this is an error.', 
        success: false 
      });
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

// (Reveal helper removed; password tab is visible by default)

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

      // Check user role before allowing login
      let userRole = null;
      try {
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .maybeSingle();
        
        if (userData && !roleError) {
          userRole = userData.role;
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      }

      // Block login for "new" and "declined" roles
      if (userRole === 'new') {
        await supabase.auth.signOut();
        createNotification({ 
          message: 'Your account is pending approval. The IDAIC team will review your submission and get in touch with you soon.', 
          success: false, 
          warning: true 
        });
        return;
      }

      if (userRole === 'declined') {
        await supabase.auth.signOut();
        createNotification({ 
          message: 'Access to your account has been declined. Please contact the IDAIC team if you believe this is an error.', 
          success: false 
        });
        return;
      }

      localStorage.setItem('idaic-token', data.session.access_token)
      createNotification({ message: 'Successfully signed in!', success: true })

      // Track user login stats with enhanced geolocation metadata
      try {
        const { ip, geo } = await fetchIPAndLocation();

        const user = data.user || {}; // data.user may be undefined, fallback to empty object
        const userId = data.user?.id || null;

        // Get enhanced device metadata
        const deviceMeta = getEnhancedDeviceMetadata();
        
        const metadata = {
          user_id: userId, // Store the Auth UUID
          email: user.email || document.getElementById('email').value.trim(),
          ip_address: ip,
          country: geo.country,
          country_code: geo.countryCode,
          city: geo.city,
          region: geo.region,
          region_code: geo.regionCode,
          timezone: geo.timezone,
          isp: geo.isp,
          organization: geo.org,
          asn: geo.asn,
          latitude: geo.latitude,
          longitude: geo.longitude,
          postal_code: geo.postalCode,
          device: deviceMeta.device,
          browser: deviceMeta.browser,
          browser_version: deviceMeta.browser_version,
          os: deviceMeta.os,
          user_agent: deviceMeta.user_agent,
          language: deviceMeta.language,
          languages: deviceMeta.languages,
          platform: deviceMeta.platform,
          cookie_enabled: deviceMeta.cookie_enabled,
          do_not_track: deviceMeta.do_not_track,
          screen_width: deviceMeta.screen_width,
          screen_height: deviceMeta.screen_height,
          screen_color_depth: deviceMeta.screen_color_depth,
          viewport_width: deviceMeta.viewport_width,
          viewport_height: deviceMeta.viewport_height,
          browser_timezone: deviceMeta.timezone,
          timezone_offset: deviceMeta.timezone_offset,
          online_status: deviceMeta.online_status,
          hardware_concurrency: deviceMeta.hardware_concurrency,
          device_memory: deviceMeta.device_memory,
          login_time: new Date().toISOString(),
          login_method: 'otp'
        };

        // Use the trackLogin function for consistency
        console.log('📤 Sending login tracking data:', metadata);
        const trackResponse = await fetch('/.netlify/functions/trackLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metadata)
        });
        
        const trackResult = await trackResponse.json();
        
        if (trackResponse.ok) {
          console.log('✅ OTP login tracked successfully!');
          console.log('✅ Server response:', trackResult);
        } else {
          console.error('❌ Failed to track OTP login:', {
            status: trackResponse.status,
            statusText: trackResponse.statusText,
            error: trackResult
          });
        }
      } catch (trackErr) {
        console.error('❌ Failed to track user login:', {
          error: trackErr,
          message: trackErr.message,
          stack: trackErr.stack
        });
      }

      window.location.href = getRedirectUrl()

    } catch (err) {
      let friendlyMessage = err.message

      if (err.message.includes('Invalid login credentials')) {
        friendlyMessage = 'Invalid code. Please check your email or request a new OTP.'
      }

      createNotification({ message: friendlyMessage, success: false })
    }
  })

// 5. Admin/Moderator Password Login
document.getElementById('password-form')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const emailEl = document.getElementById('password-email')
  const pwdEl = document.getElementById('password')
  const email = emailEl ? emailEl.value.trim() : ''
  const password = pwdEl ? pwdEl.value.trim() : ''

  // Basic validation
  if (!email || !password) {
    createNotification({ message: 'Please enter both email and password.', success: false })
    return
  }

  try {
    // Check user exists and is admin or moderator
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('email', email)
      .maybeSingle()

    if (userErr) {
      console.error('Error fetching user:', userErr)
      createNotification({ message: 'Error checking user. Please try again.', success: false })
      return
    }

    if (!userRow) {
      createNotification({ message: 'User not authorized. Please contact IDAIC admin.', success: false })
      return
    }

    // Check if user role is "new" or "declined" - block login
    const userRole = (userRow.role || '').toLowerCase();
    if (userRole === 'new') {
      createNotification({ 
        message: 'Your account is pending approval. The IDAIC team will review your submission and get in touch with you soon.', 
        success: false, 
        warning: true 
      });
      return;
    }

    if (userRole === 'declined') {
      createNotification({ 
        message: 'Access to your account has been declined. Please contact the IDAIC team if you believe this is an error.', 
        success: false 
      });
      return;
    }

    if (userRole !== 'admin' && userRole !== 'moderator') {
      createNotification({ message: 'Admin or Moderator access required. Please use Email Code instead.', success: false })
      return
    }

    // Simple shared secret password check
    if (password !== 'IDAIC2025!') {
      createNotification({ message: 'Invalid password. Please try again.', success: false })
      return
    }

    // Create mock session token and persist admin login marker
    const accessToken = 'password_login_' + Date.now()
    localStorage.setItem('idaic-token', accessToken)
    localStorage.setItem('idaic-password-login', 'true')
    localStorage.setItem('idaic-password-email', email)

    // Show role-specific notification
    const roleLabel = userRole === 'admin' ? 'admin' : 'moderator'
    createNotification({ message: `Successfully signed in (${roleLabel}). Redirecting…`, success: true })

    // Track password login with enhanced metadata (IP, location, device, browser, OS, etc.)
    try {
      // Fetch IP and geolocation with enhanced metadata
      const { ip, geo } = await fetchIPAndLocation();

      // Get enhanced device metadata
      const deviceMeta = getEnhancedDeviceMetadata();
      
      // Prepare metadata with all enhanced tracking information
      const metadata = {
        user_id: userRow.id,
        email: userRow.email,
        ip_address: ip,
        country: geo.country,
        country_code: geo.countryCode,
        city: geo.city,
        region: geo.region,
        region_code: geo.regionCode,
        timezone: geo.timezone,
        isp: geo.isp,
        organization: geo.org,
        asn: geo.asn,
        latitude: geo.latitude,
        longitude: geo.longitude,
        postal_code: geo.postalCode,
        device: deviceMeta.device,
        browser: deviceMeta.browser,
        browser_version: deviceMeta.browser_version,
        os: deviceMeta.os,
        user_agent: deviceMeta.user_agent,
        language: deviceMeta.language,
        languages: deviceMeta.languages,
        platform: deviceMeta.platform,
        cookie_enabled: deviceMeta.cookie_enabled,
        do_not_track: deviceMeta.do_not_track,
        screen_width: deviceMeta.screen_width,
        screen_height: deviceMeta.screen_height,
        screen_color_depth: deviceMeta.screen_color_depth,
        viewport_width: deviceMeta.viewport_width,
        viewport_height: deviceMeta.viewport_height,
        browser_timezone: deviceMeta.timezone,
        timezone_offset: deviceMeta.timezone_offset,
        online_status: deviceMeta.online_status,
        hardware_concurrency: deviceMeta.hardware_concurrency,
        device_memory: deviceMeta.device_memory,
        login_time: new Date().toISOString(),
        login_method: 'password'
      };

      console.log('📤 Sending login tracking data:', metadata);
      const trackResponse = await fetch('/.netlify/functions/trackLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      })
      
      const trackResult = await trackResponse.json();
      
      if (trackResponse.ok) {
        console.log('✅ Password login tracked successfully!');
        console.log('✅ Server response:', trackResult);
      } else {
        console.error('❌ Failed to track password login:', {
          status: trackResponse.status,
          statusText: trackResponse.statusText,
          error: trackResult
        });
      }
    } catch (trackErr) {
      console.error('❌ Track login error:', {
        error: trackErr,
        message: trackErr.message,
        stack: trackErr.stack
      });
    }

    // Redirect to app
    window.location.href = '/app'
  } catch (err) {
    console.error('Password login error:', err)
    createNotification({ message: `Login failed: ${err.message || 'Please try again.'}`, success: false })
  }
})