import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: CustomerProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching customer profile from Supabase:', error);
        return null;
      }
      return data as CustomerProfile;
    } catch (err) {
      console.error('Failed to fetch customer profile:', err);
      return null;
    }
  };

  const handleUserSession = async (sessionUser: User | null) => {
    setUser(sessionUser);
    if (sessionUser) {
      const userProfile = await fetchProfile(sessionUser.id);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    setLoading(true);
    try {
      // 1. Sign up user in Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            phone: phone
          }
        }
      });

      if (error) throw error;

      // 2. Create custom profile row in customers table if user was created successfully
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('customers')
          .insert([
            {
              user_id: data.user.id,
              full_name: name,
              email,
              phone,
              total_orders: 0,
              total_spent: 0.00
            }
          ]);

        if (profileError) {
          console.error('Error creating customer entry:', profileError);
        }
      }

      return { error: null, data };
    } catch (err: any) {
      console.error('Signup error:', err);
      return { error: err, data: null };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { error: null, data };
    } catch (err: any) {
      console.error('Login error:', err);
      return { error: err, data: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Signout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  // Admin indicator based on email
  const isAdmin = profile?.email === 'admin@mgiyengar.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
