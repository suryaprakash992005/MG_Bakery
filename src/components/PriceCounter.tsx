import React, { useEffect, useState, useRef } from 'react';

interface PriceCounterProps {
  value: number;
  duration?: number;
}

const PriceCounter: React.FC<PriceCounterProps> = ({ value, duration = 800 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = prevValueRef.current;
    const endVal = value;
    const change = endVal - startVal;

    // Fast return if no difference
    if (change === 0) {
      setDisplayValue(endVal);
      return;
    }

    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.round(startVal + change * easeProgress);
      
      setDisplayValue(currentVal);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = endVal;
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [value, duration]);

  return <>{displayValue}</>;
};

export default PriceCounter;
