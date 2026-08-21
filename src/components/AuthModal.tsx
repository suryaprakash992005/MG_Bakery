import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Phone, User, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginWithEmail,
    signupWithEmail,
    updateGuestProfile,
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await loginWithEmail(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccessMsg('Welcome back!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        resetForm();
      }, 1000);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setError('Please fill in all required fields');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await signupWithEmail(email, password, name, phone);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccessMsg('Account created successfully! Check email for verification if prompted.');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        resetForm();
      }, 1500);
    }
  };

  const handleQuickPhoneSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    updateGuestProfile({
      name: name || 'Valued Customer',
      phone,
      email: email || undefined
    });
    setSuccessMsg('Profile details saved for faster checkout!');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      resetForm();
    }, 800);
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
            onClick={() => {
              setIsAuthModalOpen(false);
              resetForm();
            }}
            className="absolute inset-0 bg-[#2A0E0A]/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-[#C9A227]/20"
          >
            {/* Header / Brand Banner */}
            <div className="bg-gradient-to-br from-[#2A0E0A] via-[#401C16] to-[#2A0E0A] p-6 text-[#FAF7F2] relative">
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#C9A227] flex items-center justify-center text-[#2A0E0A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#C9A227]">
                  M.G. Iyengar Bakery
                </span>
              </div>
              <h2 className="font-playfair text-xl sm:text-2xl font-bold">
                {authModalTab === 'login' && 'Sign In to Your Account'}
                {authModalTab === 'signup' && 'Create Your Bakery Account'}
                {authModalTab === 'phone' && 'Express Customer Profile'}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {authModalTab === 'login' && 'Track past orders, save delivery addresses & access exclusive bakery treats.'}
                {authModalTab === 'signup' && 'Join Mohanur’s favorite traditional bakery for fast ordering & rewards.'}
                {authModalTab === 'phone' && 'Save your details for 1-click checkout and live WhatsApp updates.'}
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
                <button
                  onClick={() => { setAuthModalTab('phone'); resetForm(); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    authModalTab === 'phone' ? 'bg-[#C9A227] text-[#2A0E0A] shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Quick Guest
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-4">
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
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
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

              {/* Express Phone Form */}
              {authModalTab === 'phone' && (
                <form onSubmit={handleQuickPhoneSave} className="space-y-3.5">
                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#C9A227]/20 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#2C1A17]/70 leading-relaxed">
                      No password required! Save your name and phone to autofill every checkout and track orders with SMS/WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Your Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">WhatsApp / Mobile Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Save Express Profile
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
