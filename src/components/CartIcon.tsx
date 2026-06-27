import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CartIconProps {
  className?: string;
  isMobile?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({ className = '', isMobile = false }) => {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [isShaking, setIsShaking] = React.useState(false);
  const prevCount = React.useRef(totalItemsCount);

  React.useEffect(() => {
    if (totalItemsCount > prevCount.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
    prevCount.current = totalItemsCount;
  }, [totalItemsCount]);

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className={`relative p-2.5 rounded-full transition-all duration-300 transform active:scale-95 flex items-center justify-center cursor-pointer pointer-events-auto ${
        isShaking ? 'animate-shake' : ''
      } ${
        isMobile
          ? 'bg-brand-brown-950 text-brand-gold-850 hover:bg-brand-brown-900 border border-brand-brown-900 shadow-md'
          : 'bg-brand-cream-50 hover:bg-brand-cream-100/50 text-brand-brown-950 hover:text-brand-gold-850 border border-brand-cream-100 shadow-sm'
      } ${className}`}
      aria-label="Open Shopping Cart"
    >
      <ShoppingBag className={`${isMobile ? 'w-4.5 h-4.5' : 'w-5 h-5'}`} />
      
      <AnimatePresence>
        {totalItemsCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center border shadow-sm ${
              isMobile
                ? 'bg-brand-gold-850 text-brand-brown-950 border-brand-brown-950'
                : 'bg-brand-brown-950 text-brand-cream-50 border-brand-cream-50'
            }`}
          >
            {totalItemsCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
