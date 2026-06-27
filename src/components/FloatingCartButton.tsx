import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingCartButton: React.FC = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <AnimatePresence>
      {totalItemsCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, -8, 0],
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            scale: { type: 'spring', stiffness: 260, damping: 20 },
            y: {
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            },
          }}
          id="cart-icon-target-float"
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 lg:hidden bg-brand-brown-950 text-brand-gold-850 hover:bg-brand-brown-900 p-4 rounded-full shadow-xl shadow-brand-brown-950/20 border border-brand-brown-900/50 flex items-center justify-center cursor-pointer pointer-events-auto"
          aria-label="View Shopping Cart"
          whileTap={{ scale: 0.9 }}
        >
          <ShoppingBag className="w-6 h-6" />
          
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-5.5 h-5.5 bg-brand-gold-850 text-brand-brown-950 border border-brand-brown-950 text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            <motion.span
              key={totalItemsCount}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {totalItemsCount}
            </motion.span>
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
