import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coords
  const mouseRef = useRef({ x: 0, y: 0 });
  // Lerped coords for ring
  const ringRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Dynamic hover detection for interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.cursor-pointer') ||
        target.closest('[role="button"]');

      if (isInteractive) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    let animId: number;
    const tick = () => {
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;

      if (dot && ring) {
        // Direct follow for the inner dot
        dot.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;

        // Lerp for the outer ring (lerp factor: 0.15)
        ringRef.current.x += (mouseRef.current.x - ringRef.current.x) * 0.15;
        ringRef.current.y += (mouseRef.current.y - ringRef.current.y) * 0.15;
        
        ring.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  // Don't show custom cursor on touch screens/mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkTouch = () => {
      setIsMobile(window.matchMedia('(max-width: 1024px)').matches || ('ontouchstart' in window));
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  if (isMobile || !isVisible) return null;

  return (
    <>
      <div 
        ref={cursorDotRef} 
        className={`custom-cursor-dot ${isHovered ? 'cursor-hovered' : ''}`}
      />
      <div 
        ref={cursorRingRef} 
        className={`custom-cursor-ring ${isHovered ? 'cursor-hovered' : ''}`}
      />
    </>
  );
};

export default CustomCursor;
