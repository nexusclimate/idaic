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
          setUser({
            id: 'password_user',
            email: 'admin@idaic.org',
            user_metadata: { password_login: true }
          });
          setIsAuthenticated(true);
          
          // Check if user has already accepted the disclaimer
          const disclaimerAccepted = localStorage.getItem('idaic-disclaimer-accepted');
          if (!disclaimerAccepted) {
            setShowDisclaimer(true);
          }
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
          setUser(session.user);
          setIsAuthenticated(true);
          
          // Update localStorage with current token (in case it was refreshed)
          localStorage.setItem('idaic-token', session.access_token);
          
          // Check if user has already accepted the disclaimer
          const disclaimerAccepted = localStorage.getItem('idaic-disclaimer-accepted');
          if (!disclaimerAccepted) {
            setShowDisclaimer(true);
          }
        } else {
          // No valid session - check if we have a stale token
          if (localToken) {
            console.log('⚠️ Found stale token in localStorage, clearing...');
            localStorage.removeItem('idaic-token');
            localStorage.removeItem('idaic-disclaimer-accepted');
            localStorage.removeItem('idaic-password-login');
          }
          handleAuthFailure();
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        handleAuthFailure();
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
          localStorage.removeItem('idaic-disclaimer-accepted');
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

  const handleDisclaimerAccept = () => {
    localStorage.setItem('idaic-disclaimer-accepted', 'true');
    setShowDisclaimer(false);
  };

  const handleDisclaimerDecline = async () => {
    // Check if this is a password login
    const isPasswordLogin = localStorage.getItem('idaic-password-login');
    
    if (isPasswordLogin === 'true') {
      // Handle password login logout
      localStorage.removeItem('idaic-token');
      localStorage.removeItem('idaic-disclaimer-accepted');
      localStorage.removeItem('idaic-password-login');
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
      localStorage.removeItem('idaic-disclaimer-accepted');
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
      />
      <main className="flex-1 bg-gray-50 p-10 h-full">
        <PageRouter 
          currentPage={currentPage} 
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminAuthenticated={setIsAdminAuthenticated}
        />
      </main>
    </div>
  );
}