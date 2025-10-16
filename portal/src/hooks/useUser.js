import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      // Check for password login first
      const isPasswordLogin = localStorage.getItem('idaic-password-login');
      const passwordEmail = localStorage.getItem('idaic-password-email');
      
      if (isPasswordLogin === 'true' && passwordEmail) {
        // Fetch user data from database for password login
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', passwordEmail)
            .maybeSingle();
          
          if (userData && !error) {
            setUser({
              id: userData.id,
              email: userData.email,
              user_metadata: { 
                password_login: true,
                name: userData.name
              }
            });
          }
        } catch (err) {
          console.error('Error fetching password user:', err);
        }
        setLoading(false);
        return;
      }
      
      // Get Supabase session for OTP login
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    initUser();

    // Listen for auth changes (only for OTP login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isPasswordLogin = localStorage.getItem('idaic-password-login');
      if (isPasswordLogin !== 'true') {
        setUser(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
