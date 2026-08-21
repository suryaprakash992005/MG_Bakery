import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, ShoppingBag, Zap, Star, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Package, X, Maximize2,
  Minus, Plus, Phone, MessageCircle, Clock, Sparkles,
  ShieldCheck, Award, Users, ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { supabase } from '../utils/supabase';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import { NotifyMeButton } from '../components/NotifyMeButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_verified_purchase?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolvePrice = (price: any, weight: string): number => {
  if (typeof price === 'number') return price;
  if (weight === 'Slice') return price.piece || 0;
  if (weight === '½ Kg') return price.halfKg || 0;
  if (weight === '1 Kg') return price.oneKg || 0;
  if (weight === '1.5 Kg') return Math.round((price.oneKg || 0) * 1.5);
  if (weight === '2 Kg') return (price.oneKg || 0) * 2;
  return price.single || price.halfKg || price.piece || price.oneKg || 0;
};

const getWeightOptions = (price: any): { label: string; key: string }[] => {
  if (typeof price === 'number') return [{ label: 'Standard', key: 'single' }];
  const map: Record<string, string> = {
    piece: 'Slice',
    halfKg: '½ Kg',
    oneKg: '1 Kg',
  };
  return Object.keys(price)
    .filter(k => price[k])
    .map(k => ({ label: map[k] || k, key: k }));
};

// ─── Star Rating Display ──────────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onChange?: (r: number) => void }> = ({
  rating, size = 'sm', interactive = false, onChange
}) => {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          type="button"
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (interactive ? (hover || rating) : rating)
                ? 'fill-[#C9A227] text-[#C9A227]'
                : 'fill-none text-[#2C1A17]/20'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ─── Image Gallery ────────────────────────────────────────────────────────────

const ImageGallery: React.FC<{ images: string[]; productName: string }> = ({ images, productName }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const safeImages = images.length > 0 ? images : ['/placeholder.jpg'];

  const goNext = useCallback(() => {
    setActiveIdx(i => (i + 1) % safeImages.length);
    setIsZoomed(false);
  }, [safeImages.length]);

  const goPrev = useCallback(() => {
    setActiveIdx(i => (i - 1 + safeImages.length) % safeImages.length);
    setIsZoomed(false);
  }, [safeImages.length]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.changedTouches[0].screenX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen, goNext, goPrev]);

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div
          className="relative aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden bg-[#FAF6F0] group cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setIsFullscreen(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIdx}
              src={safeImages[activeIdx]}
              alt={`${productName} - view ${activeIdx + 1}`}
              className={`w-full h-full object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>

          {/* Controls */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); goPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white cursor-pointer transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 text-[#2A0E0A]" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); goNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white cursor-pointer transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 text-[#2A0E0A]" />
              </button>
            </>
          )}

          <button
            onClick={e => { e.stopPropagation(); setIsFullscreen(true); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white cursor-pointer transition-all opacity-0 group-hover:opacity-100"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#2A0E0A]" />
          </button>

          {/* Image counter */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#2A0E0A]/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              {activeIdx + 1} / {safeImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {safeImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveIdx(idx); setIsZoomed(false); }}
                className={`shrink-0 w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === activeIdx
                    ? 'border-[#C9A227] shadow-md scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#C9A227]/40'
                }`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0D0500]/95 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.img
              key={activeIdx}
              src={safeImages[activeIdx]}
              alt={productName}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
            />

            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 cursor-pointer transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 cursor-pointer transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {safeImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIdx(idx)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${idx === activeIdx ? 'bg-[#C9A227] w-5' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Reviews Section ──────────────────────────────────────────────────────────

const ReviewsSection: React.FC<{ productId: string }> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rev => rev.rating === r).length,
  }));

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('product_reviews')
          .select('id, customer_name, rating, comment, created_at, is_verified_purchase')
          .eq('product_id', productId)
          .eq('is_hidden', false)
          .order('created_at', { ascending: false });
        if (data) setReviews(data as Review[]);
      } catch {
        // Table may not exist yet — show empty state gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId, submitted]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from('product_reviews').insert([{
        product_id: productId,
        customer_name: formName.trim(),
        rating: formRating,
        comment: formComment.trim(),
        is_verified_purchase: false,
        is_hidden: false,
      }]);
      setSubmitted(prev => !prev);
      setShowForm(false);
      setFormName('');
      setFormComment('');
      setFormRating(5);
    } catch {
      // fail silently — table may not exist
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-playfair text-xl font-bold text-[#2A0E0A]">Customer Reviews</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-[#C9A227] border border-[#C9A227]/40 px-4 py-2 rounded-full cursor-pointer hover:bg-[#C9A227]/10 transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Write a Review
        </button>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-[#2C1A17]/8 flex flex-col sm:flex-row gap-6">
          <div className="text-center sm:border-r sm:border-[#2C1A17]/10 sm:pr-6 shrink-0">
            <p className="text-5xl font-black text-[#2A0E0A] font-playfair">{avgRating.toFixed(1)}</p>
            <StarRating rating={Math.round(avgRating)} size="md" />
            <p className="text-xs text-[#2C1A17]/50 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-grow space-y-2">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#2C1A17]/60 w-3">{star}</span>
                <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
                <div className="flex-1 h-2 bg-[#FAF6F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A227] rounded-full transition-all duration-500"
                    style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-[11px] text-[#2C1A17]/50 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmitReview}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl p-5 border border-[#C9A227]/30 space-y-4"
          >
            <h4 className="font-bold text-sm text-[#2A0E0A]">Share Your Experience</h4>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Your Rating</label>
              <StarRating rating={formRating} size="lg" interactive onChange={setFormRating} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Your Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Ramesh K."
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Your Review *</label>
              <textarea
                required
                value={formComment}
                onChange={e => setFormComment(e.target.value)}
                placeholder="Tell us about your experience..."
                rows={3}
                className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#2A0E0A] text-[#C9A227] font-bold text-xs py-2.5 rounded-full cursor-pointer hover:bg-[#401C16] disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-[#2C1A17]/10 rounded-full text-xs font-bold text-[#2C1A17]/60 hover:bg-[#FAF6F0] cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-[#2C1A17]/8 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF6F0]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-24 bg-[#FAF6F0] rounded" />
                  <div className="h-3 w-16 bg-[#FAF6F0] rounded" />
                </div>
              </div>
              <div className="h-3 bg-[#FAF6F0] rounded w-full" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl border border-[#2C1A17]/8">
          <MessageCircle className="w-10 h-10 text-[#C9A227]/30 mx-auto mb-3" />
          <p className="text-sm font-bold text-[#2A0E0A]">No reviews yet</p>
          <p className="text-xs text-[#2C1A17]/50 mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 border border-[#2C1A17]/8 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] font-bold text-sm shrink-0">
                  {review.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#2A0E0A]">{review.customer_name}</p>
                      {review.is_verified_purchase && (
                        <span className="text-[9px] text-green-700 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-[#2C1A17]/40">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  <p className="text-xs text-[#2C1A17]/70 mt-2 leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Related Products Strip ───────────────────────────────────────────────────

const RelatedProducts: React.FC<{ currentId: string; category: string }> = ({ currentId, category }) => {
  const navigate = useNavigate();
  const { products } = useBakeryDatabase();

  const related = products
    .filter(p => p.category === category && p.id !== currentId && p.status !== 'Hidden')
    .slice(0, 6);

  if (related.length === 0) return null;

  const getPrice = (price: any): number => {
    if (typeof price === 'number') return price;
    return price.halfKg ?? price.oneKg ?? price.piece ?? Object.values(price)[0] ?? 0;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-playfair text-xl font-bold text-[#2A0E0A]">You May Also Like</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {related.map(product => (
          <motion.button
            key={product.id}
            whileHover={{ y: -4 }}
            onClick={() => navigate(`/product/${product.id}`)}
            className="shrink-0 w-40 sm:w-48 bg-white rounded-2xl border border-[#2C1A17]/8 shadow-sm overflow-hidden cursor-pointer text-left group"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[#FAF6F0]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-[#2A0E0A] line-clamp-1">{product.name}</p>
              <p className="text-sm font-black text-[#2A0E0A] mt-1">₹{getPrice(product.price)}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ─── Main Product Detail Page ─────────────────────────────────────────────────

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, settings } = useBakeryDatabase();
  const { addToCart, buyNow, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // ── State ─────────────────────────────────────────────────────────────────

  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [eggPreference, setEggPreference] = useState<'Egg' | 'Eggless'>('Eggless');
  const [cakeMessage, setCakeMessage] = useState('');
  const [showDescExpanded, setShowDescExpanded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = products.find(p => p.id === id);

  // Track recently viewed in localStorage
  useEffect(() => {
    if (!id) return;
    try {
      const key = 'mg_recently_viewed';
      const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = [id, ...existing.filter(i => i !== id)].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }, [id]);

  // Initialize weight selection
  useEffect(() => {
    if (!product) return;
    const opts = getWeightOptions(product.price);
    if (opts.length > 0) {
      // Default: halfKg if available, else first
      const halfKg = opts.find(o => o.key === 'halfKg');
      setSelectedWeight(halfKg ? halfKg.label : opts[0].label);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center text-center px-4 pt-24">
        <Package className="w-16 h-16 text-[#C9A227]/40 mb-4" />
        <h2 className="font-playfair text-2xl font-bold text-[#2A0E0A] mb-2">Product Not Found</h2>
        <p className="text-sm text-[#2C1A17]/60 mb-6">This product may no longer be available.</p>
        <button
          onClick={() => navigate('/menu')}
          className="bg-[#2A0E0A] text-[#C9A227] font-bold text-sm px-8 py-3 rounded-full cursor-pointer transition-all active:scale-95"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const weightOptions = getWeightOptions(product.price);
  const currentPrice = resolvePrice(product.price, selectedWeight);
  const totalPrice = currentPrice * quantity;
  const isOutOfStock = product.status === 'Out of Stock';
  const isInWish = isInWishlist(product.id);

  const isCake = product.category === 'Cakes';
  const productImages = (product as any).images?.filter(Boolean) || [product.image];

  const buildCustomizations = () => ({
    ...(isCake && { eggPreference }),
    ...(selectedFlavor && { flavor: selectedFlavor }),
    ...(cakeMessage.trim() && { cakeMessage: cakeMessage.trim() }),
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      { id: product.id, name: product.name, description: product.description, price: product.price as any, image: product.image, category: product.category },
      selectedWeight,
      quantity,
      buildCustomizations()
    );
    setAddedToCart(true);
    setIsCartOpen(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    buyNow(
      { id: product.id, name: product.name, description: product.description, price: product.price as any, image: product.image, category: product.category },
      selectedWeight,
      quantity,
      buildCustomizations()
    );
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price as any,
      category: product.category,
      status: product.status,
      isEggless: product.isEggless,
    });
  };

  const whatsappNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER;
  const whatsappText = encodeURIComponent(
    `Hello ${settings?.bakeryName || 'M.G. Iyengar Bakery'}, I'd like to order "${product.name}"${selectedWeight !== 'Standard' ? ` (${selectedWeight})` : ''} × ${quantity} for ₹${totalPrice}. ${isCake ? `Preference: ${eggPreference}${selectedFlavor ? `, Flavor: ${selectedFlavor}` : ''}${cakeMessage ? `, Message: "${cakeMessage}"` : ''}` : ''}`
  );

  const FLAVORS = [
    'Chocolate', 'Black Forest', 'Vanilla', 'Red Velvet',
    'Strawberry', 'Mango', 'Butterscotch', 'Pineapple', 'Mixed Fruit'
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] pt-20 pb-28 lg:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-4 text-xs text-[#2C1A17]/50">
          <button onClick={() => navigate('/')} className="hover:text-[#C9A227] cursor-pointer transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('/menu')} className="hover:text-[#C9A227] cursor-pointer transition-colors">Menu</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate(`/menu`)} className="hover:text-[#C9A227] cursor-pointer transition-colors">{product.category}</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#2A0E0A] font-semibold truncate max-w-32">{product.name}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ── Left: Image Gallery ── */}
          <div className="lg:sticky lg:top-24">
            <ImageGallery images={productImages} productName={product.name} />
          </div>

          {/* ── Right: Product Info ── */}
          <div className="space-y-5">

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-[#C9A227] bg-[#2A0E0A] px-3 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              {product.isBestSeller && (
                <span className="text-[10px] font-bold text-[#2A0E0A] bg-[#C9A227] px-3 py-1 rounded-full uppercase tracking-wider">
                  🔥 Best Seller
                </span>
              )}
              {(product as any).badge && (product as any).badge !== 'None' && (
                <span className="text-[10px] font-bold text-white bg-[#C9A227]/80 px-3 py-1 rounded-full uppercase tracking-wider">
                  {(product as any).badge}
                </span>
              )}
              {product.isEggless && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" /> Eggless Option
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="font-playfair text-3xl sm:text-4xl font-extrabold text-[#2A0E0A] leading-tight">
                {product.name}
              </h1>

              {/* Availability */}
              <div className="flex items-center gap-2 mt-2">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <XCircle className="w-4 h-4" /> Out of Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                    <CheckCircle className="w-4 h-4" /> Available
                  </span>
                )}
                <span className="text-[#2C1A17]/20">·</span>
                <span className="text-xs text-[#2C1A17]/50 font-medium">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Ready in 30–60 min
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className={`text-sm text-[#2C1A17]/70 leading-relaxed font-light ${!showDescExpanded ? 'line-clamp-3' : ''}`}>
                {product.description}
              </p>
              {product.description.length > 150 && (
                <button
                  onClick={() => setShowDescExpanded(!showDescExpanded)}
                  className="text-xs font-bold text-[#C9A227] mt-1 cursor-pointer flex items-center gap-1 hover:text-[#2A0E0A] transition-colors"
                >
                  {showDescExpanded ? 'Show less' : 'Read more'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDescExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <motion.span
                key={currentPrice}
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-[#2A0E0A] font-playfair"
              >
                ₹{totalPrice}
              </motion.span>
              {quantity > 1 && (
                <span className="text-sm text-[#2C1A17]/50 mb-1.5">
                  ₹{currentPrice} × {quantity}
                </span>
              )}
            </div>

            {/* ── Weight / Size Options ── */}
            {weightOptions.length > 1 && (
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[#2C1A17]/60 uppercase tracking-widest block">
                  Select Size / Weight
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {weightOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedWeight(opt.label)}
                      className={`relative px-4 py-2 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                        selectedWeight === opt.label
                          ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#2A0E0A] shadow-md scale-105'
                          : 'border-[#2C1A17]/15 bg-white text-[#2C1A17]/70 hover:border-[#C9A227]/50'
                      }`}
                    >
                      {opt.label}
                      <span className="block text-[9px] font-semibold opacity-70 mt-0.5">
                        ₹{resolvePrice(product.price, opt.label)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Cake-specific customizations ── */}
            {isCake && (
              <div className="space-y-4 p-4 bg-white rounded-2xl border border-[#2C1A17]/8">
                <h4 className="text-xs font-black text-[#2A0E0A] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                  Customize Your Cake
                </h4>

                {/* Egg preference */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">Egg Preference</label>
                  <div className="flex gap-3">
                    {(['Egg', 'Eggless'] as const).map(pref => (
                      <button
                        key={pref}
                        onClick={() => setEggPreference(pref)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${
                          eggPreference === pref
                            ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#2A0E0A]'
                            : 'border-[#2C1A17]/10 bg-[#FAF6F0] text-[#2C1A17]/60 hover:border-[#C9A227]/30'
                        }`}
                      >
                        {pref === 'Eggless' ? '🌿 Eggless' : '🥚 With Egg'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">
                    Flavor (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FLAVORS.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFlavor(selectedFlavor === f ? '' : f)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all ${
                          selectedFlavor === f
                            ? 'bg-[#2A0E0A] text-[#C9A227] border-[#2A0E0A]'
                            : 'bg-white text-[#2C1A17]/70 border-[#2C1A17]/15 hover:border-[#C9A227]/50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cake Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/60 uppercase tracking-wider block">
                    Cake Message (Optional)
                  </label>
                  <input
                    type="text"
                    value={cakeMessage}
                    onChange={e => setCakeMessage(e.target.value)}
                    placeholder='e.g. "Happy Birthday Priya!" (max 30 chars)'
                    maxLength={30}
                    className="w-full bg-[#FAF6F0] border border-[#2C1A17]/10 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none transition-all"
                  />
                  {cakeMessage && (
                    <p className="text-[9px] text-[#2C1A17]/40 text-right">{cakeMessage.length}/30</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Quantity Selector ── */}
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-[#2C1A17]/60 uppercase tracking-widest">Quantity</label>
              <div className="flex items-center border-2 border-[#2C1A17]/10 rounded-full bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-[#2A0E0A] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-[#2A0E0A]">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="px-3.5 py-2.5 text-[#2A0E0A] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="space-y-3 pt-2">
              {isOutOfStock ? (
                <div className="bg-[#2A0E0A]/5 border-2 border-[#2A0E0A]/10 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-bold text-[#2A0E0A]/60">This item is currently out of stock</p>
                  <p className="text-xs text-[#2C1A17]/45">Check back soon or explore similar items below</p>
                  <NotifyMeButton productId={product.id} productName={product.name} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Add to Cart */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAddToCart}
                      className={`flex items-center justify-center gap-2 py-4 px-5 rounded-full text-sm font-bold transition-all cursor-pointer shadow-lg ${
                        addedToCart
                          ? 'bg-[#C9A227] text-[#2A0E0A]'
                          : 'bg-white border-2 border-[#2A0E0A] text-[#2A0E0A] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {addedToCart ? (
                        <><CheckCircle className="w-4 h-4" /> Added!</>
                      ) : (
                        <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
                      )}
                    </motion.button>

                    {/* Buy Now */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBuyNow}
                      className="flex items-center justify-center gap-2 py-4 px-5 rounded-full text-sm font-bold bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] transition-all cursor-pointer shadow-xl shadow-[#2A0E0A]/20"
                    >
                      <Zap className="w-4 h-4 text-[#C9A227]" />
                      Buy Now
                    </motion.button>
                  </div>

                  {/* Wishlist + WhatsApp row */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleWishlistToggle}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                        isInWish
                          ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#2A0E0A]'
                          : 'border-[#2C1A17]/15 text-[#2C1A17]/70 hover:border-[#C9A227]/40'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isInWish ? 'fill-[#C9A227] text-[#C9A227]' : ''}`} />
                      {isInWish ? '♥ Wishlisted' : '♡ Wishlist'}
                    </button>

                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold border-2 border-[#2C1A17]/15 text-[#2C1A17]/70 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-all cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      Order on WhatsApp
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#2C1A17]/8">
              {[
                { icon: Award, label: 'Fresh Daily', sub: 'Made every day' },
                { icon: Users, label: '500+ Happy Customers', sub: 'Trusted & loved' },
                { icon: ShieldCheck, label: 'Safe Payment', sub: 'Razorpay secured' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center mx-auto">
                    <Icon className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <p className="text-[10px] font-bold text-[#2A0E0A] leading-tight">{label}</p>
                  <p className="text-[9px] text-[#2C1A17]/40">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Below-fold Content ── */}
        <div className="mt-12 space-y-10">
          {/* Related Products */}
          <RelatedProducts currentId={product.id} category={product.category} />

          {/* Reviews */}
          <ReviewsSection productId={product.id} />
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#2C1A17]/10 px-4 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center gap-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]">
        <div className="shrink-0 pr-1">
          <p className="text-[10px] text-[#2C1A17]/50 font-semibold leading-none">Total</p>
          <p className="text-base sm:text-lg font-black text-[#2A0E0A] font-playfair mt-0.5 leading-tight">₹{totalPrice}</p>
        </div>
        {!isOutOfStock ? (
          <div className="flex-1 flex gap-2 min-w-0">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-xs font-bold border-2 cursor-pointer transition-all active:scale-95 min-w-0 truncate ${
                addedToCart ? 'border-[#C9A227] bg-[#C9A227]/10 text-[#2A0E0A]' : 'border-[#2A0E0A] text-[#2A0E0A] hover:bg-[#FAF6F0]'
              }`}
            >
              {addedToCart ? <><CheckCircle className="w-3.5 h-3.5 shrink-0" /> Added</> : <><ShoppingBag className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Add to Cart</span></>}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full text-xs font-bold bg-[#2A0E0A] text-[#FAF7F2] hover:text-[#C9A227] cursor-pointer transition-all active:scale-95 shadow-md shadow-[#2A0E0A]/20 min-w-0 truncate"
            >
              <Zap className="w-3.5 h-3.5 text-[#C9A227] shrink-0" />
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <NotifyMeButton productId={product.id} productName={product.name} />
          </div>
        )}
      </div>
    </div>
  );
};
