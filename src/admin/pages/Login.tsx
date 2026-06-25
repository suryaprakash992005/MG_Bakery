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

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (
        (email === 'admin@mgiyengar.com' && password === 'admin123') ||
        (email === 'owner@mgiyengar.com' && password === 'owner123') ||
        (email.includes('@') && password.length >= 6)
      ) {
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_user', email);
        navigate('/admin/products');
      } else {
        setError('Invalid administrator credentials.');
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAF6F0] overflow-hidden px-4 select-none">
      {/* Background Decorative Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #2C1A17 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-md z-10">
        {/* Animated Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#2C1A17]/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(44,26,23,0.06)] relative"
        >
          {/* Gold highlight border effect */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-brand-gold-600 to-transparent rounded-t-3xl" />

          {/* Branding / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold-50 border border-brand-gold-250/30 text-brand-gold-800 mb-4 shadow-sm">
              <Coffee className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-playfair font-bold text-[#2C1A17] tracking-wide mb-2">
              M.G. Iyengar Bakery
            </h1>
            <p className="text-xs text-[#2C1A17]/60 font-medium tracking-wide">
              Bakery Website Management Panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-250 text-rose-800 rounded-xl p-3.5 mb-5 text-xs flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1A17]/70">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2C1A17]/40 group-focus-within:text-brand-gold-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mgiyengar.com"
                  className="w-full bg-white border border-[#2C1A17]/15 focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500 rounded-xl py-2.5 pl-10 pr-4 text-[#2C1A17] placeholder-[#2C1A17]/30 text-xs focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1A17]/70">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2C1A17]/40 group-focus-within:text-brand-gold-700 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#2C1A17]/15 focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500 rounded-xl py-2.5 pl-10 pr-10 text-[#2C1A17] placeholder-[#2C1A17]/30 text-xs focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#2C1A17]/40 hover:text-[#2C1A17]/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember checkbox */}
            <div className="flex items-center">
              <label className="relative flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 bg-white border border-[#2C1A17]/15 peer-checked:border-brand-gold-500 peer-checked:bg-brand-gold-500/10 rounded flex items-center justify-center transition-all mr-2.5">
                  {rememberMe && (
                    <svg className="w-2.5 h-2.5 text-brand-gold-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#2C1A17]/60 font-semibold hover:text-[#2C1A17] transition-colors">
                  Remember my session
                </span>
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-gold-800 hover:bg-brand-gold-700 text-[#FAF6F0] font-semibold tracking-wide py-3 rounded-xl transition-all duration-200 shadow-sm transform active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Secure Login'
              )}
            </button>
          </form>

          {/* Access Note footer */}
          <div className="mt-8 border-t border-[#2C1A17]/5 pt-5 text-center">
            <span className="text-[10px] tracking-wide text-brand-gold-800 font-bold uppercase block">
              Authorized Access Only
            </span>
            <p className="text-[9px] text-[#2C1A17]/40 mt-1 font-mono">
              Use your admin or owner password (admin123 / owner123)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
