import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-brown-950/80 backdrop-blur-md text-white z-50 pointer-events-none select-none">
      <div className="w-8 h-8 rounded-full border-4 border-brand-gold-500 border-t-transparent animate-spin mb-3" />
      <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
        3D model loading...
      </span>
    </div>
  );
};

export default Loader;
