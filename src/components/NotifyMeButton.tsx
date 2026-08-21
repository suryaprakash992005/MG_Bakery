import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Phone, User } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface NotifyMeButtonProps {
  productId: string;
  productName: string;
}

export const NotifyMeButton: React.FC<NotifyMeButtonProps> = ({
  productId,
  productName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await supabase.from('notify_me').insert([{
        product_id: productId,
        product_name: productName,
        customer_name: name.trim() || null,
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
      }]);
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setName('');
        setPhone('');
        setEmail('');
      }, 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border-2 border-[#C9A227]/50 text-[#2A0E0A] bg-[#C9A227]/8 hover:bg-[#C9A227]/15 hover:border-[#C9A227] cursor-pointer transition-all active:scale-95"
      >
        <Bell className="w-4 h-4 text-[#C9A227]" />
        Notify Me When Available
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#2A0E0A]/50 backdrop-blur-sm z-[150]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="fixed inset-x-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-[151] bg-white rounded-3xl shadow-2xl w-full sm:w-[380px] p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] flex items-center justify-center mb-3 border border-[#C9A227]/20">
                    <Bell className="w-6 h-6 text-[#C9A227]" />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-[#2A0E0A]">Notify Me</h3>
                  <p className="text-xs text-[#2C1A17]/60 mt-1 leading-relaxed">
                    We'll let you know when <strong className="text-[#2A0E0A]">{productName}</strong> is back in stock.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center cursor-pointer hover:bg-[#F0E8D8] transition-colors"
                >
                  <X className="w-4 h-4 text-[#2A0E0A]" />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-4 space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto"
                  >
                    <Check className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <p className="font-bold text-[#2A0E0A] text-sm">We'll notify you!</p>
                  <p className="text-xs text-[#2C1A17]/60">You'll receive a call/WhatsApp when this item is available.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C1A17]/30" />
                    <input
                      type="text"
                      placeholder="Your Name (optional)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-[#C9A227] rounded-xl text-xs font-medium focus:outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C1A17]/30" />
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp Number *"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-[#C9A227] rounded-xl text-xs font-medium focus:outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-[10px] text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3.5 rounded-full cursor-pointer transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Notify Me When Available
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
