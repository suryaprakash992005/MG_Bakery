import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Users, Compass, Zap, MapPin, ChevronRight, Star } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { REVIEWS } from '../data';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import BorderGlow from '../components/BorderGlow';
import { useBakeryDatabase } from '../context/DatabaseContext';

interface HomeProps {
  setCurrentPage: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const { products, gallery, banners, settings } = useBakeryDatabase();

  const activeProducts = products
    .filter(p => p.status !== 'Hidden' && !p.isDeleted)
    .sort((a, b) => a.displayPriority - b.displayPriority);

  // Prioritize products marked as best seller/featured, and all Cakes.
  // If fewer than 4 items, fall back to other active products to ensure section is populated.
  let bestSellers = activeProducts.filter(p => p.isFeatured || p.isBestSeller || p.category === 'Cakes');
  if (bestSellers.length < 4) {
    const ids = new Set(bestSellers.map(p => p.id));
    const fallbackItems = activeProducts.filter(p => !ids.has(p.id));
    bestSellers = [...bestSellers, ...fallbackItems];
  }
  bestSellers = bestSellers.slice(0, 4);

  const activeGalleryItems = gallery
    .filter(item => !item.isDeleted)
    .sort((a, b) => (a.displayPriority || 9999) - (b.displayPriority || 9999))
    .slice(0, 3);

  const activeBanners = banners
    .filter(b => b.isActive)
    .sort((a, b) => a.displayPriority - b.displayPriority);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (activeBanners.length <= 1 || !settings.isSliderEnabled) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [activeBanners.length, settings.isSliderEnabled]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    } else if (isRightSwipe) {
      setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const bannerToDisplay = activeBanners[currentSlide] || activeBanners[0];

  const categories = [
    { name: 'Cakes', desc: 'Custom & cream celebrations', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
    { name: 'Pastries', desc: 'Indulgent sweet slices', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Cookies', desc: 'Crunchy traditional biscuits', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=300&q=80' },
    { name: 'Puffs', desc: 'Hot, flaky oven snacks', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=300&q=80' },
    { name: 'Breads', desc: 'Fresh soft daily loaves', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
    { name: 'Snacks', desc: 'Traditional savory mixtures', image: 'https://images.unsplash.com/photo-1613721418184-2438c82524a4?auto=format&fit=crop&w=300&q=80' },
    { name: 'Beverages', desc: 'Filter coffee & rose milk', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80' },
  ];

  const whyChooseUs = [
    { title: 'Fresh Ingredients', desc: 'We source the finest local milk, farm butter, and premium fruits for rich flavors.', icon: Sparkles },
    { title: 'Daily Baking', desc: 'Ovens turn at dawn to bring you warm bread, cookies, and flaky puffs every single day.', icon: ShieldCheck },
    { title: 'Custom Cakes', desc: 'Our pastry chefs turn your dream themes into edible masterpieces for any occasion.', icon: Heart },
    { title: 'Premium Quality', desc: 'Uncompromising hygiene standards and premium ingredients are baked into every batch.', icon: Zap },
    { title: 'Fast Service', desc: 'Get quick order confirmations and prompt handovers via our direct WhatsApp line.', icon: Compass },
    { title: 'Trusted Local Bakery', desc: 'A beloved family business serving Mohanur & Namakkal with authentic traditional taste.', icon: Users },
  ];

  return (
    <div className="pt-0">
      {/* 1. Hero Section - Mobile View (Inspired by Magnolia Bakery full bleed) */}
      <section 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="block lg:hidden relative h-[88vh] overflow-hidden bg-[#FAF7F2] select-none pt-20"
      >
        {/* Full-bleed Slideshow Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={bannerToDisplay ? bannerToDisplay.id : 'default'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Ken Burns Zoom Effect */}
              <motion.img
                src={bannerToDisplay ? bannerToDisplay.image : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80'}
                alt={bannerToDisplay?.title || 'Premium Luxury Celebration Cake'}
                initial={{ scale: 1.0 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 6, ease: 'easeOut' }}
                className="w-full h-full object-cover"
              />
              {/* Overlay Gradient to preserve contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#2A0E0A]/50 via-[#2A0E0A]/35 to-[#2A0E0A]/70 z-10" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Particles Effect (Subtle Magnolia luxury aesthetics) */}
        <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
          <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-[#C9A227]/40 blur-xs animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
          <div className="absolute top-[40%] right-[15%] w-3 h-3 rounded-full bg-white/30 blur-xs animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
          <div className="absolute bottom-[30%] left-[20%] w-2 h-2 rounded-full bg-[#C9A227]/30 blur-xs animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }} />
          <div className="absolute bottom-[15%] right-[25%] w-3 h-3 rounded-full bg-white/20 blur-xs animate-float" style={{ animationDelay: '1s', animationDuration: '12s' }} />
        </div>

        {/* Content Wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 relative flex items-center justify-center h-full text-center">
          <div className="max-w-3xl text-white space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-1.5 bg-[#C9A227]/25 border border-[#C9A227]/40 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#FAF7F2] tracking-widest uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>The Artisan Bakery of Mohanur</span>
            </motion.div>
            
            {/* Title with stagger */}
            <h1 className="font-playfair text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {bannerToDisplay?.title || 'Freshly Baked Happiness'}
            </h1>
            
            <p className="text-sm text-white/95 font-light leading-relaxed max-w-xl mx-auto">
              {bannerToDisplay?.subtitle || 'Discover delicious cream cakes, flaky hot puffs, traditional cookies, fresh milk bread, and authentic chat specialties.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 justify-center pt-6">
              <button
                onClick={() => setCurrentPage('menu')}
                className="w-full px-8 py-3.5 rounded-full bg-[#C9A227] text-[#2A0E0A] font-bold tracking-wide hover:bg-white hover:text-[#2A0E0A] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg shadow-black/20 cursor-pointer animate-pulse"
              >
                Explore Menu
              </button>
              <a
                href={`https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(`Hello ${settings?.bakeryName || 'M.G. Iyengar Bakery'}, I would like to order a fresh cake or inquire about today's specials.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-8 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold tracking-wide hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border border-white/35 backdrop-blur-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Carousel indicators dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'bg-[#C9A227] w-6' : 'bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Floating Micro-Card Bottom Right */}
        <div className="absolute bottom-16 sm:bottom-6 right-4 left-4 sm:left-auto bg-[#2A0E0A]/90 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between z-20 border border-white/10 max-w-sm sm:w-80 shadow-2xl transition-all">
          <div className="min-w-0 pr-4">
            <span className="text-[9px] uppercase tracking-widest text-[#C9A227] font-bold block">
              {bannerToDisplay?.cta_text || 'Featured Specialty'}
            </span>
            <span className="text-sm font-bold text-white font-playfair block mt-0.5 truncate">
              {bannerToDisplay?.featured_product_name || 'Fresh Bakery Selection'}
            </span>
          </div>
          <button 
            onClick={() => setCurrentPage('cakes')}
            className="w-9 h-9 rounded-full bg-[#C9A227] text-[#2A0E0A] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 1. Hero Section - Desktop View (Previous split columns with BorderGlow restored) */}
      <section className="hidden lg:flex relative min-h-[90vh] items-center bg-gradient-to-br from-brand-cream-50 via-brand-cream-100/40 to-white overflow-hidden py-12 pt-28 select-none">
        {/* Floating background graphics */}
        <div className="absolute top-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-gold-100/30 blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-[-10%] w-[400px] h-[400px] rounded-full bg-brand-orange-100/20 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 max-w-xl text-left"
            >
              <div className="inline-flex items-center gap-2 bg-brand-cream-100/80 border border-brand-cream-200 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-gold-700 tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Artisan Bakery of Mohanur</span>
              </div>
              <h1 className="font-playfair text-5xl font-bold text-brand-brown-950 leading-tight">
                Freshly Baked Happiness for Every Celebration
              </h1>
              <p className="text-base text-brand-brown-805/85 font-light leading-relaxed">
                Discover delicious cream cakes, flaky hot puffs, traditional cookies, fresh milk bread, and authentic chat specialties. Handcrafted with love, baked fresh daily.
              </p>
              
              <div className="flex flex-row items-center gap-4 justify-start pt-4">
                <button
                  onClick={() => setCurrentPage('menu')}
                  className="btn-primary cursor-pointer"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(`Hello ${settings?.bakeryName || 'M.G. Iyengar Bakery'}, I would like to order a fresh cake or inquire about today's specials.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </motion.div>

            {/* Hero Right Media */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative flex justify-end w-full"
            >
              <BorderGlow
                className="w-full max-w-[480px] aspect-[4/5] shadow-2xl shadow-brand-brown-950/15 border-4 border-white animate-float"
                backgroundColor="#ffffff"
                borderRadius={40}
                glowColor="46 64 52"
                glowRadius={40}
                glowIntensity={1.0}
                colors={['#C9A227', '#2A0E0A', '#A46E6E']}
                fillOpacity={0.1}
                animated={true}
              >
                <div className="relative w-full h-full overflow-hidden">
                  <AnimatePresence>
                    <motion.img
                      key={bannerToDisplay ? bannerToDisplay.id : 'default'}
                      src={bannerToDisplay ? bannerToDisplay.image : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'}
                      alt={bannerToDisplay?.title || 'Premium Luxury Celebration Cake'}
                      className="w-full h-full object-cover absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-950/50 via-brand-brown-950/20 to-transparent" />
                  
                  {/* Banner overlay text if slide has title */}
                  {bannerToDisplay && (bannerToDisplay.title || bannerToDisplay.subtitle) && (
                    <div className="absolute top-6 left-6 right-6 z-10 bg-black/30 backdrop-blur-xs rounded-xl p-3 border border-white/5 pointer-events-none">
                      {bannerToDisplay.title && (
                        <h4 className="text-xs font-bold text-brand-gold-500 uppercase tracking-wider font-playfair">{bannerToDisplay.title}</h4>
                      )}
                      {bannerToDisplay.subtitle && (
                        <p className="text-[10px] text-white/80 font-light mt-0.5 leading-snug">{bannerToDisplay.subtitle}</p>
                      )}
                    </div>
                  )}

                  {/* Floating Micro-Card */}
                  <div className="absolute bottom-6 left-6 right-6 glass-card p-5 rounded-2xl flex items-center justify-between z-10">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block">
                        {bannerToDisplay?.cta_text || 'Featured Cake'}
                      </span>
                      <span className="text-base font-bold text-brand-brown-950 font-playfair block mt-0.5 truncate max-w-[200px]">
                        {bannerToDisplay?.featured_product_name || 'Fresh Bakery Special'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setCurrentPage('cakes')}
                      className="w-10 h-10 rounded-full bg-brand-brown-950 text-brand-gold-850 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </BorderGlow>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="luxury-heading-center text-3xl sm:text-4xl font-bold">
              Explore Our Categories
            </h2>
            <p className="text-sm text-brand-brown-800/60 font-light mt-4">
              From celebration cakes to spicy hot puffs, browse through our categories of freshly prepared delights.
            </p>
          </div>

          <div className="flex overflow-x-auto pb-8 gap-6 scrollbar-thin scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 justify-start lg:justify-center">
            {categories.map((cat, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => {
                  // Direct to menu page and automatically filter (state is managed inside Menu.tsx, we can link to menu page)
                  setCurrentPage('menu');
                }}
                className="flex-shrink-0 w-44 bg-brand-cream-50/50 hover:bg-brand-cream-50 border border-brand-cream-100 rounded-3xl p-4 text-center transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-playfair text-base font-bold text-brand-brown-950 group-hover:text-brand-gold-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-brand-brown-800/50 mt-1 font-light leading-snug">
                  {cat.desc}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <section className="py-20 bg-brand-cream-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="luxury-heading text-3xl sm:text-4xl font-bold">
                Our Best Sellers
              </h2>
              <p className="text-sm text-brand-brown-800/60 font-light mt-4">
                Local favorites that have earned their place in our hearts. Handcrafted with traditional expertise.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('menu')}
              className="text-sm font-semibold text-brand-brown-950 hover:text-brand-gold-700 transition-colors flex items-center gap-1 group whitespace-nowrap"
            >
              <span>View All Menu</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="luxury-heading-center text-3xl sm:text-4xl font-bold">
              The Art of Baking
            </h2>
            <p className="text-sm text-brand-brown-800/60 font-light mt-4">
              We preserve traditional baking processes to deliver unforgettable tastes in every bite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <BorderGlow
                  key={idx}
                  backgroundColor="#FAF8F5"
                  borderRadius={32}
                  glowColor="46 64 52"
                  glowRadius={25}
                  glowIntensity={0.6}
                  coneSpread={25}
                  colors={['#D4AF37', '#2C1717', '#A46E6E']}
                  fillOpacity={0.08}
                  className="h-full"
                >
                  <div className="p-8 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-brand-brown-950 text-brand-gold-850 flex items-center justify-center mb-6 shadow-md shadow-brand-brown-950/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-playfair text-lg font-bold text-brand-brown-950 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-brown-800/70 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </BorderGlow>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Customer Reviews Carousel */}
      {/* Mobile Quote Carousel View */}
      <section className="block lg:hidden py-24 bg-[#2A0E0A] text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FAF7F2]/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-widest text-[#C9A227] font-bold block mb-3">
              TESTIMONIALS
            </span>
            <h2 className="font-playfair text-3xl font-bold text-white">
              Sweet Words from Customers
            </h2>
            <div className="w-16 h-[2px] bg-[#C9A227] mx-auto mt-4" />
          </div>

          <div className="relative min-h-[250px] flex items-center justify-center">
            <div className="w-full">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Google Star Rating */}
                <div className="flex items-center justify-center gap-1.5 text-[#C9A227]">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx}>
                      <Star className="w-5 h-5 fill-[#C9A227] text-[#C9A227]" />
                    </div>
                  ))}
                </div>

                <blockquote className="font-playfair text-lg italic leading-relaxed text-white/95">
                  "{REVIEWS[currentSlide % REVIEWS.length].comment}"
                </blockquote>

                <div className="flex items-center justify-center gap-3 pt-4">
                  <img
                    src={REVIEWS[currentSlide % REVIEWS.length].avatar}
                    alt={REVIEWS[currentSlide % REVIEWS.length].name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A227] shadow-md"
                  />
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {REVIEWS[currentSlide % REVIEWS.length].name}
                    </h4>
                    <span className="text-xs text-[#C9A227] font-medium">
                      {REVIEWS[currentSlide % REVIEWS.length].role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Controls */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  (currentSlide % REVIEWS.length) === idx ? 'bg-[#C9A227] w-6' : 'bg-white/30'
                }`}
                aria-label={`Go to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Grid Reviews View */}
      <section className="hidden lg:block py-20 bg-gradient-to-b from-white to-brand-cream-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="luxury-heading-center text-3xl sm:text-4xl font-bold">
              Sweet Words from Customers
            </h2>
            <p className="text-sm text-brand-brown-800/60 font-light mt-4">
              Real reviews from real people in Mohanur and surrounding regions.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {REVIEWS.map((review) => (
              <BorderGlow
                key={review.id}
                backgroundColor="#ffffff"
                borderRadius={24}
                glowColor="46 64 52"
                glowRadius={25}
                glowIntensity={0.6}
                coneSpread={20}
                colors={['#C9A227', '#2A0E0A', '#A46E6E']}
                fillOpacity={0.08}
                className="h-full"
              >
                <div className="p-6 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-brand-gold-500 mb-4">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-[#C9A227] text-[#C9A227]" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-brand-brown-800/80 font-light italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-brand-cream-50">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover border border-brand-cream-100"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-brand-brown-950 leading-tight">
                        {review.name}
                      </h4>
                      <span className="text-[10px] text-brand-brown-800/50 font-medium">
                        {review.role}
                      </span>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Gallery Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="luxury-heading text-3xl sm:text-4xl font-bold">
                A Peek Inside the Oven
              </h2>
              <p className="text-sm text-brand-brown-800/60 font-light mt-4">
                Glance at some of our fresh products, custom cake works, and delicious interior creations.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('gallery')}
              className="text-sm font-semibold text-brand-brown-950 hover:text-brand-gold-700 transition-colors flex items-center gap-1 group whitespace-nowrap"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGalleryItems.length > 0 ? (
              activeGalleryItems.map((item) => (
                <BorderGlow
                  key={item.id}
                  className="aspect-[4/3]"
                  backgroundColor="#ffffff"
                  borderRadius={24}
                  glowColor="46 64 52"
                  glowRadius={25}
                  glowIntensity={0.8}
                  coneSpread={20}
                  colors={['#D4AF37', '#2C1717', '#A46E6E']}
                  fillOpacity={0.15}
                >
                  <div className="relative w-full h-full group overflow-hidden rounded-[24px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-brand-brown-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                      <span className="text-[9px] uppercase tracking-widest text-brand-gold-500 font-bold block">{item.category}</span>
                      <span className="text-xs font-bold text-white font-playfair mt-0.5">{item.title}</span>
                    </div>
                  </div>
                </BorderGlow>
              ))
            ) : (
              // Fallback default mock gallery images
              <>
                <BorderGlow
                  className="aspect-[4/3]"
                  backgroundColor="#ffffff"
                  borderRadius={24}
                  glowColor="46 64 52"
                  glowRadius={25}
                  glowIntensity={0.8}
                  coneSpread={20}
                  colors={['#D4AF37', '#2C1717', '#A46E6E']}
                  fillOpacity={0.15}
                >
                  <div className="relative w-full h-full group">
                    <img
                      src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
                      alt="Cake baking"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </BorderGlow>
                <BorderGlow
                  className="aspect-[4/3]"
                  backgroundColor="#ffffff"
                  borderRadius={24}
                  glowColor="46 64 52"
                  glowRadius={25}
                  glowIntensity={0.8}
                  coneSpread={20}
                  colors={['#D4AF37', '#2C1717', '#A46E6E']}
                  fillOpacity={0.15}
                >
                  <div className="relative w-full h-full group">
                    <img
                      src="https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80"
                      alt="Puffs fresh"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </BorderGlow>
                <BorderGlow
                  className="aspect-[4/3]"
                  backgroundColor="#ffffff"
                  borderRadius={24}
                  glowColor="46 64 52"
                  glowRadius={25}
                  glowIntensity={0.8}
                  coneSpread={20}
                  colors={['#D4AF37', '#2C1717', '#A46E6E']}
                  fillOpacity={0.15}
                >
                  <div className="relative w-full h-full group">
                    <img
                      src="https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
                      alt="Special cakes"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </BorderGlow>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. Location Section */}
      <section className="py-20 bg-brand-cream-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl border border-white">
            <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-brand-gold-100/30 blur-2xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block">
                  Find Us
                </span>
                <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-brand-brown-950">
                  Visit Our Store in Mohanur
                </h2>
                <p className="text-sm sm:text-base text-brand-brown-800/80 font-light leading-relaxed">
                  Located in the heart of Mohanur, Namakkal district. Experience warm filter coffee, crispy vegetable puffs, and custom celebrations cake ordering in a welcoming cafe space.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-gold-850 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-brand-brown-950">{settings?.bakeryName || 'M.G. Iyengar Bakery & Chat Corner'}</p>
                      <p className="text-xs text-brand-brown-800/70 mt-1">
                        {settings?.storeAddress || 'Mohanur Main Road, Mohanur, Namakkal, Tamil Nadu - 637015'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-brand-gold-850 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-brand-brown-950">Open Daily</p>
                      <p className="text-xs text-brand-brown-800/70 mt-1">
                        {settings?.openingTime || '9:00 AM'} - {settings?.closingTime || '10:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={`https://wa.me/${settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(`Hello ${settings?.bakeryName || 'M.G. Iyengar Bakery'}, I would like to get directions or place a quick chat/cake order.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full sm:w-auto inline-flex"
                  >
                    <span>Message on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Map Integration Placeholder */}
              <div className="h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-brand-cream-100 bg-brand-cream-100 relative group">
                <iframe
                  title="M.G. Iyengar Bakery Mohanur Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.147133729864!2d78.07172081533221!3d11.02762299215112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzM5LjQiTiA3OMKwMDQnMjYuMCJF!5e0!3m2!1sen!2sin!4v1655829281355!5m2!1sen!2sin"
                  className="w-full h-full border-none grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
                <div className="absolute top-4 right-4 bg-brand-brown-950 text-brand-cream-50 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md pointer-events-none uppercase tracking-wider">
                  Namakkal, Tamil Nadu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
