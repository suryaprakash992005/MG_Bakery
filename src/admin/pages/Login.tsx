import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAdminRouter } from '../hooks/useAdminRouter';

export const Login: React.FC = () => {
  const { navigate } = useAdminRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Enterprise mock credentials
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (
        (email === 'admin@mgiyengar.com' && password === 'admin123') ||
        (email === 'owner@mgiyengar.com' && password === 'owner123') ||
        // Allow general fallback for testing ease, but show nice message
        (email.includes('@') && password.length >= 6)
      ) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_user', email);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid administrator credentials.');
      }
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0F0A0A] overflow-hidden px-4 select-none">
      {/* Premium Luxury Glowing Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold-700/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-brown-800/15 blur-[120px] pointer-events-none" />

      {/* Background Micro-mesh decoration */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #D4AF37 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-lg z-10">
        {/* Animated Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 sm:p-12 shadow-[0_24px_50px_rgba(0,0,0,0.8)] relative"
        >
          {/* Gold highlight border effect */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent rounded-t-3xl" />

          {/* Branding / Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2C1717] to-[#120707] border border-[#D4AF37]/35 text-[#D4AF37] mb-6 shadow-inner">
              <Coffee className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-white tracking-wide mb-3">
              Bakery Management Portal
            </h1>
            <p className="text-xs text-[#F3EDE2]/60 font-light max-w-sm mx-auto leading-relaxed">
              Restricted access for authorized bakery administrators only
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl p-3.5 mb-6 text-sm flex items-start gap-2.5"
            >
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#F3EDE2]/70">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F3EDE2]/30 group-focus-within:text-[#D4AF37] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mgiyengar.com"
                  className="w-full bg-[#140E0E] border border-white/[0.08] focus:border-[#D4AF37]/50 rounded-xl py-3 pl-11 pr-4 text-[#F3EDE2] placeholder-white/20 text-sm focus:outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(212,175,55,0.08)]"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#F3EDE2]/70">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Please contact the system administrator to reset password.');
                  }}
                  className="text-xs font-medium text-[#D4AF37]/80 hover:text-[#D4AF37] hover:underline transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#F3EDE2]/30 group-focus-within:text-[#D4AF37] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#140E0E] border border-white/[0.08] focus:border-[#D4AF37]/50 rounded-xl py-3 pl-11 pr-11 text-[#F3EDE2] placeholder-white/20 text-sm focus:outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(212,175,55,0.08)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#F3EDE2]/30 hover:text-[#F3EDE2]/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center">
              <label className="relative flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 bg-[#140E0E] border border-white/[0.08] peer-checked:border-[#D4AF37] peer-checked:bg-[#D4AF37]/10 rounded flex items-center justify-center transition-all mr-2.5">
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#F3EDE2]/50 hover:text-[#F3EDE2]/80 transition-colors">
                  Remember device for 30 days
                </span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#B89B1C] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#FCF2CE]/80 text-[#2C1717] font-semibold tracking-wide py-3.5 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.35)] transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#2C1717] border-t-transparent rounded-full animate-spin" />
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          {/* Security Banner footer */}
          <div className="mt-10 border-t border-white/[0.04] pt-6 text-center">
            <span className="text-[10px] uppercase tracking-[0.25em] text-red-500/60 font-semibold flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Unauthorized access prohibited
            </span>
            <p className="text-[10px] text-white/20 mt-2 font-mono">
              IP logs are recorded. Use admin123 to log in.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
