import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingBag, Trash2, ArrowRight, Sparkles,
  Package, CheckCircle, XCircle, ChevronRight
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';

// ─── Price Display Helper ────────────────────────────────────────────────────

const getDisplayPrice = (price: number | Record<string, number>): number => {
  if (typeof price === 'number') return price;
  return price.halfKg ?? price.oneKg ?? price.piece ?? Object.values(price)[0] ?? 0;
};

// ─── Wishlist Item Card ──────────────────────────────────────────────────────

interface WishlistCardProps {
  item: {
    id: string;
    name: string;
    image: string;
    price: number | Record<string, number>;
    category: string;
    status?: string;
    isEggless?: boolean;
    addedAt: string;
  };
}

const WishlistCard: React.FC<WishlistCardProps> = ({ item }) => {
  const { removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { products } = useBakeryDatabase();

  // Get live product data from DB (price may have changed)
  const liveProduct = products.find(p => p.id === item.id);
  const currentPrice = liveProduct
    ? getDisplayPrice(liveProduct.price as number | Record<string, number>)
    : getDisplayPrice(item.price);
  const isAvailable = liveProduct
    ? liveProduct.status === 'Available'
    : item.status !== 'Out of Stock';

  const handleAddToCart = () => {
    if (!isAvailable || !liveProduct) return;
    addToCart(
      {
        id: item.id,
        name: item.name,
        description: '',
        price: liveProduct.price as any,
        image: item.image,
        category: item.category,
      },
      typeof liveProduct.price === 'object' ? '½ Kg' : 'Standard',
      1
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white rounded-3xl border border-[#2C1A17]/8 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF6F0]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${!isAvailable ? 'opacity-60' : ''}`}
        />

        {/* Unavailability Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-[#2A0E0A]/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-playfair border-2 border-white/50 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold">
              Currently Unavailable
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-[#2A0E0A]/80 text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        {/* Eggless Badge */}
        {item.isEggless && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" />
              EGGLESS
            </span>
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={() => removeFromWishlist(item.id)}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2A0E0A] hover:bg-red-50 hover:text-red-500 transition-all shadow-md cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 active:scale-90"
          title="Remove from wishlist"
          aria-label="Remove from wishlist"
        >
          <Heart className="w-4 h-4 fill-[#C9A227] text-[#C9A227]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-playfair text-base font-bold text-[#2A0E0A] line-clamp-1">{item.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-bold text-[#2A0E0A]">₹{currentPrice}</span>
            {isAvailable ? (
              <span className="flex items-center gap-1 text-[10px] text-green-700 font-semibold">
                <CheckCircle className="w-3 h-3" /> Available
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
                <XCircle className="w-3 h-3" /> Unavailable
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isAvailable ? (
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md shadow-[#2A0E0A]/10"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          ) : (
            <div className="flex-1 bg-[#2A0E0A]/10 text-[#2A0E0A]/40 py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed">
              <Package className="w-3.5 h-3.5" />
              Currently Unavailable
            </div>
          )}
          <button
            onClick={() => removeFromWishlist(item.id)}
            className="w-10 h-10 rounded-full border border-[#2C1A17]/10 flex items-center justify-center text-[#2C1A17]/50 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all cursor-pointer"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Wishlist Page ────────────────────────────────────────────────────────────

export const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistItems, clearWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { products } = useBakeryDatabase();

  const handleAddAllToCart = () => {
    wishlistItems.forEach(item => {
      const liveProduct = products.find(p => p.id === item.id);
      if (!liveProduct || liveProduct.status !== 'Available') return;
      addToCart(
        {
          id: item.id,
          name: item.name,
          description: '',
          price: liveProduct.price as any,
          image: item.image,
          category: item.category,
        },
        typeof liveProduct.price === 'object' ? '½ Kg' : 'Standard',
        1
      );
    });
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] pt-24 pb-28 lg:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              <span className="text-[10px] font-bold text-[#C9A227] uppercase tracking-widest">
                M.G. Iyengar Bakery
              </span>
            </div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-extrabold text-[#2A0E0A]">
              My Wishlist
            </h1>
            {wishlistCount > 0 && (
              <p className="text-sm text-[#2A0E0A]/60 mt-1">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </p>
            )}
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={clearWishlist}
                className="text-xs font-bold text-[#2C1A17]/50 hover:text-red-500 transition-colors cursor-pointer px-3 py-2 rounded-full hover:bg-red-50 border border-transparent hover:border-red-100"
              >
                Clear All
              </button>
              <button
                onClick={handleAddAllToCart}
                className="bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add All to Cart
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-white border border-[#2C1A17]/10 flex items-center justify-center shadow-lg mb-6"
            >
              <Heart className="w-10 h-10 text-[#C9A227]/40" />
            </motion.div>
            <h2 className="font-playfair text-2xl font-bold text-[#2A0E0A] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-[#2A0E0A]/55 max-w-sm font-light leading-relaxed mb-8">
              Save your favourite cakes, pastries, and bakery items here. Click the ♡ heart on any product to add it.
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold text-sm px-8 py-3.5 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Explore Menu
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          // Wishlist Grid
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {wishlistItems.map(item => (
                <WishlistCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Browse More CTA */}
        {wishlistItems.length > 0 && (
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/menu')}
              className="text-sm font-semibold text-[#2A0E0A]/60 hover:text-[#C9A227] transition-colors cursor-pointer flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              Continue Browsing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
