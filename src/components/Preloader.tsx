import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee } from 'lucide-react';

export const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setShow(false), 350);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-[9999] bg-[#1E110F] flex flex-col items-center justify-center select-none"
        >
          <div className="text-center space-y-6 max-w-xs">
            {/* Pulsing luxury logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="w-16 h-16 rounded-full bg-brand-cream-50 flex items-center justify-center text-brand-brown-950 mx-auto shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <Coffee className="w-8 h-8 text-brand-gold-850" />
            </motion.div>

            {/* Typography */}
            <div className="space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-playfair text-xl font-bold text-brand-cream-50 tracking-wider"
              >
                M.G. IYENGAR
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.4 }}
                className="text-[9px] font-bold text-brand-gold-500 uppercase tracking-widest"
              >
                Bakery & Chats Namakkal
              </motion.p>
            </div>

            {/* Loading Indicator */}
            <div className="space-y-2 pt-2">
              <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto">
                <motion.div
                  className="h-full bg-brand-gold-850"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeInOut' }}
                />
              </div>
              <span className="text-[10px] text-brand-cream-100/40 tracking-wider font-medium">
                {progress}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
