import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Heart, Users, Compass, Zap, MapPin, ChevronRight, Star, LayoutGrid, Layers } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { REVIEWS } from '../data';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import BorderGlow from '../components/BorderGlow';
import { useBakeryDatabase } from '../context/DatabaseContext';
import LightRays from '../components/LightRays';
import LogoLoop from '../components/LogoLoop';
import type { LogoItem } from '../components/LogoLoop';
import DomeGallery from '../components/DomeGallery';

// ── Module-level constants (stable references — never recreated on render) ──
const CATEGORIES = [
  { name: 'Cakes',             desc: 'Custom & cream celebrations',   image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
  { name: 'Pastries',         desc: 'Indulgent sweet slices',         image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=300&q=80' },
  { name: 'Cookies',          desc: 'Crunchy traditional biscuits',   image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=300&q=80' },
  { name: 'Puffs',            desc: 'Hot, flaky oven snacks',         image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=300&q=80' },
  { name: 'Breads',           desc: 'Fresh soft daily loaves',        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
  { name: 'Snacks',           desc: 'Traditional savory mixtures',    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=300&q=80' },
  { name: 'Beverages',        desc: 'Filter coffee & rose milk',      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=300&q=80' },
  { name: 'Fast Food',        desc: 'Quick bites & combos',           image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
  { name: 'Buffs',            desc: 'Crispy stuffed delights',        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80' },
  { name: 'Tea Coffee',       desc: 'Warm aromatic brews',            image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=300&q=80' },
  { name: 'Lemon Juice',      desc: 'Tangy refreshing squeeze',       image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=300&q=80' },
  { name: 'Ice Creams',       desc: 'Creamy frozen scoops',           image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&q=80' },
  { name: 'Special Ice Creams', desc: 'Premium signature flavors',    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=300&q=80' },
  { name: 'Fresh Juice',      desc: 'Pure fruit blends daily',        image: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=300&q=80' },
  { name: 'Milk Shakes',      desc: 'Thick chilled indulgences',      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&q=80' },
  { name: 'Roll Items',       desc: 'Spiced wrap & roll snacks',      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=300&q=80' },
  { name: 'Special Milkshakes', desc: 'Loaded premium shakes',        image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=300&q=80' },
  { name: 'Pizza',            desc: 'Hand-tossed crispy slices',      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80' },
  { name: 'Burger',           desc: 'Stacked gourmet patties',        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
  { name: 'Sandwich',         desc: 'Fresh filled toasted bites',     image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80' },
  { name: 'Cutlet',           desc: 'Golden fried savory patties',    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=300&q=80' },
  { name: 'Oil Fry',          desc: 'Deep fried crispy snacks',       image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80' },
  { name: 'Mocktails',        desc: 'Vibrant alcohol-free drinks',    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80' },
] as const;

// Pre-built logos array — stable reference, never changes
const LOGO_LOOP_ITEMS: LogoItem[] = CATEGORIES.map(cat => ({
  src: cat.image,
  alt: cat.name,
  title: cat.name,
}));


interface HomeProps {
  setCurrentPage: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const { products, gallery } = useBakeryDatabase();

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

  // Gallery items: up to 6 for grid, all for dome
  const activeGalleryItems = gallery
    .filter(item => !item.isDeleted)
    .sort((a, b) => (a.displayPriority || 9999) - (b.displayPriority || 9999))
    .slice(0, 6);

  // Images passed to the DomeGallery — real gallery or bakery-themed fallbacks
  const DOME_FALLBACK_IMAGES = [
    { src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', alt: 'Celebration Cake' },
    { src: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80', alt: 'Pastry' },
    { src: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80', alt: 'Cookies' },
    { src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', alt: 'Fresh Bread' },
    { src: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80', alt: 'Ice Cream' },
    { src: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80', alt: 'Milkshake' },
    { src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', alt: 'Burger' },
    { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80', alt: 'Pizza' },
    { src: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80', alt: 'Puffs' },
    { src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80', alt: 'Beverage' },
    { src: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=400&q=80', alt: 'Tea Coffee' },
    { src: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80', alt: 'Lemon Juice' },
    { src: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80', alt: 'Special Shake' },
    { src: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=80', alt: 'Sandwich' },
    { src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', alt: 'Buffs' },
    { src: 'https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&w=400&q=80', alt: 'Fresh Juice' },
    { src: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=400&q=80', alt: 'Special Ice Cream' },
    { src: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80', alt: 'Anniversary Cake' },
    { src: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=80', alt: 'Roll Items' },
    { src: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=400&q=80', alt: 'Snacks' },
  ];

  // Always prefer the real uploaded gallery images; only fall back when gallery is completely empty
  const uploadedGalleryImages = gallery
    .filter(item => !item.isDeleted)
    .map(item => ({ src: item.image, alt: item.title }));

  const domeImages = uploadedGalleryImages.length > 0
    ? uploadedGalleryImages
    : DOME_FALLBACK_IMAGES;

  const [galleryView, setGalleryView] = useState<'grid' | 'dome'>('dome');
  // Hero video state — true once the video can play, triggers cross-fade from static poster
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Static fallback poster image shown while the video loads
  const HERO_POSTER = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1920&q=80';


  const whyChooseUs = [
    { title: 'Fresh Ingredients', desc: 'We source the finest local milk, farm butter, and premium fruits for rich flavors.', icon: Sparkles },
    { title: 'Daily Baking', desc: 'Ovens turn at dawn to bring you warm bread, cookies, and flaky puffs every single day.', icon: ShieldCheck },
    { title: 'Custom Cakes', desc: 'Our pastry chefs turn your dream themes into edible masterpieces for any occasion.', icon: Heart },
    { title: 'Premium Quality', desc: 'Uncompromising hygiene standards and premium ingredients are baked into every batch.', icon: Zap },
    { title: 'Fast Service', desc: 'Get quick order confirmations and prompt handovers via our direct WhatsApp line.', icon: Compass },
    { title: 'Trusted Local Bakery', desc: 'A beloved family business serving Mohanur & Namakkal with authentic traditional taste.', icon: Users },
  ];

  return (
    <div className="pt-0 snap-y-container">
      {/* 1. Hero Section - Mobile View (Full-bleed cinematic video) */}
      <section
        className="block lg:hidden relative h-dvh-locked snap-start-section overflow-hidden bg-[#2A0E0A] select-none"
      >
        {/* ── Hero Background: Video (primary) + Slideshow (fallback) ───────── */}
        <div className="absolute inset-0 z-0">

          {/* Cinematic video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER}
            onCanPlay={() => setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: videoLoaded ? 1 : 0, zIndex: 2 }}
            aria-hidden
          >
            <source src="/Like_this_make_and_give_the_.mp4" type="video/mp4" />
            <source src="/bakery-hero.webm" type="video/webm" />
          </video>

          {/* Static poster shown while video loads */}
          <img
            src={HERO_POSTER}
            alt="M.G. Iyengar Bakery"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: videoLoaded ? 0 : 1, zIndex: 1 }}
            aria-hidden
          />

          {/* Cinematic gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#2A0E0A]/50 via-[#2A0E0A]/35 to-[#2A0E0A]/75"
            style={{ zIndex: 3 }}
          />
        </div>

        {/* WebGL Light Rays Animation (React Bits) */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          <LightRays
            raysOrigin="top-center"
            raysColor="#C9A227"
            raysSpeed={1.0}
            lightSpread={0.8}
            rayLength={1.5}
            followMouse={true}
            mouseInfluence={0.05}
            noiseAmount={0.03}
            distortion={0.02}
          />
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
            
            {/* Title */}
            <h1 className="font-playfair text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Freshly Baked Happiness
            </h1>
            
            <p className="text-sm text-white/95 font-light leading-relaxed max-w-xl mx-auto">
              Discover delicious cream cakes, flaky hot puffs, traditional cookies, fresh milk bread, and authentic chat specialties.
            </p>

            <div className="flex flex-col items-center gap-4 justify-center pt-6">
              <button
                onClick={() => setCurrentPage('menu')}
                className="w-full px-8 py-3.5 rounded-full bg-[#C9A227] text-[#2A0E0A] font-bold tracking-wide hover:bg-white hover:text-[#2A0E0A] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg shadow-black/20 cursor-pointer animate-pulse"
              >
                Explore Menu
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* 1. Hero Section - Desktop View (Full-bleed cinematic video) */}
      <section className="hidden lg:block relative h-screen snap-start-section overflow-hidden select-none">

        {/* Full-bleed Video Background */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline
            poster={HERO_POSTER}
            onCanPlay={() => setVideoLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: videoLoaded ? 1 : 0, zIndex: 2 }} aria-hidden>
            <source src="/Like_this_make_and_give_the_.mp4" type="video/mp4" />
            <source src="/bakery-hero.webm" type="video/webm" />
          </video>
          <img
            src={HERO_POSTER}
            alt="M.G. Iyengar Bakery"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: videoLoaded ? 0 : 1, zIndex: 1 }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2A0E0A]/60 via-[#2A0E0A]/30 to-[#2A0E0A]/80" style={{ zIndex: 3 }} />
        </div>

        {/* Light Rays */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          <LightRays raysOrigin="top-center" raysColor="#C9A227" raysSpeed={0.8} lightSpread={0.9} rayLength={1.8} followMouse={true} mouseInfluence={0.05} noiseAmount={0.02} distortion={0.02} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{ zIndex: 5 }}>
          <div className="absolute top-[18%] left-[8%]   w-2 h-2 rounded-full bg-[#C9A227]/50 blur-xs animate-float" style={{ animationDelay: '0s',  animationDuration: '9s'  }} />
          <div className="absolute top-[35%] right-[12%]  w-3 h-3 rounded-full bg-white/25   blur-xs animate-float" style={{ animationDelay: '2s',  animationDuration: '11s' }} />
          <div className="absolute bottom-[28%] left-[18%] w-2 h-2 rounded-full bg-[#C9A227]/35 blur-xs animate-float" style={{ animationDelay: '4s',  animationDuration: '8s'  }} />
          <div className="absolute bottom-[14%] right-[22%] w-2 h-2 rounded-full bg-white/20  blur-xs animate-float" style={{ animationDelay: '1s',  animationDuration: '13s' }} />
        </div>

        {/* Main Content — centered over video */}
        <div className="relative w-full h-full flex items-center justify-center text-center px-6" style={{ zIndex: 6 }}>
          <div className="max-w-4xl text-white space-y-7">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#C9A227]/25 border border-[#C9A227]/40 px-5 py-1.5 rounded-full text-xs font-semibold text-[#FAF7F2] tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>The Artisan Bakery of Mohanur</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
              className="font-playfair text-6xl xl:text-7xl font-bold leading-tight text-white drop-shadow-lg">
              Freshly Baked Happiness
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
              className="text-lg text-white/90 font-light leading-relaxed max-w-2xl mx-auto">
              Discover delicious cream cakes, flaky hot puffs, traditional cookies, fresh milk bread, and authentic chat specialties. Handcrafted with love, baked fresh daily.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.7 }}
              className="flex items-center justify-center gap-4 pt-2">
              <button onClick={() => setCurrentPage('menu')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C9A227] text-[#2A0E0A] font-bold tracking-wide hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg shadow-black/25 cursor-pointer text-sm animate-pulse">
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentPage('menu')}
                className="px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer text-sm">
                Order on WhatsApp
              </button>
            </motion.div>
          </div>
        </div>

      </section>

      {/* 2. Featured Categories Section */}
      <section className="py-20 bg-white snap-start-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="luxury-heading-center text-3xl sm:text-4xl font-bold">
              Explore Our Categories
            </h2>
            <p className="text-sm text-brand-brown-800/60 font-light mt-4">
              From celebration cakes to spicy hot puffs, browse through our categories of freshly prepared delights.
            </p>
          </div>

          <div className="w-full overflow-hidden relative" style={{ height: '120px' }}>
            <LogoLoop
              logos={LOGO_LOOP_ITEMS}
              speed={100}
              direction="left"
              logoHeight={88}
              gap={60}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#ffffff"
              ariaLabel="Bakery menu categories"
              className="bakery-cat-loop"
            />
          </div>
        </div>
      </section>

      {/* 3. Best Sellers Section */}
      <section className="py-20 bg-brand-cream-50/30 snap-start-section">
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
      <section className="py-20 bg-white snap-start-section">
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
      <section className="block py-24 bg-[#2A0E0A] text-white overflow-hidden relative snap-start-section">
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



      {/* 6. Gallery Preview Section */}
      <section className="py-20 bg-white snap-start-section overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Section header ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4"
          >
            <div className="max-w-xl">
              <h2 className="luxury-heading text-3xl sm:text-4xl font-bold">
                A Peek Inside the Oven
              </h2>
              <p className="text-sm text-brand-brown-800/60 font-light mt-3 leading-relaxed">
                Glance at some of our fresh products, custom cake works, and delicious interior creations.
              </p>
            </div>

            {/* Controls: view toggle + full gallery link */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* View toggle pill */}
              <div className="flex items-center bg-brand-cream-100 rounded-full p-1 gap-0.5">
                <button
                  onClick={() => setGalleryView('grid')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    galleryView === 'grid'
                      ? 'bg-brand-brown-950 text-brand-cream-50 shadow-md'
                      : 'text-brand-brown-800/60 hover:text-brand-brown-950'
                  }`}
                  aria-pressed={galleryView === 'grid'}
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setGalleryView('dome')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                    galleryView === 'dome'
                      ? 'bg-brand-brown-950 text-brand-cream-50 shadow-md'
                      : 'text-brand-brown-800/60 hover:text-brand-brown-950'
                  }`}
                  aria-pressed={galleryView === 'dome'}
                >
                  <Layers className="w-3 h-3" />
                  <span>Dome</span>
                </button>
              </div>

              <button
                onClick={() => setCurrentPage('gallery')}
                className="text-sm font-semibold text-brand-brown-950 hover:text-brand-gold-700 transition-colors flex items-center gap-1 group whitespace-nowrap"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* ── View panels ────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* GRID VIEW */}
            {galleryView === 'grid' && (
              <motion.div
                key="gallery-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
              >
                {(activeGalleryItems.length > 0 ? activeGalleryItems : [
                  { id: 'f1', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', title: 'Celebration Cake', category: 'Cakes' },
                  { id: 'f2', image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80', title: 'Fresh Puffs', category: 'Puffs' },
                  { id: 'f3', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80', title: 'Anniversary Cake', category: 'Cakes' },
                  { id: 'f4', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', title: 'Ice Cream', category: 'Ice Creams' },
                  { id: 'f5', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', title: 'Milkshake', category: 'Milk Shakes' },
                  { id: 'f6', image: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=800&q=80', title: 'Tea & Coffee', category: 'Tea Coffee' },
                ] as { id: string; image: string; title: string; category: string }[]).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 32, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.25, ease: 'easeOut' } }}
                  >
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
                      <div className="relative w-full h-full group overflow-hidden rounded-[24px] shadow-md hover:shadow-xl transition-shadow duration-500">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        {/* Gradient overlay — slides up on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-950/80 via-brand-brown-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5">
                          <span className="text-[9px] uppercase tracking-widest text-brand-gold-400 font-bold block translate-y-3 group-hover:translate-y-0 transition-transform duration-350">
                            {item.category}
                          </span>
                          <span className="text-sm font-bold text-white font-playfair mt-1 translate-y-3 group-hover:translate-y-0 transition-transform duration-350 delay-[35ms]">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    </BorderGlow>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* DOME VIEW */}
            {galleryView === 'dome' && (
              <motion.div
                key="gallery-dome"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[2rem] overflow-hidden shadow-2xl"
                style={{ height: 'clamp(380px, 55vw, 520px)' }}
              >
                <DomeGallery
                  images={domeImages}
                  fit={44}
                  fitBasis="width"
                  imageBorderRadius="10px"
                  dragSensitivity={22}
                  dragDampening={0.92}
                  maxVerticalRotationDeg={6}
                  overlayBlurColor="rgba(30,15,10,0.55)"
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      {/* 7. Location Section */}
      <section className="py-20 bg-brand-cream-50/50 snap-start-section">
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
                  src="https://maps.google.com/maps?q=11.0619375,78.1379375(M.G.Bakery%20%26%20Chat%20Corner)&t=&z=16&ie=UTF8&iwloc=&output=embed"
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
