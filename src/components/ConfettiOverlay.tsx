import React, { useEffect, useRef } from 'react';

interface ConfettiOverlayProps {
  active: boolean;
  onComplete: () => void;
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Confetti particles
    interface ConfettiPiece {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      spin: number;
      opacity: number;
    }

    const colors = ['#C9A227', '#D4AF37', '#FAF7F2', '#A46E6E', '#865151', '#4A2C2A'];
    
    // Explode from bottom center / screen center
    const pieces: ConfettiPiece[] = Array.from({ length: 150 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 5;
      return {
        x: width / 2,
        y: height * 0.45,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 2, // upward initial blast bias
        rotation: Math.random() * 360,
        spin: Math.random() * 10 - 5,
        opacity: 1
      };
    });

    let frameCount = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      let activePieces = 0;
      pieces.forEach(p => {
        if (p.opacity <= 0) return;
        activePieces++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        // Update physics
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.25; // gravity
        p.speedX *= 0.98; // drag
        p.rotation += p.spin;
        
        // Decay opacity slowly after frame threshold
        if (frameCount > 80) {
          p.opacity -= 0.02;
        }
      });

      frameCount++;

      if (activePieces > 0 && frameCount < 200) {
        animId = requestAnimationFrame(draw);
      } else {
        onComplete();
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999999
      }}
    />
  );
};

export default ConfettiOverlay;
