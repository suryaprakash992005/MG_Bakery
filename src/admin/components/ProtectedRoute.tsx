import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useAdminRouter } from '../hooks/useAdminRouter';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigate } = useAdminRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let active = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (active) {
        setSession(currentSession);
        setLoading(false);
        if (!currentSession) {
          navigate('/admin-login');
        }
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (active) {
        setSession(currentSession);
        setLoading(false);
        if (!currentSession) {
          navigate('/admin-login');
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <div className="w-8 h-8 border-4 border-brand-gold-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return session ? <>{children}</> : null;
};
