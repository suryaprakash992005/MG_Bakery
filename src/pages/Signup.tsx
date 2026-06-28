import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Eye, EyeOff, Lock, Mail, ShieldAlert, User, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isSubmitting) {
      navigate('/profile');
    }
  }, [user, navigate, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !phone) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const { error: signUpError } = await signUp(email, password, name, phone);

    if (signUpError) {
      setError(signUpError.message || 'An error occurred during signup.');
      setIsSubmitting(false);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAF7F2] overflow-hidden px-4 pt-20 select-none">
      {/* Background Decorative Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #2A0E0A 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="w-full max-w-md z-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#2A0E0A]/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(42,14,10,0.06)] relative"
        >
          {/* Gold highlight border effect */}
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent rounded-t-3xl" />

          {/* Branding / Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-cream-50 border border-brand-cream-100 text-brand-gold-700 mb-4 shadow-sm">
              <Coffee className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-playfair font-bold text-[#2A0E0A] tracking-wide mb-2">
              Create Account
            </h1>
            <p className="text-xs text-[#2A0E0A]/60 font-medium tracking-wide">
              Sign up to start ordering fresh delights and view your purchase metrics
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3.5 mb-4 text-xs flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A0E0A]/70 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A0E0A]/40">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF7F2]/40 rounded-xl border border-brand-cream-200 text-sm text-[#2A0E0A] placeholder-[#2A0E0A]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A0E0A]/70 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A0E0A]/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF7F2]/40 rounded-xl border border-brand-cream-200 text-sm text-[#2A0E0A] placeholder-[#2A0E0A]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A0E0A]/70 uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A0E0A]/40">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#FAF7F2]/40 rounded-xl border border-brand-cream-200 text-sm text-[#2A0E0A] placeholder-[#2A0E0A]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A0E0A]/70 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2A0E0A]/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-11 pr-11 py-2.5 bg-[#FAF7F2]/40 rounded-xl border border-brand-cream-200 text-sm text-[#2A0E0A] placeholder-[#2A0E0A]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2A0E0A]/40 hover:text-[#2A0E0A] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3.5 mt-2 bg-[#2A0E0A] hover:bg-[#1f0a07] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#2A0E0A]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          {/* Direct Switch to Login */}
          <div className="mt-6 text-center border-t border-brand-cream-100/50 pt-5">
            <p className="text-xs text-[#2A0E0A]/60">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-gold-700 hover:text-brand-gold-800 font-bold transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
