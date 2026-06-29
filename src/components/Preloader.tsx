import React, { useEffect, useState, useRef } from 'react';
import './Preloader.css';
import { Sparkles } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Incremental loader progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              onComplete();
            }, 600); // fadeOut duration
          }, 300);
          return 100;
        }
        // Random increment speed
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Animated flour particles canvas loop
  useEffect(() => {
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

    // Create flour particles
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      angle: number;
      spin: number;
    }

    const particles: Particle[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 1.5 + 0.5),
      speedX: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      angle: Math.random() * 360,
      spin: Math.random() * 2 - 1
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = `rgba(243, 237, 226, ${p.opacity})`;
        ctx.beginPath();
        // Flour particle represents small irregular circles/ellipses
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update coordinates
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spin;

        // Reset if float out of bounds
        if (p.y < -10) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className={`preloader-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <canvas ref={canvasRef} className="preloader-particles" />
      
      <div className="preloader-content">
        {/* Animated luxury brand logo crown */}
        <div className="logo-animation-container">
          <div className="chef-hat-pulse">
            <Sparkles className="w-14 h-14 text-[#C9A227] animate-pulse" />
          </div>
          <div className="logo-sparkle-glow" />
        </div>

        <h1 className="preloader-brand font-playfair text-[#FAF7F2]">
          M.G. Iyengar Bakery
        </h1>
        
        <p className="preloader-subtitle font-poppins">
          Freshly Baking...
        </p>

        {/* Loading progress bar container */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="progress-percentage font-poppins text-xs text-[#FAF7F2]/60">
          {progress}%
        </span>
      </div>
    </div>
  );
};

export default Preloader;
