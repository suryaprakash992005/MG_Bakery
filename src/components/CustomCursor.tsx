import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Mouse Coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics config for smooth, premium delayed liquid movement
  const springConfig = { damping: 40, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect touch screens to disable custom cursor on mobile
    const checkTouch = () => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        setIsTouchDevice(true);
      }
    };
    checkTouch();

    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', moveMouse);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Hover detection over interactive tags
    const onMouseEnterLink = () => setIsHovered(true);
    const onMouseLeaveLink = () => setIsHovered(false);

    const addHoverListeners = () => {
      const interactives = document.querySelectorAll(
        'a, button, [role="button"], .cursor-pointer, input, select, textarea, [data-hover-glow]'
      );
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterLink);
        el.addEventListener('mouseleave', onMouseLeaveLink);
      });
    };

    addHoverListeners();

    // Re-bind listeners on DOM mutations to capture new elements (e.g. cart drawer content)
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      observer.disconnect();
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Inner Dot - follows instantly */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-brand-gold-850 rounded-full pointer-events-none z-[99999] mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />

      {/* Outer Ring - follows with spring lag for liquid effect */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border-2 border-brand-gold-850 pointer-events-none z-[99998] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 52 : 32,
          height: isHovered ? 52 : 32,
          backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
    </>
  );
};
