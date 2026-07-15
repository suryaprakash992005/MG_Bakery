import React from 'react';
import { Html, useProgress } from '@react-three/drei';

export const Loader: React.FC = () => {
  const { progress } = useProgress();
  return (
    <Html center zIndexRange={[10, 20]}>
      <div className="flex flex-col items-center justify-center bg-brand-brown-950/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-brand-gold-500/30 text-white select-none whitespace-nowrap">
        <div className="w-8 h-8 rounded-full border-4 border-brand-gold-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-450">
          3D model loading... {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
};

export default Loader;
