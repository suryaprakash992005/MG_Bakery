import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin, Star, LayoutGrid, Layers } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { REVIEWS } from '../data';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import BorderGlow from '../components/BorderGlow';
import { useBakeryDatabase } from '../context/DatabaseContext';
import LightRays from '../components/LightRays';
import LogoLoop from '../components/LogoLoop';
import type { LogoItem } from '../components/LogoLoop';
import DomeGallery from '../components/DomeGallery';
import InfiniteSpiral from '../components/InfiniteSpiral';

// ── Module-level constants (stable references — never recreated on render) ──

// Bakery images fed into the InfiniteSpiral in the Testimonials section
const SPIRAL_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', alt: 'Celebration Cake' },
  { src: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80', alt: 'Cookies' },
  { src: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', alt: 'Fresh Bread' },
  { src: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=400&q=80', alt: 'Fresh Puffs' },
  { src: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80', alt: 'Anniversary Cake' },
  { src: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80', alt: 'Ice Cream' },
  { src: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80', alt: 'Pastry Slice' },
  { src: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80', alt: 'Veg Puff' },
  { src: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80', alt: 'Milkshake' },
  { src: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=400&q=80', alt: 'Tea & Coffee' },
];
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

// ── "Crafted Every Morning" section — own component to satisfy Rules of Hooks ──
const CRAFT_PILLARS = [
  {
    num: '01',
    title: 'Fresh Ingredients',
    desc: "We source the finest local milk, farm butter, and premium seasonal fruits — every batch starts with what's best from the land.",
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=85',
  },
  {
    num: '02',
    title: 'Baked Every Morning',
    desc: 'Our ovens begin before sunrise. Warm bread, flaky puffs, and crisp cookies reach the shelf fresh — every single day, without exception.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',
  },
  {
    num: '03',
    title: 'Crafted for You',
    desc: 'From custom celebration cakes shaped to your dream theme, to quick WhatsApp orders — a trusted family bakery serving Mohanur & Namakkal.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85',
  },
];

const CraftedEveryMorning: React.FC = () => {
  const [activePillar, setActivePillar] = useState(0);

  return (
    <section className="py-0 bg-[#FAF7F2] snap-start-section overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        {/* Asymmetric grid: image 55% | text 45% */}
        <div className="flex flex-col lg:flex-row min-h-[540px] lg:min-h-[720px]">

          {/* LEFT: Large editorial image */}
          <div className="relative w-full lg:w-[55%] h-[56vw] max-h-[480px] lg:max-h-none lg:h-auto overflow-hidden bg-[#2A0E0A] shrink-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={activePillar}
                src={CRAFT_PILLARS[activePillar].image}
                alt={CRAFT_PILLARS[activePillar].title}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>

            {/* Warm cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2A0E0A]/10 via-transparent to-[#2A0E0A]/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A0E0A]/50 via-transparent to-transparent pointer-events-none" />

            {/* Corner caption */}
            <div className="absolute bottom-5 left-5 lg:bottom-9 lg:left-9">
              <span className="font-playfair text-white/45 text-[10px] uppercase tracking-[0.3em]">
                M.G. Iyengar Bakery · Est. Mohanur
              </span>
            </div>
          </div>

          {/* RIGHT: Editorial text column */}
          <div className="flex flex-col justify-center w-full lg:w-[45%] px-7 sm:px-12 lg:px-14 xl:px-20 py-12 lg:py-20 bg-[#FAF7F2]">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-[#C9A227]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A227]">
                Our Craft
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-playfair text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl font-bold text-[#2A0E0A] leading-[1.08] tracking-tight mb-5"
            >
              Crafted Every<br />Morning.
            </motion.h2>

            {/* Supporting line */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-[#2C1A17]/60 font-light leading-relaxed max-w-sm mb-10 lg:mb-12"
            >
              We preserve traditional baking processes to deliver unforgettable taste in every bite.
            </motion.p>

            {/* Numbered pillars */}
            <div className="border-t border-[#2C1A17]/10">
              {CRAFT_PILLARS.map((pillar, idx) => {
                const isActive = activePillar === idx;
                return (
                  <motion.div
                    key={pillar.num}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: 0.15 * idx + 0.3 }}
                    onMouseEnter={() => setActivePillar(idx)}
                    onFocus={() => setActivePillar(idx)}
                    tabIndex={0}
                    onClick={() => setActivePillar(idx)}
                    className={`group relative border-b border-[#2C1A17]/10 py-5 lg:py-6 cursor-pointer transition-all duration-300 outline-none ${
                      isActive ? 'pl-4' : 'pl-0 hover:pl-3'
                    }`}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`${pillar.title}`}
                  >
                    {/* Active left accent bar */}
                    <motion.div
                      className="absolute left-0 top-5 bottom-5 w-0.5 bg-[#C9A227] rounded-full"
                      animate={{ opacity: isActive ? 1 : 0, scaleY: isActive ? 1 : 0.3 }}
                      transition={{ duration: 0.3 }}
                      style={{ originY: 0.5 }}
                    />

                    <div className="flex items-start gap-5">
                      {/* Number */}
                      <span
                        className={`font-playfair text-[13px] font-bold tracking-widest transition-colors duration-300 mt-0.5 shrink-0 select-none ${
                          isActive ? 'text-[#C9A227]' : 'text-[#2C1A17]/25 group-hover:text-[#C9A227]/60'
                        }`}
                      >
                        {pillar.num}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3
                          className={`font-playfair text-base sm:text-lg font-bold transition-colors duration-300 leading-tight ${
                            isActive ? 'text-[#2A0E0A]' : 'text-[#2C1A17]/65 group-hover:text-[#2A0E0A]'
                          }`}
                        >
                          {pillar.title}
                        </h3>

                        {/* Description — reveals when active */}
                        <motion.p
                          animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden text-sm text-[#2C1A17]/55 font-light leading-relaxed mt-1.5"
                        >
                          {pillar.desc}
                        </motion.p>
                      </div>

                      {/* Arrow indicator */}
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 mt-0.5 transition-all duration-300 ${
                          isActive
                            ? 'text-[#C9A227] translate-x-0.5'
                            : 'text-[#2C1A17]/20 group-hover:text-[#2C1A17]/40 group-hover:translate-x-1'
                        }`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface HomeProps {
  setCurrentPage: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const { products, gallery, settings, heroVideos } = useBakeryDatabase();
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Sequential Background Video Playlist Logic
  const activeVideos = (heroVideos || [])
    .filter(v => v.isActive)
    .sort((a, b) => a.displayPriority - b.displayPriority);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const currentVideoUrl = activeVideos.length > 0 
    ? activeVideos[currentVideoIndex % activeVideos.length].videoUrl 
    : (settings?.heroVideoUrl || '/Like_this_make_and_give_the_.mp4');

  const handleVideoEnded = () => {
    if (activeVideos.length > 1) {
      setCurrentVideoIndex(prev => (prev + 1) % activeVideos.length);
    }
  };

  // Force instant video playback on mount / video source change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideoUrl]);

  // Reviews carousel slide state
  const [reviewSlide, setReviewSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReviewSlide(prev => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);



  return (
    <div className="pt-0 snap-y-container">
      {/* 1. Hero Section - Unified Responsive View (Single Background Video for 0ms Instant Laptop Playback) */}
      <section className="relative min-h-dvh-locked h-screen snap-start-section overflow-hidden bg-[#2A0E0A] flex items-center justify-center">

        {/* ── Single Full-bleed Video Background ─────────────────── */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            key={currentVideoUrl}
            autoPlay
            muted
            playsInline
            preload="auto"
            loop={activeVideos.length <= 1}
            onEnded={handleVideoEnded}
            src={currentVideoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 2 }}
            aria-hidden
          />

          {/* Cinematic gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#2A0E0A]/60 via-[#2A0E0A]/35 to-[#2A0E0A]/80"
            style={{ zIndex: 3 }}
          />
        </div>

        {/* ── WebGL Light Rays Animation ─────────────────────────── */}
        <div className="absolute inset-0 z-4 pointer-events-none">
          <LightRays
            raysOrigin="top-center"
            raysColor="#C9A227"
            raysSpeed={0.9}
            lightSpread={0.85}
            rayLength={1.6}
            followMouse={true}
            mouseInfluence={0.05}
            noiseAmount={0.03}
            distortion={0.02}
          />
        </div>

        {/* ── Floating Particles Effect ─────────────────────────── */}
        <div className="absolute inset-0 z-5 pointer-events-none opacity-45">
          <div className="absolute top-[18%] left-[8%]   w-2 h-2 rounded-full bg-[#C9A227]/50 blur-xs animate-float" style={{ animationDelay: '0s',  animationDuration: '9s'  }} />
          <div className="absolute top-[35%] right-[12%]  w-3 h-3 rounded-full bg-white/25   blur-xs animate-float" style={{ animationDelay: '2s',  animationDuration: '11s' }} />
          <div className="absolute bottom-[28%] left-[18%] w-2 h-2 rounded-full bg-[#C9A227]/35 blur-xs animate-float" style={{ animationDelay: '4s',  animationDuration: '8s'  }} />
          <div className="absolute bottom-[14%] right-[22%] w-2 h-2 rounded-full bg-white/20  blur-xs animate-float" style={{ animationDelay: '1s',  animationDuration: '13s' }} />
        </div>

        {/* ── Unified Hero Content Wrapper ────────────────────────── */}
        <div className="relative w-full h-full flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10 pt-16 lg:pt-0">
          <div className="max-w-4xl text-white space-y-5 lg:space-y-7">
            
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-1.5 lg:gap-2 bg-[#C9A227]/25 border border-[#C9A227]/40 px-4 lg:px-5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold text-[#FAF7F2] tracking-widest uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>The Artisan Bakery of Mohanur</span>
            </motion.div>
            
            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="font-playfair text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight drop-shadow-lg"
            >
              Freshly Baked Happiness
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-sm sm:text-base lg:text-lg text-white/95 font-light leading-relaxed max-w-xl lg:max-w-2xl mx-auto"
            >
              Discover delicious cream cakes, flaky hot puffs, traditional cookies, fresh milk bread, and authentic chat specialties. Handcrafted with love, baked fresh daily.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3 lg:pt-2"
            >
              <button
                onClick={() => setCurrentPage('menu')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#C9A227] text-[#2A0E0A] font-bold tracking-wide hover:bg-white hover:text-[#2A0E0A] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 shadow-lg shadow-black/25 cursor-pointer text-sm animate-pulse"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4 hidden sm:block" />
              </button>
              <button
                onClick={() => setCurrentPage('menu')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer text-sm"
              >
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

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. "Crafted Every Morning" Editorial Section */}
      <CraftedEveryMorning />

      {/* 5. Customer Reviews — Editorial Split with InfiniteSpiral */}
      <section className="relative bg-[#2A0E0A] text-white overflow-hidden snap-start-section">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C9A227]/8 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[600px] lg:min-h-[680px]">

          {/* ── LEFT: InfiniteSpiral ── */}
          <div className="relative w-full lg:w-[45%] h-[55vw] max-h-[420px] lg:max-h-none lg:h-auto shrink-0 overflow-hidden">
            {/* Fade edges into the dark bg */}
            <div className="absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-[#2A0E0A] to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-20 z-10 bg-gradient-to-b from-[#2A0E0A] to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 z-10 bg-gradient-to-t from-[#2A0E0A] to-transparent pointer-events-none" />
            <InfiniteSpiral
              items={SPIRAL_IMAGES}
              animationMode="auto"
              speed={0.42}
              radius={130}
              cardWidth={110}
              cardHeight={110}
              verticalSpacing={62}
              perspective={900}
              cardRadius={14}
              centerScale={1.18}
              edgeBlur={5}
              edgeFade={0.28}
              cardsPerTurn={7}
              pauseOnHover
              imageFit="cover"
            />
          </div>

          {/* ── RIGHT: Testimonial content ── */}
          <div className="flex flex-col justify-center flex-1 px-8 sm:px-14 lg:px-16 xl:px-20 py-16 lg:py-20 relative z-10">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px bg-[#C9A227]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A227]">
                Testimonials
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3"
            >
              Sweet Words<br className="hidden sm:block" /> from Customers
            </motion.h2>
            <div className="w-12 h-[2px] bg-[#C9A227] mb-10" />

            {/* Review body */}
            <div className="space-y-6 max-w-lg">
              {/* Stars */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 fill-[#C9A227] text-[#C9A227]" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-playfair text-lg sm:text-xl italic leading-relaxed text-white/90">
                "{REVIEWS[reviewSlide % REVIEWS.length].comment}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-2">
                <img
                  src={REVIEWS[reviewSlide % REVIEWS.length].avatar}
                  alt={REVIEWS[reviewSlide % REVIEWS.length].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A227] shadow-md shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {REVIEWS[reviewSlide % REVIEWS.length].name}
                  </h4>
                  <span className="text-xs text-[#C9A227] font-medium">
                    {REVIEWS[reviewSlide % REVIEWS.length].role}
                  </span>
                </div>
              </div>
            </div>

            {/* Dot controls */}
            <div className="flex items-center gap-2 mt-10">
              {REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setReviewSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (reviewSlide % REVIEWS.length) === idx
                      ? 'bg-[#C9A227] w-6'
                      : 'bg-white/25 w-2 hover:bg-white/50'
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>
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
