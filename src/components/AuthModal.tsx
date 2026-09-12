import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Phone, User, Check, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginWithEmail,
    signupWithEmail,
    authModalMessage,
    setAuthModalMessage,
    profile,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage('');
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const val = email.trim();
    if (!val || !password) {
      setError('Please fill in both mobile number / email and password');
      return;
    }

    const cleanDigits = val.replace(/\D/g, '');
    const isPhone = cleanDigits.length >= 10;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    if (!isPhone && !isEmail) {
      setError('Please enter a valid 10-digit mobile number or email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const { error: err } = await loginWithEmail(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccessMsg('Welcome back! Signed in successfully.');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        resetForm();
      }, 1000);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const trimmedName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await signupWithEmail(trimmedEmail, password, trimmedName, cleanPhone);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      if (res.needsEmailConfirmation) {
        setSuccessMsg('Account created! Please check your email inbox to verify your account.');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          resetForm();
        }, 3000);
      } else {
        setSuccessMsg('Welcome to M.G. Bakery! Account created successfully.');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          resetForm();
        }, 1200);
      }
    }
  };


  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#2A0E0A]/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#C9A227]/20"
          >
            {/* Header / Brand Banner */}
            <div className="bg-gradient-to-br from-[#2A0E0A] via-[#401C16] to-[#2A0E0A] p-5 sm:p-6 text-[#FAF7F2] relative shrink-0">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {authModalMessage && (
                <div className="bg-[#C9A227]/20 border border-[#C9A227]/40 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <p className="text-xs text-[#FAF7F2]/90">{authModalMessage}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#C9A227] flex items-center justify-center text-[#2A0E0A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227]">
                  M.G. Iyengar Bakery
                </span>
              </div>
              <h2 className="font-playfair text-xl sm:text-2xl font-bold">
                {authModalTab === 'login' ? 'Sign In to Your Account' : 'Create Your Bakery Account'}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {authModalTab === 'login'
                  ? 'Track past orders, save delivery addresses & access exclusive bakery treats.'
                  : 'Join Mohanur’s favorite traditional bakery for fast ordering & rewards.'}
              </p>

              {/* Tabs Switcher */}
              <div className="flex bg-black/25 p-1 rounded-xl mt-5 text-xs font-semibold">
                <button
                  onClick={() => { setAuthModalTab('login'); resetForm(); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'login' ? 'bg-[#C9A227] text-[#2A0E0A] shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalTab('signup'); resetForm(); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'signup' ? 'bg-[#C9A227] text-[#2A0E0A] shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(92vh-180px)]">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <X className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Check className="w-4 h-4 flex-shrink-0 text-green-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* Login Form */}
              {authModalTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Mobile Number or Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="9876543210 or you@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {loading ? 'Signing In…' : 'Sign In'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {authModalTab === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Sundar Raman"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Mobile Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none focus:border-[#C9A227] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="email@domain.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none focus:border-[#C9A227] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Create Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {loading ? 'Creating Account…' : 'Create Bakery Account'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}



              {/* Footer note */}
              <p className="text-center text-[10px] text-[#2C1A17]/40 pt-2">
                Your cart items are preserved after login ✓
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
