import React, { useState } from 'react';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface AddToCartButtonProps {
  product: Product;
  selectedWeight: string;
  className?: string;
}

// Global helper for fly-to-cart animation
const triggerFlyToCart = (e: React.MouseEvent, imageUrl: string) => {
  const isMobile = window.innerWidth < 1024;
  const cartIcon = document.getElementById(
    isMobile ? 'shopping-cart-icon-mobile' : 'shopping-cart-icon'
  );
  if (!cartIcon) return;

  const rect = cartIcon.getBoundingClientRect();
  const startX = e.clientX;
  const startY = e.clientY;
  const endX = rect.left + rect.width / 2;
  const endY = rect.top + rect.height / 2;

  // Create a flyer element
  const flyer = document.createElement('div');
  flyer.style.position = 'fixed';
  flyer.style.left = `${startX - 15}px`;
  flyer.style.top = `${startY - 15}px`;
  flyer.style.width = '30px';
  flyer.style.height = '30px';
  flyer.style.borderRadius = '50%';
  flyer.style.backgroundImage = `url(${imageUrl})`;
  flyer.style.backgroundSize = 'cover';
  flyer.style.backgroundPosition = 'center';
  flyer.style.zIndex = '99999';
  flyer.style.pointerEvents = 'none';
  flyer.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
  flyer.style.border = '2px solid #D4AF37';
  flyer.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

  document.body.appendChild(flyer);

  // Force reflow
  flyer.getBoundingClientRect();

  // Animate coordinates and size
  flyer.style.left = `${endX - 8}px`;
  flyer.style.top = `${endY - 8}px`;
  flyer.style.width = '16px';
  flyer.style.height = '16px';
  flyer.style.transform = 'scale(0.1)';
  flyer.style.opacity = '0.3';

  // Remove and bounce cart icon
  setTimeout(() => {
    flyer.remove();
    cartIcon.classList.add('animate-bounce');
    setTimeout(() => {
      cartIcon.classList.remove('animate-bounce');
    }, 400);
  }, 800);
};

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  selectedWeight,
  className = '',
}) => {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.status === 'Out of Stock';

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock || loading || added) return;

    setLoading(true);
    // Simulate brief high-end loading time
    await new Promise((resolve) => setTimeout(resolve, 850));

    addToCart(product, selectedWeight, 1);
    setLoading(false);
    setAdded(true);

    // Trigger visual fly-to-cart animation
    triggerFlyToCart(e, product.image);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={`relative overflow-hidden font-semibold bg-slate-200 text-slate-400 border border-slate-350/50 py-2.5 px-6 rounded-full text-xs cursor-not-allowed shadow-none ${className}`}
      >
        <span>Sold Out</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleAdd}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden font-semibold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
        added
          ? 'bg-brand-gold-850 text-brand-brown-950 shadow-brand-gold-500/20'
          : 'bg-brand-brown-950 hover:bg-brand-brown-900 text-brand-cream-50 hover:text-brand-gold-850 shadow-brand-brown-950/15'
      } ${className}`}
    >
      <span className="flex items-center gap-1.5 justify-center">
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Adding...</span>
          </>
        ) : added ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
            <span>Added</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </>
        )}
      </span>
    </motion.button>
  );
};
