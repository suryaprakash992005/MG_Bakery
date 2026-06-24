import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  src,
  alt,
  className = '',
  aspectRatio = ''
}) => {
  const [loaded, setLoaded] = useState(false);

  // Generate low-quality image placeholder source dynamically for Unsplash images
  const lqipSrc = React.useMemo(() => {
    if (!src) return '';
    if (src.includes('unsplash.com')) {
      try {
        const url = new URL(src);
        url.searchParams.set('w', '40');
        url.searchParams.set('q', '15');
        url.searchParams.set('blur', '5');
        return url.toString();
      } catch (e) {
        return src;
      }
    }
    return src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-brand-cream-100/30 ${aspectRatio} w-full h-full`}>
      {/* Low-quality blur placeholder */}
      {lqipSrc && !loaded && (
        <img
          src={lqipSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        } ${className}`}
      />
    </div>
  );
});

export default OptimizedImage;
