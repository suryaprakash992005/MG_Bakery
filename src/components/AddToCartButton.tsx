import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface AddToCartButtonProps {
  product: Product;
  selectedWeight: string;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  selectedWeight,
  className = '',
}) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const isOutOfStock = product.status === 'Out of Stock';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;

    // Trigger visual particles burst
    const numParticles = 8;
    const newParticles: Particle[] = Array.from({ length: numParticles }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / numParticles + (Math.random() - 0.5) * 0.3;
      const distance = 35 + Math.random() * 40;
      return {
        id: Date.now() + i + Math.random(),
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 8 + Math.random() * 10,
        delay: Math.random() * 0.08,
      };
    });
    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 800);

    // Resolve product image boundaries to trigger fly-to-cart effect
    const button = e.currentTarget as HTMLElement;
    const cardContainer = button.closest('.group') || button.closest('.flex-col') || button.closest('div');
    const imgElement = cardContainer?.querySelector('img') as HTMLImageElement;
    if (imgElement) {
      const startRect = imgElement.getBoundingClientRect();
      import('../utils/animationHelper').then(({ triggerFlyToCart }) => {
        triggerFlyToCart(startRect, imgElement.src);
      });
    }

    addToCart(product, selectedWeight, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={`relative overflow-hidden font-semibold bg-slate-100 text-slate-400 border border-slate-200/50 py-2.5 px-6 rounded-full text-xs cursor-not-allowed shadow-none ${className}`}
      >
        <span>Sold Out</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`relative overflow-hidden font-semibold transition-all duration-500 transform active:scale-[0.93] shadow-md flex items-center justify-center gap-2 cursor-pointer group ${
        added
          ? 'bg-[#C9A227] text-[#FAF7F2] scale-105 shadow-[#C9A227]/25'
          : 'bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] shadow-brand-brown-950/15'
      } peer-disabled:opacity-50 ${className}`}
    >
      {/* Sparkle Particles Burst */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: p.delay }}
            className="absolute pointer-events-none z-20"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: `-${p.size / 2}px`,
              marginTop: `-${p.size / 2}px`,
            }}
          >
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9L12 0Z" fill="#D4AF37" />
            </svg>
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Glossy reflective shine overlay effect on hover */}
      {!added && (
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
      )}

      <span className="flex items-center gap-1.5 justify-center z-10 relative">
        {added ? (
          <>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Added
            </motion.span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
            <span>Add to Cart</span>
          </>
        )}
      </span>
    </button>
  );
};

