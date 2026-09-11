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
  authModalMessage?: string;
  setAuthModalMessage: (msg: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signupWithEmail: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  updateGuestProfile: (data: Partial<CustomerProfile>) => void;
  saveAddress: (address: Omit<CustomerAddress, 'id'>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
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
  const [authModalMessage, setAuthModalMessage] = useState('');

  // ── Fetch profile from Supabase ─────────────────────────────────────────────
  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile({
          id: userId,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || userEmail || '',
        });
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({
          id: userId,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || userEmail || '',
        }));
      } else {
        // Profile row doesn't exist yet — create it
        const meta = (await supabase.auth.getUser()).data.user?.user_metadata || {};
        const profileData = {
          id: userId,
          name: meta.name || '',
          phone: meta.phone || '',
          email: userEmail || '',
        };
        await supabase.from('profiles').upsert([profileData]);
        setProfile(profileData);
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profileData));
      }
    } catch (err) {
      console.warn('Error fetching profile:', err);
    }
  };

  // ── Fetch addresses from Supabase ───────────────────────────────────────────
  const fetchAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (!error && data) {
        const mapped: CustomerAddress[] = data.map((row: any) => ({
          id: row.id,
          label: row.label || 'Home',
          name: row.name || '',
          phone: row.phone || '',
          doorNo: row.door_no || '',
          streetArea: row.street_area || '',
          landmark: row.landmark || '',
          city: row.city || 'Mohanur',
          pincode: row.pincode || '637015',
          isDefault: row.is_default || false,
        }));
        setSavedAddresses(mapped);
        localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(mapped));
      }
    } catch (err) {
      console.warn('Error fetching addresses:', err);
    }
  };

  const refreshAddresses = async () => {
    if (user?.id) await fetchAddresses(user.id);
  };

  // ── Monitor Supabase auth session ───────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
        fetchAddresses(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
        fetchAddresses(session.user.id);
      } else {
        // Logged out — clear to guest state
        setProfile(null);
        setSavedAddresses([]);
        localStorage.removeItem(GUEST_PROFILE_KEY);
        localStorage.removeItem(SAVED_ADDRESSES_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Guest profile persistence ───────────────────────────────────────────────
  useEffect(() => {
    if (profile && !user) {
      localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
    }
  }, [profile, user]);

  // ── Auth Operations ─────────────────────────────────────────────────────────

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.user) {
        setIsAuthModalOpen(false);
        setAuthModalMessage('');
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
        // Upsert profile immediately
        await supabase.from('profiles').upsert([{
          id: data.user.id,
          name,
          phone,
          email,
        }]);
        setIsAuthModalOpen(false);
        setAuthModalMessage('');
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
      setProfile(null);
      setSavedAddresses([]);
      localStorage.removeItem(GUEST_PROFILE_KEY);
      localStorage.removeItem(SAVED_ADDRESSES_KEY);
    }
  };

  // ── Profile Operations ──────────────────────────────────────────────────────

  const updateProfile = async (data: Partial<CustomerProfile>) => {
    const updated = { ...profile, ...data } as CustomerProfile;
    setProfile(updated);
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(updated));

    if (user?.id) {
      await supabase.from('profiles').upsert([{
        id: user.id,
        name: updated.name || '',
        phone: updated.phone || '',
        email: updated.email || user.email || '',
        updated_at: new Date().toISOString(),
      }]);
    }
  };

  const updateGuestProfile = (data: Partial<CustomerProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...data } as CustomerProfile;
      return updated;
    });
  };

  // ── Address Operations ──────────────────────────────────────────────────────

  const saveAddress = async (address: Omit<CustomerAddress, 'id'>) => {
    if (user?.id) {
      // If new address is default, unset all others
      if (address.isDefault) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const payload = {
        user_id: user.id,
        label: address.label,
        name: address.name,
        phone: address.phone,
        door_no: address.doorNo || '',
        street_area: address.streetArea,
        landmark: address.landmark || '',
        city: address.city,
        pincode: address.pincode,
        is_default: address.isDefault || savedAddresses.length === 0,
      };

      const { data, error } = await supabase
        .from('customer_addresses')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        await fetchAddresses(user.id);
      }
    } else {
      // Guest — localStorage only
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
    }
  };

  const removeAddress = async (addressId: string) => {
    if (user?.id) {
      await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);
      await fetchAddresses(user.id);
    } else {
      setSavedAddresses(prev => prev.filter(a => a.id !== addressId));
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (user?.id) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', user.id);
      await fetchAddresses(user.id);
    } else {
      setSavedAddresses(prev =>
        prev.map(a => ({ ...a, isDefault: a.id === addressId }))
      );
    }
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
        authModalMessage,
        setAuthModalMessage,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateProfile,
        updateGuestProfile,
        saveAddress,
        removeAddress,
        setDefaultAddress,
        refreshAddresses,
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
