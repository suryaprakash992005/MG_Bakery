import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Sparkles } from 'lucide-react';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { GalleryItem } from '../types';
import PillFilters from '../components/PillFilters';
import BorderGlow from '../components/BorderGlow';

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

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
          baseColor="#2C1717"
          pillColor="#ffffff"
          hoveredPillTextColor="#FAF8F5"
          pillTextColor="#5B3535"
        />

        {/* Gallery Masonry Layout */}
        <motion.div layout className="columns-2 lg:columns-3 gap-3 sm:gap-6 space-y-3 sm:space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredGallery.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="break-inside-avoid"
              >
                <BorderGlow
                  className="cursor-pointer bg-brand-cream-100"
                  backgroundColor="#FAF8F5"
                  glowColor="46 64 52"
                  borderRadius={24}
                  glowRadius={25}
                  glowIntensity={0.8}
                  coneSpread={20}
                  colors={['#D4AF37', '#2C1717', '#A46E6E']}
                  fillOpacity={0.15}
                >
                  <div onClick={() => setActiveImage(item)} className="relative group w-full h-full rounded-[24px] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-700"
                    />
                    
                    {/* Cover Overlay on Hover */}
                    <div className="absolute inset-0 bg-brand-brown-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6 pointer-events-none">
                      <div className="flex justify-end">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-brand-gold-500 font-bold block">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-white font-playfair block mt-1">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox / Modal */}
        <AnimatePresence>
          {activeImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)} 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown-950/90 backdrop-blur-md cursor-zoom-out"
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setActiveImage(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close image viewer"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Modal Image Wrapper */}
              <motion.div 
                initial={{ scale: 0.95, y: 15, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 15, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center gap-4 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage.image}
                  alt={activeImage.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-brand-gold-500 font-bold">
                    {activeImage.category}
                  </span>
                  <h3 className="font-playfair text-lg text-white font-semibold mt-1">
                    {activeImage.title}
                  </h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
