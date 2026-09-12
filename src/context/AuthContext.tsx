import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface CustomerProfile {
  id?: string;
  full_name: string;
  name?: string; // backwards compatibility alias for full_name
  phone: string;
  email: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
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
  authModalTab: 'login' | 'signup';
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  authModalMessage?: string;
  setAuthModalMessage: (msg: string) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signupWithEmail: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>;
  updateGuestProfile: (data: Partial<CustomerProfile>) => void;
  saveAddress: (address: Omit<CustomerAddress, 'id'>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  refreshAddresses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const formatAuthError = (err: any): string => {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const msg = typeof err === 'string' ? err : err.message || '';
  const code = err.code || '';

  if (
    code === 'user_already_exists' ||
    msg.toLowerCase().includes('already registered') ||
    msg.toLowerCase().includes('already exists')
  ) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (
    code === 'email_not_confirmed' ||
    msg.toLowerCase().includes('email not confirmed')
  ) {
    return 'Please verify your email address before signing in. Check your inbox for the confirmation link.';
  }
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    msg.toLowerCase().includes('invalid login credentials')
  ) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (
    code === 'email_address_invalid' ||
    msg.toLowerCase().includes('unable to validate email') ||
    msg.toLowerCase().includes('invalid email')
  ) {
    return 'Please enter a valid email address.';
  }
  if (
    code === 'weak_password' ||
    msg.toLowerCase().includes('at least 6 characters')
  ) {
    return 'Password must be at least 6 characters.';
  }
  if (
    code === 'over_email_send_rate_limit' ||
    msg.toLowerCase().includes('rate limit')
  ) {
    return 'Too many attempts. Please wait a few moments before trying again.';
  }
  if (
    msg.toLowerCase().includes('network') ||
    msg.toLowerCase().includes('failed to fetch') ||
    msg.toLowerCase().includes('connection')
  ) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (
    msg.toLowerCase().includes('violates') ||
    msg.toLowerCase().includes('syntax error') ||
    msg.toLowerCase().includes('pgrst')
  ) {
    return 'Unable to process your request at this time. Please try again.';
  }
  return msg;
};

const SAVED_ADDRESSES_KEY = 'mg_saved_addresses';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_ADDRESSES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authModalMessage, setAuthModalMessage] = useState('');

  // ── Upsert profile in Supabase ──────────────────────────────────────────────
  const upsertUserProfile = async (
    userId: string,
    data: { full_name: string; phone: string; email?: string }
  ): Promise<{ data: CustomerProfile | null; error: string | null }> => {
    const baseRow: Record<string, any> = {
      id: userId,
      full_name: data.full_name,
      phone: data.phone,
      email: data.email || '',
      updated_at: new Date().toISOString(),
    };

    let res = await supabase
      .from('profiles')
      .upsert([baseRow], { onConflict: 'id' })
      .select()
      .maybeSingle();

    // Fallback if updated_at or another column is not present
    if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('does not exist'))) {
      const minRow = {
        id: userId,
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || '',
      };
      res = await supabase
        .from('profiles')
        .upsert([minRow], { onConflict: 'id' })
        .select()
        .maybeSingle();
    }

    if (res.error) {
      console.warn('Notice upserting profile in Supabase:', res.error.message);
    }

    const saved = res.data;
    const profileObj: CustomerProfile = {
      id: userId,
      full_name: saved?.full_name || data.full_name,
      name: saved?.full_name || data.full_name,
      phone: saved?.phone || data.phone,
      email: saved?.email || data.email || '',
      currency: saved?.currency || 'INR',
      created_at: saved?.created_at,
      updated_at: saved?.updated_at,
    };

    return { data: profileObj, error: null };
  };

  // ── Fetch profile from Supabase ─────────────────────────────────────────────
  const fetchProfile = async (userId: string, userEmail?: string): Promise<CustomerProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        const profileObj: CustomerProfile = {
          id: data.id,
          full_name: data.full_name || '',
          name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || userEmail || '',
          currency: data.currency || 'INR',
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setProfile(profileObj);
        return profileObj;
      } else {
        // Profile row doesn't exist yet — create it from auth metadata
        const { data: authData } = await supabase.auth.getUser();
        const meta = authData?.user?.user_metadata || {};
        const { data: createdProfile } = await upsertUserProfile(userId, {
          full_name: meta.full_name || meta.name || '',
          phone: meta.phone || '',
          email: userEmail || authData?.user?.email || '',
        });
        if (createdProfile) {
          setProfile(createdProfile);
          return createdProfile;
        }
      }
    } catch (err) {
      console.warn('Error fetching profile from Supabase:', err);
    }
    return null;
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
      } else {
        setProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
        fetchAddresses(session.user.id);
      } else {
        setProfile(null);
        setSavedAddresses([]);
        localStorage.removeItem(SAVED_ADDRESSES_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth Operations ─────────────────────────────────────────────────────────

  const loginWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: formatAuthError(error) };
      }
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email);
        await fetchAddresses(data.user.id);
        setIsAuthModalOpen(false);
        setAuthModalMessage('');
      }
      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  const signupWithEmail = async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone,
          }
        }
      });

      if (error) {
        // If Supabase Auth's confirmation email provider is rate-limited (free tier limit of 3-4 emails/hr),
        // do not block the bakery customer from completing registration and notifying the Admin Panel
        const isRateLimit =
          error.code === 'over_email_send_rate_limit' ||
          (error as any).status === 429 ||
          error.message?.toLowerCase().includes('rate limit');

        if (isRateLimit) {
          const fallbackId = `cust_${Date.now()}`;
          const fallbackProfile: CustomerProfile = {
            id: fallbackId,
            full_name: name,
            name,
            phone,
            email,
            currency: 'INR',
            created_at: new Date().toISOString(),
          };

          // Broadcast to Realtime channel and sync to local admin customer cache
          try {
            const broadcastPayload = {
              userId: fallbackId,
              name,
              phone,
              email,
              registeredAt: fallbackProfile.created_at,
            };

            // Save to local cache immediately
            try {
              const saved = localStorage.getItem('admin_customers');
              const list = saved ? JSON.parse(saved) : [];
              const cleanPhone = (phone || '').replace(/\D/g, '');
              const exists = list.some((c: any) =>
                (fallbackId && c.userId === fallbackId) ||
                (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone) ||
                (email && c.email && c.email.toLowerCase() === email.toLowerCase())
              );
              if (!exists) {
                list.unshift({
                  userId: fallbackId,
                  name,
                  phone,
                  email,
                  registeredAt: broadcastPayload.registeredAt,
                  totalOrders: 0,
                  totalSpent: 0,
                  avgOrderValue: 0,
                });
                localStorage.setItem('admin_customers', JSON.stringify(list));
              }
            } catch {}

            const channel = supabase.channel('admin-customer-events');
            if (channel.state === 'joined') {
              channel.send({
                type: 'broadcast',
                event: 'new_customer',
                payload: broadcastPayload,
              });
            } else {
              channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                  channel.send({
                    type: 'broadcast',
                    event: 'new_customer',
                    payload: broadcastPayload,
                  });
                }
              });
            }
          } catch (rtErr) {
            console.warn('Realtime broadcast notice:', rtErr);
          }

          setProfile(fallbackProfile);
          setIsAuthModalOpen(false);
          setAuthModalMessage('');
          return { error: null, needsEmailConfirmation: false };
        }

        return { error: formatAuthError(error) };
      }

      // Check for duplicate account where Supabase doesn't error but returns empty identities
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }

      if (data.user) {
        // Upsert into public.profiles immediately using user's UUID
        const { data: savedProfile, error: profileErr } = await upsertUserProfile(data.user.id, {
          full_name: name,
          phone,
          email,
        });

        if (profileErr) {
          console.warn('Profile upsert warning:', profileErr);
        }

        // Broadcast to Realtime channel and sync to local admin customer cache
        try {
          const broadcastPayload = {
            userId: data.user.id,
            name,
            phone,
            email,
            registeredAt: new Date().toISOString(),
          };

          // Save to local cache immediately
          try {
            const saved = localStorage.getItem('admin_customers');
            const list = saved ? JSON.parse(saved) : [];
            const cleanPhone = (phone || '').replace(/\D/g, '');
            const exists = list.some((c: any) =>
              (data.user?.id && c.userId === data.user.id) ||
              (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone) ||
              (email && c.email && c.email.toLowerCase() === email.toLowerCase())
            );
            if (!exists) {
              list.unshift({
                userId: data.user.id,
                name,
                phone,
                email,
                registeredAt: broadcastPayload.registeredAt,
                totalOrders: 0,
                totalSpent: 0,
                avgOrderValue: 0,
              });
              localStorage.setItem('admin_customers', JSON.stringify(list));
            }
          } catch {}

          const channel = supabase.channel('admin-customer-events');
          if (channel.state === 'joined') {
            channel.send({
              type: 'broadcast',
              event: 'new_customer',
              payload: broadcastPayload,
            });
          } else {
            channel.subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                channel.send({
                  type: 'broadcast',
                  event: 'new_customer',
                  payload: broadcastPayload,
                });
              }
            });
          }
        } catch (rtErr) {
          console.warn('Realtime broadcast notice:', rtErr);
        }

        // If session was returned immediately (auto-confirm enabled)
        if (data.session) {
          setUser(data.user);
          setSession(data.session);
          if (savedProfile) {
            setProfile(savedProfile);
          }
          setIsAuthModalOpen(false);
          setAuthModalMessage('');
          return { error: null, needsEmailConfirmation: false };
        } else {
          // Email confirmation is required by Supabase Auth configuration
          return { error: null, needsEmailConfirmation: true };
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setSavedAddresses([]);
      localStorage.removeItem(SAVED_ADDRESSES_KEY);
    }
  };

  // ── Profile Operations ──────────────────────────────────────────────────────

  const updateProfile = async (data: Partial<CustomerProfile>) => {
    if (!user?.id) return;

    const newFullName = data.full_name || data.name || profile?.full_name || '';
    const newPhone = data.phone || profile?.phone || '';
    const newEmail = data.email || profile?.email || user.email || '';

    const { data: updated, error } = await upsertUserProfile(user.id, {
      full_name: newFullName,
      phone: newPhone,
      email: newEmail,
    });

    if (!error && updated) {
      setProfile(updated);
    }
  };

  const updateGuestProfile = (data: Partial<CustomerProfile>) => {
    setProfile(prev => {
      if (!prev) return null;
      return { ...prev, ...data } as CustomerProfile;
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
