import "./index.css";
import { VERSION } from './config/version.js';
import React, { useState, useEffect } from "react";
import Idaic from "./components/idaic";
import PageRouter from "./components/PageRouter";
import DisclaimerPopup from "./components/DisclaimerPopup";
import { supabase } from './config/supabase.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
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
          const passwordEmail = localStorage.getItem('idaic-password-email') || 'admin@idaic.org';
          
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
          
          setUser({
            id: userId,
            email: passwordEmail,
            role: userData.role,
            user_metadata: { password_login: true }
          });
          setIsAuthenticated(true);
          
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
              setUser({
                ...session.user,
                role: userData.role
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
      window.location.href = '/login.html';
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setIsAuthenticated(true);
        localStorage.setItem('idaic-token', session.access_token);
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('idaic-token');
          localStorage.removeItem('idaic-password-email');
          window.location.href = '/login.html';
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

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
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
      }
    } catch (err) {
      console.error('❌ Error saving disclaimer acceptance:', err);
      console.log('✅ Disclaimer saved to localStorage as fallback');
      // Still close the modal - localStorage backup is saved
      setShowDisclaimer(false);
    }
  };

  const handleDisclaimerDecline = async () => {
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
    setCurrentPage('feedback');
    setShowDisclaimer(false);
  };

  return (
    <div className="flex h-screen w-screen">
      <DisclaimerPopup 
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
        onNavigateToFeedback={handleNavigateToFeedback}
      />
      <Idaic 
        onPageChange={setCurrentPage} 
        currentPage={currentPage}
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
        user={user}
      />
      <main className="flex-1 bg-gray-50 p-10 h-full">
        <PageRouter 
          currentPage={currentPage} 
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
          user={user}
        />
      </main>
    </div>
  );
}