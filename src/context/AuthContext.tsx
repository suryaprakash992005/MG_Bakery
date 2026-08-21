import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface CustomerProfile {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  doorNo?: string;
  streetArea: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  savedAddresses: CustomerAddress[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'signup' | 'phone';
  setAuthModalTab: (tab: 'login' | 'signup' | 'phone') => void;
  loginWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signupWithEmail: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateGuestProfile: (data: Partial<CustomerProfile>) => void;
  saveAddress: (address: Omit<CustomerAddress, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_PROFILE_KEY = 'mg_guest_customer_profile';
const SAVED_ADDRESSES_KEY = 'mg_saved_addresses';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem(GUEST_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_ADDRESSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'phone'>('login');

  // Monitor Supabase auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setProfile(prev => ({
          id: session.user.id,
          name: metadata.name || prev?.name || 'Valued Customer',
          phone: metadata.phone || prev?.phone || '',
          email: session.user.email || prev?.email || '',
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setProfile({
          id: session.user.id,
          name: metadata.name || 'Valued Customer',
          phone: metadata.phone || '',
          email: session.user.email || '',
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save guest profile to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
    }
  }, [profile]);

  // Save addresses to localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setIsAuthModalOpen(false);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  const signupWithEmail = async (email: string, password: string, name: string, phone: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone }
        }
      });
      if (error) return { error: error.message };
      if (data.user) {
        setIsAuthModalOpen(false);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const updateGuestProfile = (data: Partial<CustomerProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...data } as CustomerProfile;
      return updated;
    });
  };

  const saveAddress = (address: Omit<CustomerAddress, 'id'>) => {
    const newAddress: CustomerAddress = {
      ...address,
      id: 'addr_' + Date.now(),
      isDefault: savedAddresses.length === 0 ? true : address.isDefault
    };

    setSavedAddresses(prev => {
      if (newAddress.isDefault) {
        return [newAddress, ...prev.map(a => ({ ...a, isDefault: false }))];
      }
      return [newAddress, ...prev];
    });
  };

  const removeAddress = (addressId: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== addressId));
  };

  const setDefaultAddress = (addressId: string) => {
    setSavedAddresses(prev =>
      prev.map(a => ({
        ...a,
        isDefault: a.id === addressId
      }))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        savedAddresses,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateGuestProfile,
        saveAddress,
        removeAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
