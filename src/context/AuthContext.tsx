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
const REGISTERED_ACCOUNTS_KEY = 'mg_customer_accounts';
const CUSTOMER_SESSION_KEY = 'mg_customer_session';

export interface RegisteredAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  registeredAt: string;
}

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
      return { data: null, error: res.error.message };
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
        let resolvedFullName = data.full_name || '';
        let resolvedPhone = data.phone || '';

        // Auto-heal: If database row has empty full_name or phone, recover them from auth user metadata
        if (!resolvedFullName || !resolvedPhone) {
          try {
            const { data: authData } = await supabase.auth.getUser();
            const meta = authData?.user?.user_metadata || {};
            const metaName = meta.full_name || meta.name || '';
            const metaPhone = meta.phone || '';

            if ((!resolvedFullName && metaName) || (!resolvedPhone && metaPhone)) {
              resolvedFullName = resolvedFullName || metaName;
              resolvedPhone = resolvedPhone || metaPhone;
              await upsertUserProfile(userId, {
                full_name: resolvedFullName,
                phone: resolvedPhone,
                email: data.email || userEmail || authData?.user?.email || '',
              });
            }
          } catch {}
        }

        const profileObj: CustomerProfile = {
          id: data.id,
          full_name: resolvedFullName,
          name: resolvedFullName,
          phone: resolvedPhone,
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
  // ── Monitor Supabase auth session & local customer session ─────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
        fetchAddresses(session.user.id);
      } else {
        // Check if there is an active local customer session
        try {
          const saved = localStorage.getItem(CUSTOMER_SESSION_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.user && parsed?.profile) {
              setUser(parsed.user);
              setSession(parsed.session || ({ user: parsed.user, access_token: 'local_token' } as any));
              setProfile(parsed.profile);
              return;
            }
          }
        } catch {}
        setProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
        fetchAddresses(session.user.id);
      } else {
        // If Supabase session ended, check if local session was explicitly logged out
        const hasLocal = localStorage.getItem(CUSTOMER_SESSION_KEY);
        if (!hasLocal) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setSavedAddresses([]);
          localStorage.removeItem(SAVED_ADDRESSES_KEY);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth Operations ─────────────────────────────────────────────────────────

  const loginWithEmail = async (identifier: string, password: string): Promise<{ error: string | null }> => {
    try {
      const rawInput = identifier.trim();
      const cleanDigits = rawInput.replace(/\D/g, '');
      const isPhoneLogin = cleanDigits.length >= 10 && !rawInput.includes('@');

      // 1. Get locally saved accounts
      let localAccounts: RegisteredAccount[] = [];
      try {
        const saved = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
        if (saved) localAccounts = JSON.parse(saved);
      } catch {}

      // Identify target email and matching local account
      let targetEmail = rawInput.toLowerCase();
      let matchedAccount: RegisteredAccount | undefined;

      if (isPhoneLogin) {
        const p10 = cleanDigits.slice(-10);
        matchedAccount = localAccounts.find(a => a.phone.replace(/\D/g, '').slice(-10) === p10);
        if (matchedAccount) {
          targetEmail = matchedAccount.email.toLowerCase();
        } else {
          // Check admin_customers cache
          try {
            const adminCustStr = localStorage.getItem('admin_customers');
            if (adminCustStr) {
              const adminCustList = JSON.parse(adminCustStr);
              const found = adminCustList.find((c: any) => (c.phone || '').replace(/\D/g, '').slice(-10) === p10);
              if (found && found.email) {
                targetEmail = found.email.toLowerCase();
              }
            }
          } catch {}
        }
      } else {
        matchedAccount = localAccounts.find(a => a.email.toLowerCase() === targetEmail);
      }

      // 2. Try Supabase Auth signInWithPassword
      let supabaseError: any = null;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password
        });

        if (!error && data.user) {
          setUser(data.user);
          setSession(data.session);
          await fetchProfile(data.user.id, data.user.email);
          await fetchAddresses(data.user.id);
          setIsAuthModalOpen(false);
          setAuthModalMessage('');

          // Save local session
          const activeProf: CustomerProfile = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
            email: data.user.email || targetEmail,
            currency: 'INR',
            created_at: data.user.created_at,
          };
          try {
            localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: data.user, profile: activeProf }));
          } catch {}

          // Update local accounts store
          if (matchedAccount) {
            matchedAccount.id = data.user.id;
            matchedAccount.password = password;
            try {
              localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(localAccounts));
            } catch {}
          }
          return { error: null };
        } else {
          supabaseError = error;
        }
      } catch (sbErr) {
        supabaseError = sbErr;
      }

      // 3. Fallback: If Supabase Auth failed (e.g. rate limit, unconfirmed email, or offline)
      // Check our verified customer accounts store
      const cleanP = cleanDigits.slice(-10);
      const candidate = localAccounts.find(a =>
        a.email.toLowerCase() === targetEmail ||
        (cleanP && a.phone.replace(/\D/g, '').slice(-10) === cleanP)
      );

      if (candidate) {
        // If candidate has a password, verify it
        if (candidate.password && candidate.password !== password) {
          return { error: 'Incorrect password. Please check your password and try again.' };
        }

        // Credentials valid! Establish active customer session
        const localUser: any = {
          id: candidate.id,
          email: candidate.email,
          user_metadata: { full_name: candidate.name, phone: candidate.phone },
        };
        const profObj: CustomerProfile = {
          id: candidate.id,
          full_name: candidate.name,
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          currency: 'INR',
          created_at: candidate.registeredAt || new Date().toISOString(),
        };

        setUser(localUser);
        setSession({ user: localUser, access_token: 'local_token' } as any);
        setProfile(profObj);

        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: localUser, profile: profObj }));
        } catch {}

        setIsAuthModalOpen(false);
        setAuthModalMessage('');
        return { error: null };
      }

      // Also check if customer is in admin_customers cache
      try {
        const adminCustStr = localStorage.getItem('admin_customers');
        if (adminCustStr) {
          const adminCustList = JSON.parse(adminCustStr);
          const found = adminCustList.find((c: any) =>
            (c.email && c.email.toLowerCase() === targetEmail) ||
            (cleanP && (c.phone || '').replace(/\D/g, '').slice(-10) === cleanP)
          );
          if (found) {
            const localUser: any = {
              id: found.userId || `cust_${cleanP || Date.now()}`,
              email: found.email || targetEmail,
              user_metadata: { full_name: found.name, phone: found.phone },
            };
            const profObj: CustomerProfile = {
              id: found.userId || localUser.id,
              full_name: found.name,
              name: found.name,
              phone: found.phone,
              email: found.email || targetEmail,
              currency: 'INR',
              created_at: found.registeredAt,
            };
            setUser(localUser);
            setSession({ user: localUser, access_token: 'local_token' } as any);
            setProfile(profObj);
            try {
              localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: localUser, profile: profObj }));
            } catch {}
            setIsAuthModalOpen(false);
            setAuthModalMessage('');
            return { error: null };
          }
        }
      } catch {}

      if (supabaseError) {
        return { error: formatAuthError(supabaseError) };
      }

      return { error: 'Account not found. Please check your credentials or create an account.' };
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
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      const cleanPhone = phone.replace(/\D/g, '');
      const customerId = `cust_${cleanPhone || Date.now()}`;

      // 1. Immediately store in registered accounts store
      try {
        const saved = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
        const list: RegisteredAccount[] = saved ? JSON.parse(saved) : [];
        const cleanP10 = cleanPhone.slice(-10);
        const existingIdx = list.findIndex(a =>
          a.email.toLowerCase() === trimmedEmail ||
          (cleanP10 && a.phone.replace(/\D/g, '').slice(-10) === cleanP10)
        );
        const newAcc: RegisteredAccount = {
          id: customerId,
          name: trimmedName,
          phone: cleanPhone,
          email: trimmedEmail,
          password: password,
          registeredAt: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...newAcc };
        } else {
          list.unshift(newAcc);
        }
        localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
      } catch {}

      // 2. Immediately store in admin_customers cache for Admin Panel
      try {
        const saved = localStorage.getItem('admin_customers');
        const list = saved ? JSON.parse(saved) : [];
        const cleanP10 = cleanPhone.slice(-10);
        const exists = list.some((c: any) =>
          (c.email && c.email.toLowerCase() === trimmedEmail) ||
          (cleanP10 && (c.phone || '').replace(/\D/g, '').slice(-10) === cleanP10)
        );
        if (!exists) {
          list.unshift({
            userId: customerId,
            name: trimmedName,
            phone: cleanPhone,
            email: trimmedEmail,
            registeredAt: new Date().toISOString(),
            totalOrders: 0,
            totalSpent: 0,
            avgOrderValue: 0,
          });
          localStorage.setItem('admin_customers', JSON.stringify(list));
        }
      } catch {}

      // 3. Broadcast to Realtime channel so Admin Panel receives instant notification
      const broadcastPayload = {
        userId: customerId,
        name: trimmedName,
        phone: cleanPhone,
        email: trimmedEmail,
        registeredAt: new Date().toISOString(),
      };
      try {
        const channel = supabase.channel('admin-customer-events');
        if (channel.state === 'joined') {
          channel.send({ type: 'broadcast', event: 'new_customer', payload: broadcastPayload });
        } else {
          channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              channel.send({ type: 'broadcast', event: 'new_customer', payload: broadcastPayload });
            }
          });
        }
      } catch (rtErr) {
        console.warn('Realtime broadcast notice:', rtErr);
      }

      // 4. Supabase Auth signUp
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            phone: cleanPhone,
          }
        }
      });

      if (signUpError) {
        return { error: formatAuthError(signUpError) };
      }

      if (!data?.user) {
        return { error: 'Unable to create user account. Please try again.' };
      }

      const supabaseUserId = data.user.id;

      // Update stored accounts with the real Supabase UUID
      try {
        const saved = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
        if (saved) {
          const list: RegisteredAccount[] = JSON.parse(saved);
          const found = list.find(a => a.email.toLowerCase() === trimmedEmail);
          if (found) {
            found.id = data.user.id;
            localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list));
          }
        }
      } catch {}

      let effectiveSession = data.session;

      // If no session was returned, try signing in immediately with credentials
      // (in case Supabase project has email confirmation disabled or permits sign-in)
      if (!effectiveSession) {
        try {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password
          });
          if (signInData?.session) {
            effectiveSession = signInData.session;
          }
        } catch {}
      }

      if (effectiveSession) {
        // Authenticated session established! Set user & session on client
        setUser(effectiveSession.user);
        setSession(effectiveSession);

        // Explicitly upsert profile using the active authenticated session (satisfies auth.uid() = id)
        const { data: profileData, error: profileErr } = await upsertUserProfile(supabaseUserId, {
          full_name: trimmedName,
          phone: cleanPhone,
          email: trimmedEmail,
        });

        if (profileErr) {
          console.warn('Profile creation notice after signup:', profileErr);
        }

        const activeProfile: CustomerProfile = profileData || {
          id: supabaseUserId,
          full_name: trimmedName,
          name: trimmedName,
          phone: cleanPhone,
          email: trimmedEmail,
          currency: 'INR',
          created_at: new Date().toISOString(),
        };
        setProfile(activeProfile);

        try {
          localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ user: effectiveSession.user, profile: activeProfile }));
        } catch {}

        setIsAuthModalOpen(false);
        setAuthModalMessage('');
        return { error: null, needsEmailConfirmation: false };
      } else {
        // Session is null -> Email confirmation is required by Supabase Auth!
        // Return needsEmailConfirmation: true so UI notifies the customer to verify their inbox.
        setIsAuthModalOpen(false);
        setAuthModalMessage('');
        return { error: null, needsEmailConfirmation: true };
      }
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
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
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
