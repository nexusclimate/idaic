import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getAuthToken = async () => {
    // Check for password login first
    const isPasswordLogin = localStorage.getItem('idaic-password-login');
    const localToken = localStorage.getItem('idaic-token');
    
    if (isPasswordLogin === 'true' && localToken) {
      return localToken;
    }
    
    // Otherwise, get Supabase session token for OTP login
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  return { session, loading, getAuthToken };
}
