import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, Sparkles as SparklesIcon, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { Product } from '../types';
import Scene from './Scene';

// ── Web Audio Synth for retro/realistic bakery sound effects ────────────────
class BakeryAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted = true;

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && !this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playDing() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5 note
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12); // E6 note

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  playSteam() {
    if (this.isMuted || !this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 1.2);
    filter.Q.value = 1.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playHinge(open = true) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(open ? 120 : 180, now);
    osc.frequency.linearRampToValueAtTime(open ? 75 : 110, now + 0.55);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }
}

const audioSynth = new BakeryAudioSynth();

// ── Cakes Definitions ────────────────────────────────────────────────────────
interface CakeConfig {
  name: string;
  price: number;
  baseColor: string;
  frostingColor: string;
  pipingColor: string;
  topping: 'chocolate' | 'strawberry' | 'candles' | 'mango' | 'pineapple' | 'cherry' | 'velvet' | 'coconut';
  description: string;
  defaultImage: string;
  glbPath?: string;
}

const CAKE_CYCLE: CakeConfig[] = [
  {
    name: 'Chocolate Cake',
    price: 450,
    baseColor: '#2B1A13',
    frostingColor: '#3C261C',
    pipingColor: '#FAF8F5',
    topping: 'chocolate',
    description: 'Rich Belgian chocolate sponge layered with smooth chocolate ganache and finished with delicate dark chocolate curls.',
    defaultImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
    glbPath: '/assets/models/chocolate_cake.glb',
  },
  {
    name: 'Strawberry Cake',
    price: 400,
    baseColor: '#F5CBD2',
    frostingColor: '#F2A6B2',
    pipingColor: '#FAF8F5',
    topping: 'strawberry',
    description: 'Soft vanilla sponge filled with fresh Namakkal farm strawberry compote, covered in premium pink strawberry frosting.',
    defaultImage: 'https://images.unsplash.com/photo-1464349172961-104d33a39e8a?auto=format&fit=crop&w=400&q=80',
    glbPath: '/assets/models/strawberry_cake.glb',
  },
  {
    name: 'Birthday Cake',
    price: 500,
    baseColor: '#D8ECF8',
    frostingColor: '#FAF8F5',
    pipingColor: '#3BB2E0',
    topping: 'candles',
    description: 'Classic festive celebration cake covered in elegant white frosting, loaded with colorful funfetti sprinkles and candles.',
    defaultImage: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=400&q=80',
    glbPath: '/assets/models/birthday_cake.glb',
  },
  {
    name: 'Mango Cake',
    price: 480,
    baseColor: '#FFEAA7',
    frostingColor: '#FDCB6E',
    pipingColor: '#FAF8F5',
    topping: 'mango',
    description: 'Refreshing tropical sponge loaded with juicy Alphonso mango puree and layered with light mango cream cheese frosting.',
    defaultImage: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=400&q=80',
    glbPath: '/assets/models/mango_cake.glb',
  },
  {
    name: 'Black Forest',
    price: 450,
    baseColor: '#20110D',
    frostingColor: '#FAF8F5',
    pipingColor: '#20110D',
    topping: 'cherry',
    description: 'Traditional German layers of dark chocolate cake, whipped cream frosting, cherry compote filling, and dark chocolate flakes.',
    defaultImage: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=200&q=80',
    glbPath: '/assets/models/black_forest.glb',
  },
  {
    name: 'White Forest',
    price: 450,
    baseColor: '#FAF8F5',
    frostingColor: '#FAF8F5',
    pipingColor: '#D4AF37',
    topping: 'coconut',
    description: 'Delicate light sponge layered with whipped cream, glazed cherries, and topped with shaved premium white chocolate.',
    defaultImage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80',
    glbPath: '/assets/models/white_forest.glb',
  },
  {
    name: 'Red Velvet',
    price: 550,
    baseColor: '#9E0B14',
    frostingColor: '#FAF8F5',
    pipingColor: '#9E0B14',
    topping: 'velvet',
    description: 'Deep crimson cocoa sponge layered with rich vanilla cream cheese frosting and sprinkled with fine velvet cake crumbs.',
    defaultImage: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=400&q=80',
  },
];

interface BakeryOvenHeroProps {
  setCurrentPage: (page: string) => void;
}

export const BakeryOvenHero: React.FC<BakeryOvenHeroProps> = ({ setCurrentPage }) => {
  const { products } = useBakeryDatabase();
  const { addToCart, setIsCartOpen } = useCart();

  // Pointer coords
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  // Baking state machine
  const [bakingState, setBakingState] = useState<'baking' | 'opening' | 'present' | 'closing'>('baking');

  const [activeIdx, setActiveIdx] = useState(0);
  const activeCake = CAKE_CYCLE[activeIdx];

  // Animation states
  const [doorAngle, setDoorAngle] = useState(0);
  const [trayZ, setTrayZ] = useState(-0.55);
  const [glowIntensity, setGlowIntensity] = useState(1.0);
  const [cakeRot, setCakeRot] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Take Cake modal overlays
  const [selectedCakeDetail, setSelectedCakeDetail] = useState<CakeConfig | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<'½ Kg' | '1 Kg'>('½ Kg');
  const [bakingProgress, setBakingProgress] = useState(0);

  // Sync active item with database products
  const matchedProduct = useMemo<Product>(() => {
    if (!activeCake) return {} as Product;
    const query = activeCake.name.toLowerCase();
    const realProd = products.find(
      (p) => p.category === 'Cakes' && p.name.toLowerCase().includes(query)
    );
    if (realProd) return realProd;

    return {
      id: `hero-mock-${query.replace(/\s+/g, '-')}`,
      name: activeCake.name,
      description: activeCake.description,
      image: activeCake.defaultImage,
      category: 'Cakes',
      price: {
        halfKg: activeCake.price,
        oneKg: activeCake.price * 1.8,
      },
    } as Product;
  }, [activeCake, products]);

  // Audio mute toggler
  const handleToggleMute = () => {
    const muted = audioSynth.toggleMute();
    setIsMuted(muted);
  };

  // State Machine Cycle Timers
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;

    if (bakingState === 'baking') {
      setBakingProgress(0);
      const start = Date.now();
      const duration = 4000;

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - start;
        setBakingProgress(Math.min((elapsed / duration) * 100, 100));
      }, 50);

      timer = setTimeout(() => {
        setBakingState('opening');
        audioSynth.playDing();
      }, duration);
    } else if (bakingState === 'opening') {
      audioSynth.playHinge(true);
      audioSynth.playSteam();

      // Open Door
      let frame = 0;
      const animateOpen = () => {
        frame++;
        setDoorAngle((prev) => Math.min(prev + 0.12, 1.57));
        if (frame < 15) {
          requestAnimationFrame(animateOpen);
        }
      };
      animateOpen();

      timer = setTimeout(() => {
        setBakingState('present');
      }, 800);
    } else if (bakingState === 'present') {
      // Slide Tray Out
      let frame = 0;
      const animateSlideOut = () => {
        frame++;
        setTrayZ((prev) => Math.min(prev + 0.08, 0.72));
        if (frame < 16) {
          requestAnimationFrame(animateSlideOut);
        }
      };
      animateSlideOut();

      timer = setTimeout(() => {
        if (!selectedCakeDetail) {
          setBakingState('closing');
        }
      }, 5500);
    } else if (bakingState === 'closing') {
      audioSynth.playHinge(false);

      // Slide Tray In & Close Door
      let frame = 0;
      const animateClose = () => {
        frame++;
        setTrayZ((prev) => Math.max(prev - 0.08, -0.55));
        setDoorAngle((prev) => Math.max(prev - 0.1, 0));
        if (frame < 16) {
          requestAnimationFrame(animateClose);
        }
      };
      animateClose();

      timer = setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % CAKE_CYCLE.length);
        setBakingState('baking');
      }, 1200);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [bakingState, selectedCakeDetail]);

  // Handle fire flicker and cake rotation tick
  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setGlowIntensity(0.85 + Math.sin(Date.now() * 0.015) * 0.18 + Math.random() * 0.06);

      if (bakingState === 'present') {
        setCakeRot((prev) => prev + 0.014);
      } else {
        setCakeRot(0);
      }
      animFrame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animFrame);
  }, [bakingState]);

  // Capture mouse coordinates
  const handlePointerMove = (e: React.MouseEvent) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = (e.clientX - w / 2) / (w / 2);
    const y = (e.clientY - h / 2) / (h / 2);
    setPointer({ x, y });
  };

  const handleAddToCart = () => {
    if (!matchedProduct) return;
    addToCart(matchedProduct, selectedWeight, 1);
    setIsCartOpen(true);
    setSelectedCakeDetail(null);
    setBakingState('closing');
  };

  const handleWhatsAppOrder = () => {
    if (!matchedProduct) return;
    const weightText = selectedWeight;
    const priceText =
      selectedWeight === '½ Kg'
        ? (matchedProduct.price as any).halfKg || matchedProduct.price
        : (matchedProduct.price as any).oneKg || matchedProduct.price;

    const message = `Hello! I would like to order the freshly baked ${matchedProduct.name} (${weightText}) for ₹${priceText}.`;
    const url = `https://wa.me/919443536836?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Click handler on the door to open it
  const handleDoorClick = () => {
    if (bakingState === 'baking') {
      setBakingState('opening');
    }
  };

  // Click handler on the cake to take it
  const handleCakeClick = () => {
    if (bakingState === 'present') {
      setSelectedCakeDetail(activeCake);
    }
  };

  const handleCloseDetail = () => {
    setSelectedCakeDetail(null);
    setBakingState('closing');
  };

  return (
    <div
      onMouseMove={handlePointerMove}
      className="relative w-full h-[650px] sm:h-[720px] lg:h-[840px] bg-brand-brown-950 overflow-hidden flex flex-col justify-between pt-20"
      aria-label="3D Bakery Oven Showcase"
    >
      {/* Floor reflection gradient */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />

      {/* Audio Button */}
      <button
        onClick={handleToggleMute}
        className="absolute top-24 right-4 z-20 w-11 h-11 rounded-full bg-brand-cream-50/90 text-brand-brown-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border border-brand-cream-200"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-brand-gold-700 animate-pulse" />}
      </button>

      {/* ── 3D Viewport Scene ── */}
      <div className="absolute inset-0 z-0">
        <Scene
          pointer={pointer}
          zoomIn={!!selectedCakeDetail}
          doorAngle={doorAngle}
          trayPositionZ={trayZ}
          glowIntensity={glowIntensity}
          cakeRotationY={cakeRot}
          activeCake={activeCake}
          onDoorClick={handleDoorClick}
          onCakeClick={handleCakeClick}
          doorOpen={bakingState !== 'baking'}
        />
      </div>

      {/* baking status card */}
      <div className="absolute top-24 left-4 z-20 pointer-events-auto">
        <AnimatePresence mode="wait">
          {bakingState === 'baking' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-brand-cream-50/95 backdrop-blur-md rounded-2xl p-4 border border-brand-cream-200 shadow-xl max-w-[240px] select-none"
            >
              <div className="flex items-center gap-2 text-brand-gold-800 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-brand-gold-650 animate-ping" />
                <span>Now Baking...</span>
              </div>
              <h3 className="font-playfair font-bold text-brand-brown-950 mt-1 text-base leading-tight">
                {activeCake.name}
              </h3>
              <div className="w-full bg-brand-cream-200 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-brand-gold-700 h-full rounded-full transition-all duration-75"
                  style={{ width: `${bakingProgress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Presented Cake Card Banner */}
      <div className="w-full max-w-xl mx-auto px-4 pb-8 z-10 pointer-events-auto relative">
        <AnimatePresence mode="wait">
          {bakingState === 'present' && !selectedCakeDetail && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="bg-white/95 backdrop-blur-md border border-brand-cream-200 shadow-2xl p-5 rounded-3xl text-center animate-glow-glow"
            >
              <div className="inline-flex items-center gap-1 bg-brand-cream-100 text-brand-gold-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2.5">
                <SparklesIcon className="w-3 h-3 animate-spin" />
                <span>🔥 Freshly Baked</span>
              </div>
              <h2 className="font-playfair text-2xl font-bold text-brand-brown-950 leading-tight">
                {activeCake.name}
              </h2>
              <p className="text-xs text-brand-brown-800/70 font-light mt-2 max-w-sm mx-auto leading-relaxed">
                {activeCake.description}
              </p>
              <div className="flex items-center justify-between mt-4 max-w-sm mx-auto pt-3 border-t border-brand-cream-200">
                <span className="text-lg font-bold text-brand-gold-800 font-playfair">
                  Starting at ₹{activeCake.price}
                </span>
                <button
                  onClick={() => setSelectedCakeDetail(activeCake)}
                  className="px-6 py-2.5 rounded-full bg-brand-brown-950 text-white font-bold text-xs hover:bg-brand-gold-700 hover:text-brand-brown-950 transition-all duration-300 shadow-md shadow-brand-brown-950/20 cursor-pointer flex items-center gap-1.5 group"
                >
                  <span>Take the Cake</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating details Drawer */}
      <AnimatePresence>
        {selectedCakeDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-[#FAF8F5] max-w-md w-full rounded-[2rem] overflow-hidden shadow-2xl border border-brand-cream-200/60 p-6 flex flex-col gap-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-gold-750 uppercase tracking-widest block">
                    Specialty Cake
                  </span>
                  <h3 className="font-playfair text-2xl font-bold text-brand-brown-950 leading-tight mt-0.5">
                    {selectedCakeDetail.name}
                  </h3>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="w-8 h-8 rounded-full bg-brand-cream-100 text-brand-brown-950 flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border-2 border-brand-gold-200 shadow-inner">
                <img
                  src={selectedCakeDetail.defaultImage}
                  alt={selectedCakeDetail.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 px-2.5 py-1 rounded-full text-[10px] font-bold text-brand-gold-800 tracking-wider">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <p className="text-xs text-brand-brown-800/80 leading-relaxed font-light">
                {selectedCakeDetail.description}
              </p>

              <div className="flex items-center justify-between border-t border-b border-brand-cream-200 py-3.5">
                <span className="text-xs font-bold text-brand-brown-950">Select Size:</span>
                <div className="flex gap-2">
                  {['½ Kg', '1 Kg'].map((wt) => (
                    <button
                      key={wt}
                      onClick={() => setSelectedWeight(wt as any)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        selectedWeight === wt
                          ? 'bg-brand-gold-700 text-brand-brown-950 shadow-sm'
                          : 'bg-brand-cream-100 text-brand-brown-800 hover:bg-brand-cream-200'
                      }`}
                    >
                      {wt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-brand-brown-805/60">Total Price:</span>
                  <span className="text-xl font-bold font-playfair text-brand-gold-850">
                    ₹{selectedWeight === '½ Kg' ? selectedCakeDetail.price : selectedCakeDetail.price * 1.8}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 rounded-full bg-brand-cream-100 text-brand-brown-950 font-bold text-xs hover:bg-brand-cream-200 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3 rounded-full bg-brand-gold-700 text-brand-brown-950 font-bold text-xs hover:bg-brand-gold-750 transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSelectedCakeDetail(null);
                    setCurrentPage('custom-cake');
                  }}
                  className="w-full py-2.5 rounded-full border border-brand-gold-500/40 text-brand-gold-800 font-bold text-[10px] hover:bg-brand-gold-50/20 transition-all uppercase tracking-widest cursor-pointer mt-1"
                >
                  Need Custom Theme Decor? Click Here
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BakeryOvenHero;
