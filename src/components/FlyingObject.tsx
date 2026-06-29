import React, { useEffect, useRef } from 'react';
import './FlyingObject.css';

interface FlyingObjectProps {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageSrc: string;
  onComplete: (id: string) => void;
}

const FlyingObject: React.FC<FlyingObjectProps> = ({
  id,
  startX,
  startY,
  endX,
  endY,
  imageSrc,
  onComplete
}) => {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Set dynamic css custom properties
    el.style.setProperty('--start-x', `${startX}px`);
    el.style.setProperty('--start-y', `${startY}px`);
    el.style.setProperty('--end-x', `${endX}px`);
    el.style.setProperty('--end-y', `${endY}px`);

    // Trigger complete handler after animation ends
    const handleEnd = () => {
      onComplete(id);
    };

    el.addEventListener('animationend', handleEnd);
    return () => {
      el.removeEventListener('animationend', handleEnd);
    };
  }, [id, startX, startY, endX, endY, onComplete]);

  return (
    <div ref={elRef} className="flying-product-thumbnail">
      <img src={imageSrc} alt="Flying product" />
    </div>
  );
};

export default FlyingObject;
