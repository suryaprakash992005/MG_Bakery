import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';

// Custom Rope & Card Physics Component
interface RopePoint {
  x: number;
  y: number;
  z: number;
  oldX: number;
  oldY: number;
  oldZ: number;
}

interface LanyardCardProps {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const LanyardCard: React.FC<LanyardCardProps> = ({ isDragging, setIsDragging }) => {
  const ropeRef = useRef<any>(null);
  const cardRef = useRef<THREE.Group>(null);
  
  const points = useRef<RopePoint[]>([]);
  
  // Physics parameters
  const gravity = 0.012;
  const segmentLength = 0.22;
  const dragCoeff = 0.982;
  const numPoints = 14;

  useEffect(() => {
    const arr: RopePoint[] = [];
    for (let i = 0; i < numPoints; i++) {
      arr.push({
        x: 0,
        y: 3 - i * segmentLength,
        z: 0,
        oldX: 0,
        oldY: 3 - i * segmentLength,
        oldZ: 0
      });
    }
    points.current = arr;
  }, []);

  useFrame((state) => {
    if (!points.current.length) return;
    
    const { mouse, viewport } = state;
    
    // 1. Drag interaction - pull the last node of the rope to target pointer coordinate
    if (isDragging) {
      const targetX = (mouse.x * viewport.width) / 1.7;
      const targetY = (mouse.y * viewport.height) / 1.7;
      const targetZ = 0;
      
      const lastPoint = points.current[points.current.length - 1];
      lastPoint.x = THREE.MathUtils.lerp(lastPoint.x, targetX, 0.25);
      lastPoint.y = THREE.MathUtils.lerp(lastPoint.y, targetY, 0.25);
      lastPoint.z = THREE.MathUtils.lerp(lastPoint.z, targetZ, 0.25);
    }
    
    // 2. Verlet Physics integration update
    for (let i = 1; i < points.current.length; i++) {
      const p = points.current[i];
      if (isDragging && i === points.current.length - 1) continue; // let drag override last point
      
      const vx = (p.x - p.oldX) * dragCoeff;
      const vy = (p.y - p.oldY) * dragCoeff;
      const vz = (p.z - p.oldZ) * dragCoeff;
      
      p.oldX = p.x;
      p.oldY = p.y;
      p.oldZ = p.z;
      
      p.x += vx;
      p.y += vy - gravity;
      p.z += vz;
    }
    
    // 3. Keep top anchor point fixed
    const topPoint = points.current[0];
    topPoint.x = 0;
    topPoint.y = 2.8;
    topPoint.z = 0;
    
    // 4. Resolve segment constraints iteratively
    for (let iteration = 0; iteration < 8; iteration++) {
      for (let i = 0; i < points.current.length - 1; i++) {
        const p1 = points.current[i];
        const p2 = points.current[i + 1];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
        const diff = segmentLength - dist;
        const percent = (diff / dist) * 0.5;
        
        const offsetX = dx * percent;
        const offsetY = dy * percent;
        const offsetZ = dz * percent;
        
        if (i > 0) {
          p1.x -= offsetX;
          p1.y -= offsetY;
          p1.z -= offsetZ;
        }
        if (!isDragging || i + 1 !== points.current.length - 1) {
          p2.x += offsetX;
          p2.y += offsetY;
          p2.z += offsetZ;
        }
      }
    }
    
    // 5. Update Rope Geometry
    if (ropeRef.current) {
      const positions = [];
      for (let i = 0; i < points.current.length; i++) {
        positions.push(new THREE.Vector3(points.current[i].x, points.current[i].y, points.current[i].z));
      }
      const curve = new THREE.CatmullRomCurve3(positions);
      const pointsData = curve.getPoints(40);
      ropeRef.current.geometry.setFromPoints(pointsData);
    }
    
    // 6. Update Card Mesh positions & inertial tilts
    if (cardRef.current) {
      const lastPoint = points.current[points.current.length - 1];
      const secondLastPoint = points.current[points.current.length - 2];
      
      cardRef.current.position.set(lastPoint.x, lastPoint.y, lastPoint.z);
      
      // Pitch/Roll tilt calculated from last segment vector angle
      const dirX = lastPoint.x - secondLastPoint.x;
      const dirY = lastPoint.y - secondLastPoint.y;
      const dirZ = lastPoint.z - secondLastPoint.z;
      
      const targetRotZ = Math.atan2(dirX, -dirY) * 0.65;
      const targetRotX = Math.atan2(dirZ, -dirY) * 0.65;
      
      // Dynamic Twist Rotation (on Y axis)
      let targetRotY = 0;
      if (isDragging) {
        targetRotY = mouse.x * 0.9;
      } else {
        // Natural spinning drag decay oscillation
        const time = state.clock.getElapsedTime();
        targetRotY = Math.sin(time * 1.5) * 0.2;
      }
      
      cardRef.current.rotation.z = THREE.MathUtils.lerp(cardRef.current.rotation.z, targetRotZ, 0.12);
      cardRef.current.rotation.x = THREE.MathUtils.lerp(cardRef.current.rotation.x, targetRotX, 0.12);
      cardRef.current.rotation.y = THREE.MathUtils.lerp(cardRef.current.rotation.y, targetRotY, 0.05);
    }
  });

  return (
    <group>
      {/* Golden hanging thread line */}
      {/* @ts-ignore */}
      <line ref={ropeRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(Array(14 * 3).fill(0)), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#D4AF37" linewidth={2.5} />
      </line>

      {/* Interactive Draggable 3D Card */}
      <group ref={cardRef}>
        <mesh
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
        >
          {/* Card Plastic Backplate base */}
          <boxGeometry args={[2.3, 3.4, 0.04]} />
          <meshPhysicalMaterial 
            color="#2A0E0A" 
            roughness={0.12} 
            metalness={0.15}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
          />
          
          {/* Front Lanyard card Face */}
          <Html
            position={[0, 0, 0.022]}
            transform
            occlude
            pointerEvents="none"
            style={{ width: '230px', height: '340px' }}
          >
            <div className="w-[230px] h-[340px] bg-[#FFF8F1] border-4 border-[#D4AF37] rounded-3xl p-4 flex flex-col justify-between items-center shadow-inner select-none font-poppins relative">
              {/* Gold Special Tag */}
              <div className="bg-[#4A2C2A] text-[#D4AF37] text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#D4AF37]/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span>TODAY SPECIAL</span>
              </div>
              
              {/* Product Photo */}
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-md my-2 bg-[#FAF7F2]">
                <img 
                  src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" 
                  alt="Black Forest Cake" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text metadata details */}
              <div className="text-center pb-2">
                <h3 className="font-playfair text-[#4A2C2A] text-base font-black leading-tight">
                  Black Forest Cake
                </h3>
                <span className="text-[8px] text-[#C9A227] tracking-wider uppercase font-bold mt-1 block">
                  M.G. Iyengar Bakery
                </span>
              </div>
              
              {/* Holographic safety lines */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
            </div>
          </Html>

          {/* Back Card Face (Bakery branding) */}
          <Html
            position={[0, 0, -0.022]}
            rotation={[0, Math.PI, 0]}
            transform
            occlude
            pointerEvents="none"
            style={{ width: '230px', height: '340px' }}
          >
            <div className="w-[230px] h-[340px] bg-[#2A0E0A] border-4 border-[#D4AF37] rounded-3xl p-6 flex flex-col justify-between items-center text-center shadow-inner select-none font-poppins relative">
              {/* Brand Logo design */}
              <div className="w-11 h-11 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-[#FFF8F1]/5 mt-2">
                <span className="text-[#D4AF37] font-playfair font-black text-sm">MG</span>
              </div>

              {/* Branding details */}
              <div className="space-y-1.5 my-auto">
                <h2 className="font-playfair text-[#D4AF37] text-lg font-bold tracking-tight">
                  M.G. Iyengar
                </h2>
                <div className="h-[1px] w-10 bg-[#D4AF37] mx-auto opacity-40" />
                <p className="text-[8px] text-white/50 tracking-widest uppercase font-semibold">
                  Bakery & Chats
                </p>
              </div>

              {/* Tagline */}
              <p className="font-playfair italic text-white/95 text-xs leading-relaxed border-t border-[#D4AF37]/20 pt-4 w-full mb-2">
                "Freshly Baked Happiness"
              </p>
            </div>
          </Html>
        </mesh>
      </group>
    </group>
  );
};

export const SpecialOffer: React.FC = () => {
  const { settings } = useBakeryDatabase();
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Floating background particles data
  const particles = useRef(
    Array.from({ length: 25 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * -20,
      duration: Math.random() * 15 + 10
    }))
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized viewport position (-1 to 1) for parallax background effects
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOrder = () => {
    const number = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER;
    const message = `Hello M.G. Iyengar Bakery, I would like to order the Today Special: Black Forest Cake (₹450). Please confirm my order!`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] overflow-hidden relative flex flex-col justify-between pt-24 font-poppins">
      {/* Slow moving soft background gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FFF8F1_0%,_#FFF3E6_100%)] z-0" />
      
      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 z-5 overflow-hidden pointer-events-none opacity-40">
        {particles.current.map((p, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-[#D4AF37]/35 blur-xs animate-sparkle-float"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {/* Large Parallax Faded Backdrop Text */}
      <div 
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none font-playfair font-black text-[#4A2C2A]/[0.022] text-[10vw] sm:text-[12vw] leading-none uppercase text-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * -35}px, ${mousePos.y * -35}px, 0)`
        }}
      >
        Today Special
      </div>

      {/* Top Header controls */}
      <div className="w-full max-w-7xl mx-auto px-4 z-10 relative flex justify-between items-center">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#4A2C2A] hover:text-[#C9A227] transition-colors py-2 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-1 text-[10px] tracking-widest text-[#C9A227] font-black uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exclusive Advert</span>
        </div>
      </div>

      {/* Central 3D Interactive WebGL Display */}
      <div className="flex-1 w-full max-w-4xl mx-auto h-[450px] relative z-10 cursor-grab active:cursor-grabbing">
        {/* Helper overlay instruction */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#2A0E0A]/8 py-1.5 px-4 rounded-full text-[9px] font-bold text-[#4A2C2A]/60 tracking-wider uppercase pointer-events-none z-20 select-none">
          {isDragging ? 'Dragging...' : 'Drag / Hold Card to Swing'}
        </div>

        <Canvas 
          camera={{ position: [0, 0, 5], fov: 65 }}
          shadows
        >
          <ambientLight intensity={0.7} />
          <directionalLight 
            position={[5, 6, 4]} 
            intensity={1.3} 
            color="#FFF8F1"
            castShadow 
          />
          <pointLight position={[-5, 5, -5]} intensity={0.4} color="#D4AF37" />
          <LanyardCard isDragging={isDragging} setIsDragging={setIsDragging} />
        </Canvas>
      </div>

      {/* Bottom Product Details Section */}
      <div className="w-full bg-gradient-to-t from-[#2A0E0A] to-[#3B1915]/95 text-white py-10 px-6 sm:px-12 rounded-t-[3.5rem] relative z-10 border-t border-[#D4AF37]/25 shadow-2xl">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Details Column */}
          <div className="space-y-3 max-w-xl text-left">
            <span className="text-[10px] tracking-widest text-[#D4AF37] font-black uppercase block">
              milestone celebration pick
            </span>
            <div className="flex items-baseline gap-4">
              <h1 className="font-playfair text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Black Forest Cake
              </h1>
              <span className="text-2xl font-playfair font-black text-[#D4AF37]">
                ₹450
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
              Indulge in our classic signature recipe. Features light, fluffy chocolate sponge layers baked fresh with rich cocoa, soaked in sugar syrup, filled with fresh dairy cream, and topped with premium dark chocolate shavings and sweet cherries.
            </p>
          </div>

          {/* Button Column */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={handleOrder}
              className="w-full md:w-auto bg-gradient-to-r from-[#D4AF37] via-[#E2C562] to-[#D4AF37] text-[#2A0E0A] hover:text-[#2A0E0A] font-bold px-10 py-4.5 rounded-full text-sm tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 hover:shadow-[0_0_30px_rgba(212,175,55,0.75)] hover:scale-103 transition-all duration-300 cursor-pointer border border-[#FFF8F1]/30 font-semibold"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Order Now via WhatsApp</span>
            </button>
          </div>
        </div>
        
        {/* Bottom copyright placeholder */}
        <div className="max-w-4xl mx-auto border-t border-white/10 mt-8 pt-4 text-center">
          <p className="text-[9px] text-white/30 uppercase tracking-widest">
            © 2026 M.G. Iyengar Bakery. All rights reserved. NAMAKKAL DISTRICT.
          </p>
        </div>
      </div>
    </div>
  );
};
