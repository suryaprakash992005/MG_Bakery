import React, { useState, useRef } from 'react';
import { X, ZoomIn, Sparkles } from 'lucide-react';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { GalleryItem } from '../types';
import PillFilters from '../components/PillFilters';
import { motion, AnimatePresence } from 'framer-motion';
import BorderGlow from '../components/BorderGlow';
import { ParticleCard, GlobalSpotlight } from '../components/MagicBento';
import { BubbleMenu } from '../components/BubbleMenu';

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const galleryGridRef = useRef<HTMLDivElement>(null);
  const desktopGalleryGridRef = useRef<HTMLDivElement>(null);

  const { gallery } = useBakeryDatabase();

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'cakes', label: 'Cakes' },
    { id: 'pastries', label: 'Pastries' },
    { id: 'interior', label: 'Interior Space' },
    { id: 'products', label: 'Fresh Products' },
    { id: 'celebrations', label: 'Celebrations' }
  ];

  const filteredGallery = gallery
    .filter((item) => {
      if (item.isDeleted) return false;
      return selectedCategory === 'all' || item.category === selectedCategory;
    })
    .sort((a, b) => (a.displayPriority || 9999) - (b.displayPriority || 9999));

  const bubbleMenuItems = [
    {
      label: 'All Photos',
      href: '#',
      rotation: -6,
      hoverStyles: { bgColor: '#2A0E0A', textColor: '#FAF7F2' },
      onClick: () => setSelectedCategory('all')
    },
    {
      label: 'Cakes',
      href: '#',
      rotation: 6,
      hoverStyles: { bgColor: '#C9A227', textColor: '#2A0E0A' },
      onClick: () => setSelectedCategory('cakes')
    },
    {
      label: 'Pastries',
      href: '#',
      rotation: -6,
      hoverStyles: { bgColor: '#2A0E0A', textColor: '#FAF7F2' },
      onClick: () => setSelectedCategory('pastries')
    },
    {
      label: 'Interior',
      href: '#',
      rotation: 6,
      hoverStyles: { bgColor: '#C9A227', textColor: '#2A0E0A' },
      onClick: () => setSelectedCategory('interior')
    },
    {
      label: 'Products',
      href: '#',
      rotation: -6,
      hoverStyles: { bgColor: '#2A0E0A', textColor: '#FAF7F2' },
      onClick: () => setSelectedCategory('products')
    },
    {
      label: 'Celebrations',
      href: '#',
      rotation: 6,
      hoverStyles: { bgColor: '#C9A227', textColor: '#2A0E0A' },
      onClick: () => setSelectedCategory('celebrations')
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-brand-cream-50/10 relative">
      {/* Dynamic Bubble Navigation Menu */}
      <BubbleMenu
        logo={<span className="font-playfair font-black text-[#2A0E0A] text-[10px] tracking-wider">GALLERY</span>}
        items={bubbleMenuItems}
        menuBg="#FAF7F2"
        menuContentColor="#2A0E0A"
        useFixedPosition={true}
        animationEase="back.out(1.5)"
        animationDuration={0.4}
        staggerDelay={0.08}
        style={{ top: '85px', right: '0px', left: 'auto', width: 'auto', paddingRight: '20px' }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-850" />
            <span>Visual Showcase</span>
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-brown-950">
            Our Bakery Gallery
          </h1>
          <p className="text-sm text-brand-brown-800/60 font-light mt-4">
            A visual journey of our ovens, premium creations, artisan shop details, and beautiful client celebration moments.
          </p>
        </div>

        {/* Categories Tabs */}
        <PillFilters
          items={categories}
          activeId={selectedCategory}
          onChange={setSelectedCategory}
          className="mb-12"
          baseColor="#2A0E0A"
          pillColor="#ffffff"
          hoveredPillTextColor="#FAF7F2"
          pillTextColor="#5B3535"
        />

        <GlobalSpotlight
          gridRef={galleryGridRef}
          glowColor="201, 162, 39"
          spotlightRadius={220}
        />
        <motion.div 
          ref={galleryGridRef}
          layout
          className="block lg:hidden columns-2 gap-4 space-y-4 bento-section"
        >
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: Math.min(idx * 0.05, 0.3) }}
                className="break-inside-avoid select-none"
              >
                <ParticleCard
                  disableAnimations={false}
                  particleCount={6}
                  glowColor="201, 162, 39"
                  enableTilt={true}
                  clickEffect={true}
                  enableMagnetism={false}
                  onClick={() => setActiveImage(item)}
                  className="magic-bento-product-card magic-bento-product-card--border-glow rounded-3xl overflow-hidden border border-brand-cream-100/40 shadow-sm cursor-pointer relative group w-full"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Cover Overlay on Hover */}
                  <div className="absolute inset-0 bg-[#2A0E0A]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 pointer-events-none z-10">
                    <div className="flex justify-end">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#C9A227] font-bold block">
                        {item.category}
                      </span>
                      <span className="text-sm font-bold text-white font-playfair block mt-1">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </ParticleCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <GlobalSpotlight
          gridRef={desktopGalleryGridRef}
          glowColor="201, 162, 39"
          spotlightRadius={280}
        />
        <div 
          ref={desktopGalleryGridRef}
          className="hidden lg:block columns-3 gap-6 space-y-6 bento-section"
        >
          {filteredGallery.map((item) => (
            <ParticleCard
              key={item.id}
              disableAnimations={false}
              particleCount={6}
              glowColor="201, 162, 39"
              enableTilt={true}
              clickEffect={true}
              enableMagnetism={false}
              className="magic-bento-product-card magic-bento-product-card--border-glow rounded-3xl"
              onClick={() => setActiveImage(item)}
            >
              <BorderGlow
                className="break-inside-avoid bg-brand-cream-100 w-full h-full"
                backgroundColor="#FAF8F5"
                glowColor="46 64 52"
                borderRadius={24}
                glowRadius={25}
                glowIntensity={0.8}
                coneSpread={20}
                colors={['#C9A227', '#2A0E0A', '#A46E6E']}
                fillOpacity={0.15}
              >
                <div className="relative group w-full h-full">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  
                  {/* Cover Overlay on Hover */}
                  <div className="absolute inset-0 bg-[#2A0E0A]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 pointer-events-none z-10">
                    <div className="flex justify-end">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#C9A227] font-bold block">
                        {item.category}
                      </span>
                      <span className="text-sm font-bold text-white font-playfair block mt-1">
                        {item.title}
                      </span>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </ParticleCard>
          ))}
        </div>

        {/* Lightbox / Modal with zoom animations */}
        <AnimatePresence>
          {activeImage && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2A0E0A]/95 backdrop-blur-sm cursor-zoom-out">
              {/* Backing Close trigger */}
              <div onClick={() => setActiveImage(null)} className="absolute inset-0" />

              {/* Close Button */}
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image viewer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal Image Wrapper */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center gap-4 focus:outline-none z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage.image}
                  alt={activeImage.title}
                  className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-[#C9A227] font-bold">
                    {activeImage.category}
                  </span>
                  <h3 className="font-playfair text-lg text-white font-semibold mt-1">
                    {activeImage.title}
                  </h3>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
