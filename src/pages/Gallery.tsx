import React, { useState } from 'react';
import { X, ZoomIn, Sparkles } from 'lucide-react';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { GalleryItem } from '../types';
import PillFilters from '../components/PillFilters';
import { motion, AnimatePresence } from 'framer-motion';
import BorderGlow from '../components/BorderGlow';
import Masonry from '../components/Masonry';
import DomeGallery from '../components/DomeGallery';

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<'masonry' | 'dome'>('masonry');

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

  const masonryItems = filteredGallery.map((item, idx) => {
    const heights = [600, 450, 700, 500, 800, 550];
    const height = heights[idx % heights.length];
    return {
      ...item,
      img: item.image,
      height
    };
  });

  return (
    <div className="pt-28 pb-20 min-h-screen bg-brand-cream-50/10">
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
        {/* View Mode Toggle Switch */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <div className="bg-[#FFF8F1] p-1.5 rounded-2xl inline-flex items-center gap-1.5 border border-brand-cream-100 shadow-sm">
            <button
              onClick={() => setViewMode('masonry')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                viewMode === 'masonry'
                  ? 'bg-[#2A0E0A] text-[#FAF7F2] shadow-md'
                  : 'text-brand-brown-800 hover:text-[#2A0E0A]'
              }`}
            >
              Masonry Grid
            </button>
            <button
              onClick={() => setViewMode('dome')}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                viewMode === 'dome'
                  ? 'bg-[#2A0E0A] text-[#FAF7F2] shadow-md'
                  : 'text-brand-brown-800 hover:text-[#2A0E0A]'
              }`}
            >
              Immersive Dome
            </button>
          </div>
        </div>

        {viewMode === 'masonry' ? (
          /* Unified Responsive Masonry Gallery View */
          <div className="w-full relative min-h-[500px]">
            <Masonry
              items={masonryItems}
              stagger={0.03}
              duration={0.6}
              ease="power3.out"
              scaleOnHover={true}
              hoverScale={0.96}
              blurToFocus={true}
              renderItem={(item: any) => (
                <BorderGlow
                  className="w-full h-full cursor-pointer overflow-hidden bg-brand-cream-100"
                  backgroundColor="#FAF8F5"
                  glowColor="46 64 52"
                  borderRadius={24}
                  glowRadius={25}
                  glowIntensity={0.8}
                  coneSpread={20}
                  colors={['#C9A227', '#2A0E0A', '#A46E6E']}
                  fillOpacity={0.15}
                >
                  <div onClick={() => setActiveImage(item)} className="relative group w-full h-full overflow-hidden rounded-[24px]">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-[1.04] transition-transform duration-750"
                    />
                    
                    {/* Cover Overlay on Hover */}
                    <div className="absolute inset-0 bg-[#2A0E0A]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 pointer-events-none">
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
              )}
            />
          </div>
        ) : (
          /* Immersive Dome Gallery View */
          <div className="w-full h-[65vh] rounded-[2.5rem] overflow-hidden relative border border-brand-cream-200/40 shadow-xl bg-[#120F17] flex flex-col justify-center items-center">
            {filteredGallery.length > 0 ? (
              <DomeGallery 
                images={filteredGallery.map(it => ({ src: it.image, alt: it.title }))}
                grayscale={false}
                overlayBlurColor="#120F17"
                minRadius={550}
                maxRadius={800}
                fit={0.45}
                imageBorderRadius="20px"
                openedImageBorderRadius="24px"
              />
            ) : (
              <div className="text-center p-8 text-[#FAF7F2]/40 font-light text-sm">
                No gallery images found in this category.
              </div>
            )}
          </div>
        )}

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
