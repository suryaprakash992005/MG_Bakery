import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface AddToCartButtonProps {
  product: Product;
  selectedWeight: string;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  selectedWeight,
  className = '',
}) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, selectedWeight, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`relative overflow-hidden font-semibold transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
        added
          ? 'bg-brand-gold-850 text-brand-brown-950 scale-105 shadow-brand-gold-500/20'
          : 'bg-brand-brown-950 hover:bg-brand-brown-900 text-brand-cream-50 hover:text-brand-gold-850 shadow-brand-brown-950/15'
      } ${className}`}
    >
      <span className="flex items-center gap-1.5 justify-center">
        {added ? (
          <>
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Added</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </>
        )}
      </span>
    </button>
  );
};
