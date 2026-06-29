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

  const isOutOfStock = product.status === 'Out of Stock';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOutOfStock) return;

    // Resolve product image boundaries to trigger fly-to-cart effect
    const button = e.currentTarget as HTMLElement;
    const cardContainer = button.closest('.group') || button.closest('.flex-col') || button.closest('div');
    const imgElement = cardContainer?.querySelector('img') as HTMLImageElement;
    if (imgElement) {
      const startRect = imgElement.getBoundingClientRect();
      const flyEvent = new CustomEvent('fly-to-cart', {
        detail: {
          startX: startRect.left + startRect.width / 2 - 25,
          startY: startRect.top + startRect.height / 2 - 25,
          image: imgElement.src
        }
      });
      window.dispatchEvent(flyEvent);
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
        className={`relative overflow-hidden font-semibold bg-slate-200 text-slate-400 border border-slate-350/50 py-2.5 px-6 rounded-full text-xs cursor-not-allowed shadow-none ${className}`}
      >
        <span>Sold Out</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`relative overflow-hidden font-semibold transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
        added
          ? 'bg-brand-gold-850 text-brand-brown-950 scale-105 shadow-brand-gold-500/20'
          : 'bg-brand-brown-950 hover:bg-brand-brown-900 text-brand-cream-50 hover:text-brand-gold-850 shadow-brand-brown-950/15'
      } peer-disabled:opacity-50 ${className}`}
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
