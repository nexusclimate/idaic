import "./index.css";
import { VERSION } from './config/version.js';
import React, { useState, useEffect, useRef } from "react";
import Idaic from "./components/idaic";
import PageRouter from "./components/PageRouter";
import DisclaimerPopup from "./components/DisclaimerPopup";
import { supabase } from './config/supabase.js';

// Helper functions for login tracking
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

function getEnhancedDeviceMetadata() {
  return {
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
}

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
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://api64.ipify.org?format=json'
    ];

    for (const service of ipServices) {
      try {
        const ipResponse = await Promise.race([
          fetch(service, { method: 'GET', headers: { 'Accept': 'application/json' } }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('IP fetch timeout')), 3000))
        ]);
        
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          ip = ipData.ip || 'Unknown';
          if (ip !== 'Unknown') break;
        }
      } catch (err) {
        console.warn('IP fetch failed:', err.message);
      }
    }
  } catch (err) {
    console.warn('Client-side IP fetch failed:', err.message);
  }

  if (ip && ip !== 'Unknown') {
    const geoServices = [
      {
        name: 'ipapi.co',
        url: `https://ipapi.co/${ip}/json/`,
        parser: (data) => {
          if (!data.error) {
            return {
              country: data.country_name || data.country || 'Unknown',
              countryCode: data.country_code || 'Unknown',
              city: data.city || 'Unknown',
              region: data.region || 'Unknown',
              regionCode: data.region_code || 'Unknown',
              timezone: data.timezone || 'Unknown',
              isp: data.org || data.isp || 'Unknown',
              org: data.org || 'Unknown',
              asn: data.asn || 'Unknown',
              latitude: data.latitude || null,
              longitude: data.longitude || null,
              postalCode: data.postal || 'Unknown'
            };
          }
          return null;
        }
      }
    ];

    for (const service of geoServices) {
      try {
        const geoResponse = await Promise.race([
          fetch(service.url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Geo fetch timeout')), 4000))
        ]);

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const parsedGeo = service.parser(geoData);
          if (parsedGeo) {
            geo = parsedGeo;
            break;
          }
        }
      } catch (err) {
        console.warn('Geolocation fetch failed:', err.message);
      }
    }
  }

  return { ip, geo };
}

async function trackLoginEvent(userId, userEmail, loginMethod) {
  try {
    const { ip, geo } = await fetchIPAndLocation();
    const deviceMeta = getEnhancedDeviceMetadata();
    
    const metadata = {
      user_id: userId,
      email: userEmail,
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
      timezone_offset: deviceMeta.timezone_offset,
      online_status: deviceMeta.online_status,
      hardware_concurrency: deviceMeta.hardware_concurrency,
      device_memory: deviceMeta.device_memory,
      login_time: new Date().toISOString(),
      login_method: loginMethod
    };

    const trackResponse = await fetch('/.netlify/functions/trackLogin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata)
    });
    
    if (trackResponse.ok) {
      console.log('✅ Login tracked successfully');
    } else {
      console.error('❌ Failed to track login');
    }
  } catch (err) {
    console.error('❌ Error tracking login:', err);
  }
}

export default function App() {
  // Initialize currentPage from URL pathname, query params, or localStorage, otherwise default to 'home'
  const [currentPage, setCurrentPage] = useState(() => {
    // Check URL pathname first for public pages
    const pathname = window.location.pathname;
    if (pathname === '/newuser-form' || pathname === '/newmember-signup') {
      return pathname.replace('/', '');
    }
    
    // Check for page parameter in URL (for protected deep links)
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
      // Store the requested page for after login
      localStorage.setItem('idaic-requested-page', pageParam);
      return pageParam;
    }
    
    // Check for requested page from login redirect
    const requestedPage = localStorage.getItem('idaic-requested-page');
    if (requestedPage) {
      // Clear it after using it
      localStorage.removeItem('idaic-requested-page');
      return requestedPage;
    }
    
    const savedPage = localStorage.getItem('idaic-current-page');
    return savedPage || 'home';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [user, setUser] = useState(null);
  
  // Track if we've already logged this session to avoid duplicates
  const loginTrackedRef = useRef(false);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (currentPage) {
      localStorage.setItem('idaic-current-page', currentPage);
    }
  }, [currentPage]);

  // Listen for navigation events from @ mentions
  useEffect(() => {
    const handleNavigateToPage = (event) => {
      const page = event.detail?.page;
      console.log('App.jsx received navigateToPage event, page:', page);
      if (page) {
        console.log('Setting current page to:', page);
        setCurrentPage(page);
        localStorage.setItem('idaic-current-page', page);
      }
    };

    window.addEventListener('navigateToPage', handleNavigateToPage);
    return () => {
      window.removeEventListener('navigateToPage', handleNavigateToPage);
    };
  }, []);

  useEffect(() => {
    // Check if this is a public page - skip authentication
    const pathname = window.location.pathname;
    const isPublicPage = pathname === '/newuser-form' || pathname === '/newmember-signup' || 
                         currentPage === 'newuser-form' || currentPage === 'newmember-signup';
    
    if (isPublicPage) {
      setIsAuthenticated(true); // Set to true to allow rendering, but user will be null
      return;
    }

    // Check authentication on app load
    const checkAuthentication = async () => {
      try {
        // First, check if this is a password login
        const isPasswordLogin = localStorage.getItem('idaic-password-login');
        const localToken = localStorage.getItem('idaic-token');
        
        if (isPasswordLogin === 'true' && localToken) {
          // Handle password-based authentication
          console.log('✅ Valid password login session found');
          // Get the email from localStorage (stored during login)
          const passwordEmail = localStorage.getItem('idaic-password-email') || 'info@idaic.org';
          
          // Fetch user ID from database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('email', passwordEmail)
            .maybeSingle();
          
          if (userError) {
            console.error('❌ Error fetching user data:', userError);
            handleAuthFailure();
            return;
          }
          
          if (!userData?.id) {
            console.error('❌ User not found in database for email:', passwordEmail);
            handleAuthFailure();
            return;
          }
          
          const userId = userData.id;
          const userRole = userData.role;
          
          // Check if user role is "new" or "declined" - block access
          if (userRole === 'new' || userRole === 'declined') {
            setIsAuthenticated(false);
            setUser(null);
            // Store role for message display
            localStorage.setItem('idaic-blocked-role', userRole);
            window.location.href = '/login.html';
            return;
          }
          
          setUser({
            id: userId,
            email: passwordEmail,
            role: userRole,
            user_metadata: { password_login: true }
          });
          setIsAuthenticated(true);
          
          // Track password login if not already tracked
          if (!loginTrackedRef.current) {
            loginTrackedRef.current = true;
            trackLoginEvent(userId, passwordEmail, 'password').catch(err => {
              console.warn('Password login tracking failed:', err);
            });
          }
          
          // Check if user needs to accept disclaimer (from database)
          await checkDisclaimerStatus(userId, passwordEmail);
          return;
        }
        
        // Check current Supabase session for OTP login
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          handleAuthFailure();
          return;
        }

        if (session && session.user) {
          // Valid Supabase session found
          console.log('✅ Valid Supabase session found:', session.user.email);
          
          // Fetch user role from database
          try {
            const { data: userData, error: roleError } = await supabase
              .from('users')
              .select('role')
              .eq('email', session.user.email)
              .maybeSingle();
            
            if (userData && !roleError) {
              const userRole = userData.role;
              
          // Check if user role is "new" or "declined" - block access
          if (userRole === 'new' || userRole === 'declined') {
            // Sign out the user
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('idaic-token');
            // Store role for message display
            localStorage.setItem('idaic-blocked-role', userRole);
            
            // Preserve requested page if any
            const requestedPage = currentPage;
            if (requestedPage && requestedPage !== 'home') {
              localStorage.setItem('idaic-requested-page', requestedPage);
              window.location.href = `/login.html?returnTo=${encodeURIComponent(requestedPage)}`;
            } else {
              window.location.href = '/login.html';
            }
            return;
          }
              
              setUser({
                ...session.user,
                role: userRole
              });
            } else {
              setUser(session.user);
            }
          } catch (err) {
            console.error('Error fetching user role:', err);
            setUser(session.user);
          }
          
          setIsAuthenticated(true);
          
          // Update localStorage with current token (in case it was refreshed)
          localStorage.setItem('idaic-token', session.access_token);
          
          // Track OTP login if not already tracked
          if (!loginTrackedRef.current) {
            loginTrackedRef.current = true;
            trackLoginEvent(session.user.id, session.user.email, 'otp').catch(err => {
              console.warn('OTP login tracking failed:', err);
            });
          }
          
          // Check if user needs to accept disclaimer (from database)
          await checkDisclaimerStatus(session.user.id, session.user.email);
        } else {
          // No valid session - check if we have a stale token
          if (localToken) {
            console.log('⚠️ Found stale token in localStorage, clearing...');
            localStorage.removeItem('idaic-token');
            localStorage.removeItem('idaic-password-login');
            localStorage.removeItem('idaic-password-email');
          }
          handleAuthFailure();
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        handleAuthFailure();
      }
    };

    const checkDisclaimerStatus = async (userId, email) => {
      try {
        // Build query string
        const params = new URLSearchParams();
        if (userId && userId !== 'password_user') params.append('userId', userId);
        if (email) params.append('email', email);

        console.log('🔍 Checking disclaimer status for:', { userId, email });

        const response = await fetch(`/.netlify/functions/disclaimerAcceptance?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📋 Disclaimer check response:', data);
          
          if (data.needsDisclaimer) {
            console.log('⚠️ User needs to accept disclaimer');
            setShowDisclaimer(true);
          } else {
            console.log('✅ User has accepted disclaimer within 90 days');
            setShowDisclaimer(false);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Disclaimer check failed:', response.status, errorData);
          // Fallback to localStorage check if database check fails
          const localAccepted = localStorage.getItem('idaic-disclaimer-accepted');
          if (localAccepted === 'true') {
            console.log('✅ Using localStorage fallback - disclaimer already accepted');
            setShowDisclaimer(false);
          } else {
            console.log('⚠️ No localStorage record - showing disclaimer');
            setShowDisclaimer(true);
          }
        }
      } catch (err) {
        console.error('❌ Error checking disclaimer status:', err);
        // Fallback to localStorage check if request fails
        const localAccepted = localStorage.getItem('idaic-disclaimer-accepted');
        if (localAccepted === 'true') {
          console.log('✅ Using localStorage fallback - disclaimer already accepted');
          setShowDisclaimer(false);
        } else {
          console.log('⚠️ No localStorage record - showing disclaimer');
          setShowDisclaimer(true);
        }
      }
    };

    const handleAuthFailure = () => {
      setIsAuthenticated(false);
      setUser(null);
      
      // Reset login tracking flag
      loginTrackedRef.current = false;
      
      // Preserve the requested page in the login redirect
      const requestedPage = currentPage;
      if (requestedPage && requestedPage !== 'home' && requestedPage !== 'newuser-form' && requestedPage !== 'newmember-signup') {
        // Store the requested page for redirect after login
        localStorage.setItem('idaic-requested-page', requestedPage);
        window.location.href = `/login.html?returnTo=${encodeURIComponent(requestedPage)}`;
      } else {
        window.location.href = '/login.html';
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        // Check user role before allowing access
        try {
          const { data: userData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .maybeSingle();
          
          if (userData && !roleError) {
            const userRole = userData.role;
            
              // Block access for "new" and "declined" roles
            if (userRole === 'new' || userRole === 'declined') {
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUser(null);
              localStorage.removeItem('idaic-token');
              localStorage.setItem('idaic-blocked-role', userRole);
              
              // Preserve requested page if any
              const requestedPage = currentPage;
              if (requestedPage && requestedPage !== 'home') {
                localStorage.setItem('idaic-requested-page', requestedPage);
                window.location.href = `/login.html?returnTo=${encodeURIComponent(requestedPage)}`;
              } else {
                window.location.href = '/login.html';
              }
              return;
            }
          }
        } catch (err) {
          console.error('Error checking user role on sign in:', err);
        }
        
        setUser(session.user);
        setIsAuthenticated(true);
        localStorage.setItem('idaic-token', session.access_token);
        
        // Track login event if not already tracked in this session
        if (!loginTrackedRef.current) {
          loginTrackedRef.current = true;
          trackLoginEvent(session.user.id, session.user.email, 'otp').catch(err => {
            console.warn('Login tracking failed:', err);
          });
        }
        } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('idaic-token');
          localStorage.removeItem('idaic-password-email');
          
          // Reset login tracking flag
          loginTrackedRef.current = false;
          
          // Preserve requested page if any
          const requestedPage = currentPage;
          if (requestedPage && requestedPage !== 'home') {
            localStorage.setItem('idaic-requested-page', requestedPage);
            window.location.href = `/login.html?returnTo=${encodeURIComponent(requestedPage)}`;
          } else {
            window.location.href = '/login.html';
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update token in localStorage
          localStorage.setItem('idaic-token', session.access_token);
        }
      }
    });

    checkAuthentication();

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Activity tracking heartbeat - send activity updates while user is active
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    // Get user ID and email
    const userId = user.id;
    const userEmail = user.email || user.user_metadata?.email;

    if (!userId || !userEmail) return;

    // Track error counts to avoid spamming console
    let errorCount = 0;
    let lastErrorTime = 0;
    const ERROR_LOG_INTERVAL = 60000; // Only log errors once per minute

    // Function to send activity update
    const sendActivityUpdate = async () => {
      try {
        const response = await fetch('/.netlify/functions/trackActivity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            email: userEmail,
            activity_time: new Date().toISOString()
          })
        });
        
        // Only log errors if response is not ok and it's not a network error
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          
          // Only log if it's not a network-related error
          if (!errorText.includes('ERR_INTERNET_DISCONNECTED') && 
              !errorText.includes('Failed to fetch') &&
              !errorText.includes('network')) {
            // Rate limit error logging - only log once per minute
            const now = Date.now();
            if (now - lastErrorTime > ERROR_LOG_INTERVAL) {
              console.warn('Activity tracking failed:', response.status, errorData);
              lastErrorTime = now;
              errorCount = 0;
            } else {
              errorCount++;
            }
          }
        } else {
          // Reset error count on success
          errorCount = 0;
        }
      } catch (err) {
        // Suppress network-related errors (offline, disconnected, etc.)
        const errorMessage = err.message || String(err || '');
        const isNetworkError = errorMessage.includes('Failed to fetch') ||
                               errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
                               errorMessage.includes('network') ||
                               errorMessage.includes('NetworkError') ||
                               err.name === 'TypeError' && errorMessage.includes('fetch');
        
        if (!isNetworkError) {
          // Rate limit error logging
          const now = Date.now();
          if (now - lastErrorTime > ERROR_LOG_INTERVAL) {
            console.warn('Error tracking activity:', err);
            lastErrorTime = now;
            errorCount = 0;
          } else {
            errorCount++;
          }
        }
        // Silently fail for network errors - don't interrupt user experience
      }
    };

    // Send initial activity update
    sendActivityUpdate();

    // Set up interval to send activity updates every 2 minutes while user is active
    const activityInterval = setInterval(() => {
      sendActivityUpdate();
    }, 2 * 60 * 1000); // 2 minutes

    // Also track activity on user interactions (mouse movement, clicks, keyboard)
    let activityTimeout;
    const resetActivityTimeout = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        sendActivityUpdate();
      }, 30000); // Send update 30 seconds after last activity
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetActivityTimeout, { passive: true });
    });

    // Cleanup
    return () => {
      clearInterval(activityInterval);
      clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetActivityTimeout);
      });
    };
  }, [user, isAuthenticated]);

  // Allow public access to newuser-form page
  const isPublicPage = currentPage === 'newuser-form' || currentPage === 'newmember-signup';

  if (isAuthenticated === null && !isPublicPage) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !isPublicPage) {
    return <div>Redirecting to login...</div>;
  }

  const handleDisclaimerAccept = async () => {
    try {
      // Save to localStorage as backup
      localStorage.setItem('idaic-disclaimer-accepted', 'true');
      
      console.log('💾 Saving disclaimer acceptance for user:', { 
        userId: user?.id, 
        email: user?.email 
      });
      
      // Save disclaimer acceptance to database
      const response = await fetch('/.netlify/functions/disclaimerAcceptance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id, 
          email: user?.email 
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Disclaimer acceptance recorded in database:', result);
        setShowDisclaimer(false);
        const page = 'settings';
        setCurrentPage(page);
        localStorage.setItem('idaic-current-page', page);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to record disclaimer acceptance in database:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        console.log('✅ Disclaimer saved to localStorage as fallback');
        // Still close the modal - localStorage backup is saved
        setShowDisclaimer(false);
        const page = 'settings';
        setCurrentPage(page);
        localStorage.setItem('idaic-current-page', page);
      }
    } catch (err) {
      console.error('❌ Error saving disclaimer acceptance:', err);
      console.log('✅ Disclaimer saved to localStorage as fallback');
      // Still close the modal - localStorage backup is saved
      setShowDisclaimer(false);
      const page = 'settings';
      setCurrentPage(page);
      localStorage.setItem('idaic-current-page', page);
    }
  };

  const handleDisclaimerDecline = async () => {
    // Reset login tracking flag
    loginTrackedRef.current = false;
    
    // Check if this is a password login
    const isPasswordLogin = localStorage.getItem('idaic-password-login');
    
    if (isPasswordLogin === 'true') {
      // Handle password login logout
      localStorage.removeItem('idaic-token');
      localStorage.removeItem('idaic-password-login');
      localStorage.removeItem('idaic-password-email');
      window.location.href = '/login.html';
    } else {
      // Proper Supabase logout for OTP login
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
      // Clear localStorage and redirect (handled by auth state change listener)
      localStorage.removeItem('idaic-token');
      window.location.href = '/login.html';
    }
  };

  const handleNavigateToFeedback = () => {
    const page = 'feedback';
    setCurrentPage(page);
    localStorage.setItem('idaic-current-page', page);
    setShowDisclaimer(false);
  };

  // For public pages, render without sidebar
  if (isPublicPage) {
    return (
      <div className="min-h-screen w-screen overflow-auto">
        <PageRouter 
          currentPage={currentPage} 
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
          user={user}
          onPageChange={(page) => {
            setCurrentPage(page);
            localStorage.setItem('idaic-current-page', page);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-svh w-screen overflow-hidden">
      <DisclaimerPopup 
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
        onNavigateToFeedback={handleNavigateToFeedback}
      />
      <Idaic 
        onPageChange={(page) => {
          setCurrentPage(page);
          localStorage.setItem('idaic-current-page', page);
        }} 
        currentPage={currentPage}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        user={user}
      />
      <main className="flex-1 bg-gray-50 p-10 h-full overflow-y-auto min-h-0">
        <PageRouter 
          currentPage={currentPage} 
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
          user={user}
          onPageChange={(page) => {
            setCurrentPage(page);
            localStorage.setItem('idaic-current-page', page);
          }}
        />
      </main>
    </div>
  );
}