import React, { useState, useRef, useEffect } from 'react';
import {
  Cake, FileText, Send, Image as ImageIcon,
  Sparkles, Check, Plus, Minus,
  Upload, ChevronDown,
  Star, MessageCircle, ArrowRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBakeryDatabase } from '../context/DatabaseContext';
import SparklesText from '../components/SparklesText';

// ── Types ────────────────────────────────────────────────────────────────────
interface ConfigState {
  cakeType: string;
  shape: string;
  layers: number;
  weight: string;
  flavor: string;
  filling: string;
  frosting: string;
  theme: string;
  colors: string[];
  toppings: string[];
  specialRequest: string;
  images: { id: string; name: string; url: string; dataUrl: string }[];
  deliveryDate: string;
  preferredTime: string;
  deliveryType: 'Delivery' | 'Pickup';
  address: string;
  mapLocation: string;
  landmark: string;
  guests: number;
  dietary: {
    eggless: boolean;
    sugarFree: boolean;
    glutenFree: boolean;
    lessSweet: boolean;
    extraCream: boolean;
  };
  budget: string;
}

// ── Pricing Constants ─────────────────────────────────────────────────────────
const BASE_PRICE = 450;
const WEIGHT_PRICES: Record<string, number> = {
  '500g': 0,
  '1kg': 450,
  '1.5kg': 675,
  '2kg': 900,
  '3kg': 1350,
  '5kg': 2250,
  'Custom Weight': 1800,
};
const LAYER_PRICES: Record<number, number> = {
  1: 0,
  2: 150,
  3: 300,
  4: 450,
  5: 600,
};
const FROSTING_PRICES: Record<string, number> = {
  'Fondant': 250,
  'Mirror Glaze': 200,
  'Chocolate Ganache': 150,
  'Buttercream': 100,
  'Whipped Cream': 50,
  'Semi Naked': 50,
  'Textured': 80,
};
const THEME_PRICES: Record<string, number> = {
  'Princess': 350,
  'Superhero': 350,
  'Cartoon': 300,
  'Luxury': 400,
  'Floral': 250,
  'Anime': 350,
  'Sports': 300,
  'Cars': 300,
  'Baby': 250,
  'Wedding': 400,
  'Festival': 250,
  'Minimal': 100,
  'Custom Theme': 300,
};
const TOPPING_PRICES: Record<string, number> = {
  'Chocolate Chips': 50,
  'KitKat': 80,
  'Oreo': 60,
  'Ferrero': 150,
  'Sprinkles': 30,
  'Fresh Fruits': 120,
  'Macarons': 150,
  'Flowers': 100,
  'Candles': 20,
  'Gold Leaf': 200,
  'Custom Topper': 100,
};

// ── Selection Options ────────────────────────────────────────────────────────
const CAKE_TYPES = [
  { name: 'Birthday', icon: '🎂', desc: 'Fun & celebratory styles' },
  { name: 'Wedding', icon: '💑', desc: 'Grand multi-tier designs' },
  { name: 'Anniversary', icon: '❤️', desc: 'Elegant romantic themes' },
  { name: 'Baby Shower', icon: '🍼', desc: 'Cute pastels & characters' },
  { name: 'Engagement', icon: '💍', desc: 'Classy modern aesthetics' },
  { name: 'Corporate', icon: '🏢', desc: 'Clean logos & branding' },
  { name: 'Kids Theme', icon: '🎈', desc: 'Colorful cartoon magic' },
  { name: 'Photo Cake', icon: '📷', desc: 'Custom edible print' },
  { name: 'Heart Shape', icon: '💖', desc: 'Express your deep love' },
  { name: 'Bento Cake', icon: '🍱', desc: 'Cute mini lunchbox style' },
];

const CAKE_SHAPES = [
  { name: 'Round', icon: '⭕', desc: 'Classic circular tiers' },
  { name: 'Square', icon: '⬛', desc: 'Modern sharp corners' },
  { name: 'Heart', icon: '❤️', desc: 'Romantic and sweet' },
  { name: 'Rectangle', icon: '⬜', desc: 'Great for larger crowds' },
  { name: 'Hexagon', icon: '⬡', desc: 'Unique geometric touch' },
  { name: 'Custom', icon: '✨', desc: 'Sculpted or abstract shapes' },
];

const FLAVORS = [
  'Chocolate', 'Black Forest', 'White Forest', 'Butterscotch',
  'Red Velvet', 'Blueberry', 'Strawberry', 'Vanilla',
  'Pineapple', 'Rasmalai', 'KitKat', 'Oreo',
  'Ferrero', 'Nutella', 'Mango', 'Custom Flavor'
];

const FILLINGS = [
  'Chocolate Ganache', 'Fresh Cream', 'Whipped Cream', 'Butter Cream',
  'Nutella', 'Fruit Jam', 'Caramel', 'Blueberry Filling',
  'Strawberry Filling', 'None'
];

const FROSTINGS = [
  'Buttercream', 'Fondant', 'Whipped Cream',
  'Mirror Glaze', 'Chocolate Ganache', 'Semi Naked', 'Textured'
];

const THEMES = [
  { name: 'Princess', icon: '👑' },
  { name: 'Superhero', icon: '🦸' },
  { name: 'Cartoon', icon: '🦄' },
  { name: 'Minimal', icon: '◽' },
  { name: 'Luxury', icon: '✨' },
  { name: 'Floral', icon: '🌸' },
  { name: 'Anime', icon: '💥' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Cars', icon: '🏎️' },
  { name: 'Baby', icon: '🧸' },
  { name: 'Wedding', icon: '🕊️' },
  { name: 'Festival', icon: '🏮' },
  { name: 'Custom Theme', icon: '🎨' },
];

const COLOR_PALETTE = [
  { name: 'White', value: '#FFFFFF', border: 'border-gray-300' },
  { name: 'Cream', value: '#FAF5E6', border: 'border-brand-cream-300' },
  { name: 'Baby Pink', value: '#FFD1DC', border: 'border-pink-200' },
  { name: 'Pastel Blue', value: '#AEC6CF', border: 'border-blue-200' },
  { name: 'Luxury Gold', value: '#D4AF37', border: 'border-yellow-600' },
  { name: 'Deep Chocolate', value: '#3E2723', border: 'border-amber-950' },
  { name: 'Rich Red', value: '#C62828', border: 'border-red-800' },
  { name: 'Lilac', value: '#C8A2C8', border: 'border-purple-200' },
  { name: 'Mint Green', value: '#B3FFE6', border: 'border-emerald-200' },
  { name: 'Soft Peach', value: '#FFDAB9', border: 'border-orange-200' },
];

const TOPPINGS = [
  'Chocolate Chips', 'KitKat', 'Oreo', 'Ferrero',
  'Sprinkles', 'Fresh Fruits', 'Macarons', 'Flowers',
  'Candles', 'Gold Leaf', 'Custom Topper'
];

const BUDGET_RANGES = [
  '₹500-1000', '₹1000-2000', '₹2000-5000', '₹5000+', 'Custom Budget'
];

const FAQS = [
  { q: 'Can I order same day?', a: 'Simple customized cream cakes can be completed on the same day if ordered before 12:00 PM. Highly customized theme or fondant cakes require at least 24-48 hours notice.' },
  { q: 'Can I upload my design?', a: 'Yes! You can upload your inspiration sketches or reference images right here. When you click send, they will be saved so you can easily share them in our WhatsApp discussion.' },
  { q: 'Do you deliver?', a: 'We offer home delivery within Mohanur and surrounding limits. Delivery charges are calculated dynamically based on distance. You can also pick up directly from our store.' },
  { q: 'Can I change flavour?', a: 'Absolutely. You can select from our catalog options or request a fully customized flavor in the special requirements section.' },
  { q: 'Can I order eggless?', a: 'Yes, we specialize in 100% vegetarian eggless baking. You can toggle eggless, sugar-free, or gluten-free preferences in the celebration details step.' }
];

const TESTIMONIALS = [
  {
    name: 'Priya Raman',
    rating: 5,
    comment: 'Ordered a 3-tier princess cake for my daughter\'s birthday. It looked magical and the Rasmalai flavour was out of this world!',
    photo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Suresh Kumar',
    rating: 5,
    comment: 'The photo cake was extremely neat and the image quality was perfect. Chocolate truffle flavor was extremely rich.',
    photo: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Anjali Sharma',
    rating: 5,
    comment: 'Ordered a customized baby shower cake. Excellent design execution, eggless chocolate cake was moist and fresh.',
    photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80'
  }
];

export const CustomCake: React.FC = () => {
  const { settings } = useBakeryDatabase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [config, setConfig] = useState<ConfigState>({
    cakeType: 'Birthday',
    shape: 'Round',
    layers: 1,
    weight: '1kg',
    flavor: 'Chocolate',
    filling: 'Chocolate Ganache',
    frosting: 'Buttercream',
    theme: 'Minimal',
    colors: ['#FAF5E6'],
    toppings: ['Sprinkles'],
    specialRequest: '',
    images: [],
    deliveryDate: '',
    preferredTime: '16:00',
    deliveryType: 'Pickup',
    address: '',
    mapLocation: '',
    landmark: '',
    guests: 10,
    dietary: {
      eggless: true,
      sugarFree: false,
      glutenFree: false,
      lessSweet: false,
      extraCream: false,
    },
    budget: '₹1000-2000',
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // ── Pricing calculation ────────────────────────────────────────────────────
  const weightVal = WEIGHT_PRICES[config.weight] ?? 450;
  const layersVal = LAYER_PRICES[config.layers] ?? 0;
  const frostingVal = FROSTING_PRICES[config.frosting] ?? 50;
  const themeVal = THEME_PRICES[config.theme] ?? 100;
  const toppingsVal = config.toppings.reduce((sum, top) => sum + (TOPPING_PRICES[top] ?? 0), 0);
  const deliveryVal = config.deliveryType === 'Delivery' ? 120 : 0;
  const estimatedPrice = BASE_PRICE + weightVal + layersVal + frostingVal + themeVal + toppingsVal + deliveryVal;

  // ── Image Handlers with compression ────────────────────────────────────────
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Canvas compression
          const canvas = document.createElement('canvas');
          const max_size = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

          setConfig((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                url: URL.createObjectURL(file),
                dataUrl: compressedDataUrl,
              },
            ],
          }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }));
  };

  // ── WhatsApp Compiler ──────────────────────────────────────────────────────
  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.deliveryDate) {
      alert('Please select a preferred delivery date.');
      return;
    }

    const cleanNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '919345586112';

    // Build highly detailed message preview
    const dietaryList = [];
    if (config.dietary.eggless) dietaryList.push('Eggless 🌱');
    if (config.dietary.sugarFree) dietaryList.push('Sugar Free 🍬❌');
    if (config.dietary.glutenFree) dietaryList.push('Gluten Free 🌾❌');
    if (config.dietary.lessSweet) dietaryList.push('Less Sweet 📉');
    if (config.dietary.extraCream) dietaryList.push('Extra Cream 🧁');

    const toppingsList = config.toppings.length > 0 ? config.toppings.join(', ') : 'None';
    const colorsList = config.colors.length > 0 ? config.colors.join(', ') : 'Default / Cream';

    const text = `🎂 *CAKE DESIGN STUDIO INQUIRY* 🎂
---------------------------------------------
Hello M.G. Iyengar Bakery, I have designed a custom cake!

🎨 *CAKE CONFIGURATION:*
• *Occasion / Type:* ${config.cakeType}
• *Shape:* ${config.shape}
• *Layers:* ${config.layers} Layer(s)
• *Estimated Weight:* ${config.weight}
• *Flavor Base:* ${config.flavor}
• *Frosting Style:* ${config.frosting}
• *Filling Center:* ${config.filling}
• *Design Theme:* ${config.theme}
• *Color Palette:* ${colorsList}
• *Select Toppings:* ${toppingsList}

🍬 *DIETARY PREFERENCES:*
• ${dietaryList.length > 0 ? dietaryList.join(', ') : 'Standard'}
• *Approx. Guest Count:* ${config.guests} Guests

📅 *LOGISTICS & DELIVERY:*
• *Method:* ${config.deliveryType}
• *Desired Date:* ${config.deliveryDate}
• *Preferred Time:* ${config.preferredTime}
• *Budget Preference:* ${config.budget}
${config.deliveryType === 'Delivery' ? `• *Address:* ${config.address}
• *Landmark:* ${config.landmark}
• *Map Link:* ${config.mapLocation || 'Not provided'}` : '• *Pickup:* From Mohanur Store'}

✍️ *SPECIAL REQUIREMENTS:*
"${config.specialRequest || 'No additional notes'}"

🖼️ *INSPIRATION IMAGES:*
${config.images.length > 0 ? `• Attached reference image files: ${config.images.length} file(s)` : '• No images attached. Will share design inspiration if needed.'}

💵 *ESTIMATED STUDIO QUOTE:*
• *Calculated Price:* ₹${estimatedPrice}
*(Subject to review by pastry chef)*
---------------------------------------------
Please review and confirm slot availability! Thank you.`;

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // ── Render 3D-Like Preview ─────────────────────────────────────────────────
  const render3DPreview = () => {
    const mainColor = config.colors[0] || '#FAF5E6';
    const secondColor = config.colors[1] || mainColor;

    // Layer height scaling helper
    const renderLayer = (layerNum: number, totalLayers: number) => {
      const scale = 1 - (totalLayers - layerNum) * 0.12;
      const height = 40;
      const width = 160 * scale;
      const yOffset = (totalLayers - layerNum) * 44;

      return (
        <g key={layerNum} transform={`translate(0, ${-yOffset})`}>
          {/* Base 3D shadow side of layer */}
          <path
            d={`M ${-width} 0 A ${width} 24 0 0 0 ${width} 0 L ${width} ${height} A ${width} 24 0 0 1 ${-width} ${height} Z`}
            fill="url(#cake-side-grad)"
            opacity={0.9}
          />
          {/* Top surface ellipse */}
          <ellipse
            cx="0"
            cy="0"
            rx={width}
            ry="24"
            fill={mainColor}
            stroke={secondColor}
            strokeWidth="2"
          />

          {/* Drips or Glaze decoration if Mirror Glaze selected */}
          {config.frosting === 'Mirror Glaze' && (
            <path
              d={`M ${-width} 0 A ${width} 24 0 0 0 ${width} 0 C ${width*0.8} 10, ${width*0.6} 2, ${width*0.4} 12, ${width*0.2} 2, 0 10, ${-width*0.2} 2, ${-width*0.4} 12, ${-width*0.6} 2, ${-width*0.8} 10, ${-width} 0 Z`}
              fill="rgba(255,255,255,0.4)"
            />
          )}

          {/* Frosting Texture details */}
          {config.frosting === 'Textured' && (
            <path
              d={`M ${-width + 8} 10 C ${-width*0.5} 8, ${-width*0.2} 12, 0 10 C ${width*0.2} 8, ${width*0.5} 12, ${width - 8} 10`}
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}

          {/* Toppings sitting on the layer top surface */}
          {config.toppings.includes('Chocolate Chips') && (
            <g transform="translate(0, -6)">
              <circle cx="-30" cy="-6" r="3" fill="#3E2723" />
              <circle cx="30" cy="-6" r="3" fill="#3E2723" />
              <circle cx="0" cy="4" r="3" fill="#3E2723" />
            </g>
          )}

          {/* Macarons on the side */}
          {config.toppings.includes('Macarons') && (
            <g transform={`translate(${width - 15}, 15)`}>
              <ellipse cx="0" cy="0" rx="10" ry="6" fill="#F8BBD0" />
              <ellipse cx="0" cy="0" rx="8" ry="2" fill="#E91E63" />
            </g>
          )}

          {/* Flowers decoration */}
          {config.toppings.includes('Flowers') && (
            <g transform={`translate(${-width + 12}, 10)`}>
              <circle cx="0" cy="0" r="6" fill="#FF80AB" />
              <circle cx="0" cy="0" r="2" fill="#FFE082" />
            </g>
          )}
        </g>
      );
    };

    return (
      <div className="relative w-full aspect-square bg-gradient-to-br from-brand-cream-50 to-white rounded-3xl border border-brand-cream-100 flex items-center justify-center overflow-hidden shadow-inner p-4">
        {/* Steam Animation Elements */}
        <div className="absolute inset-x-0 bottom-1/2 flex justify-center gap-10 pointer-events-none z-10 opacity-40">
          <div className="w-1.5 h-16 bg-brand-gold-300 rounded-full blur-[3px] animate-[pulse_2s_infinite] transform translate-y-4" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-20 bg-brand-gold-300 rounded-full blur-[4px] animate-[pulse_2.5s_infinite]" style={{ animationDelay: '0.6s' }} />
          <div className="w-1.5 h-14 bg-brand-gold-300 rounded-full blur-[3px] animate-[pulse_1.8s_infinite] transform translate-y-2" style={{ animationDelay: '0.9s' }} />
        </div>

        {/* 3D Cake Platform */}
        <svg viewBox="-150 -150 300 300" className="w-full h-full max-w-[280px]">
          <defs>
            {/* Color Gradients */}
            <linearGradient id="cake-side-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={mainColor} />
              <stop offset="100%" stopColor={secondColor} stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="gold-stand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#AA7C11" />
              <stop offset="50%" stopColor="#F1C40F" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>
          </defs>

          {/* Stand Plate & Base */}
          <ellipse cx="0" cy="80" rx="120" ry="20" fill="url(#gold-stand-grad)" />
          <path d="M -15 80 L -25 120 L 25 120 L 15 80 Z" fill="url(#gold-stand-grad)" />
          <ellipse cx="0" cy="120" rx="50" ry="12" fill="#886008" />

          {/* Stack of Tiers */}
          <g transform="translate(0, 60)" className="transition-transform duration-500">
            {Array.from({ length: config.layers }).map((_, i) =>
              renderLayer(i + 1, config.layers)
            )}

            {/* Toppers / Ribbon decorations on the top tier */}
            <g transform={`translate(0, ${-(config.layers - 1) * 44 - 15})`}>
              {/* Gold Ribbon wrapped around the top tier base */}
              <ellipse cx="0" cy="14" rx={160 * (1 - (config.layers - 1) * 0.12)} ry="10" fill="none" stroke="#D4AF37" strokeWidth="4" />

              {/* Candles on Top */}
              {config.toppings.includes('Candles') && (
                <g transform="translate(0, -10)">
                  <rect x="-15" y="-15" width="4" height="15" fill="#E91E63" rx="1" />
                  <circle cx="-13" cy="-18" r="3" fill="#FFC107" className="animate-ping" />
                  <rect x="11" y="-15" width="4" height="15" fill="#00BCD4" rx="1" />
                  <circle cx="13" cy="-18" r="3" fill="#FFC107" className="animate-ping" />
                </g>
              )}

              {/* Custom Topper Sign */}
              {config.toppings.includes('Custom Topper') && (
                <g transform="translate(0, -25)">
                  <line x1="0" y1="0" x2="0" y2="25" stroke="#8D6E63" strokeWidth="3" />
                  <circle cx="0" cy="-5" r="22" fill="#D4AF37" />
                  <path d="M -12 -12 Q 0 -22 12 -12" fill="none" stroke="#FAF5E6" strokeWidth="2" />
                  <text x="0" y="0" textAnchor="middle" fill="#3E2723" fontSize="8" fontWeight="bold" fontFamily="serif">
                    {config.cakeType === 'Wedding' ? 'LOVE' : 'BEST'}
                  </text>
                </g>
              )}

              {/* Macaron on Top */}
              {!config.toppings.includes('Custom Topper') && config.toppings.includes('Macarons') && (
                <g transform="translate(0, -8)">
                  <ellipse cx="0" cy="0" rx="14" ry="8" fill="#F8BBD0" />
                  <ellipse cx="0" cy="0" rx="11" ry="3" fill="#E91E63" />
                </g>
              )}
            </g>
          </g>
        </svg>

        {/* Quick Config HUD tag */}
        <div className="absolute bottom-4 left-4 bg-brand-brown-950/80 text-[10px] text-brand-cream-50 px-3 py-1.5 rounded-xl backdrop-blur-sm pointer-events-none flex flex-col gap-0.5">
          <span className="font-bold text-brand-gold-500 uppercase tracking-widest">{config.shape} Shape</span>
          <span>{config.layers} Layer{config.layers > 1 ? 's' : ''} • {config.flavor}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-brand-cream-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── SECTION 1: Premium Hero ─────────────────────────────────────────── */}
        <div className="relative text-center max-w-4xl mx-auto mb-16 overflow-hidden py-12 px-6 rounded-3xl bg-gradient-to-b from-brand-cream-100/50 to-transparent border border-brand-cream-200/20">
          {/* Floating Macarons / Toppers Background Elements */}
          <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-pink-100 border border-pink-200 opacity-20 animate-[bounce_5s_infinite] pointer-events-none flex items-center justify-center text-xs">🧁</div>
          <div className="absolute top-20 right-12 w-6 h-6 rounded-full bg-yellow-100 border border-yellow-200 opacity-35 animate-[bounce_7s_infinite] pointer-events-none flex items-center justify-center text-xs">🍒</div>
          <div className="absolute bottom-12 left-16 w-10 h-10 rounded-full bg-brand-gold-100 border border-brand-gold-200 opacity-25 animate-[bounce_6s_infinite] pointer-events-none flex items-center justify-center text-xs">⭐</div>

          <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold-850" />
            <span>Design Your Dream Cake</span>
          </div>

          <SparklesText
            className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-brown-950 leading-tight"
            colors={{ first: '#D4AF37', second: '#C9A227' }}
            sparklesCount={10}
          >
            Cake Design Studio
          </SparklesText>

          <p className="text-sm sm:text-base text-brand-brown-800/70 font-light mt-5 max-w-xl mx-auto leading-relaxed">
            Unleash your creativity. Build your custom celebration cake step by step and visualize it instantly in our interactive studio.
          </p>

          {/* Scrolling Cake Ribbon Motif */}
          <div className="mt-8 overflow-hidden w-full h-8 relative flex items-center border-y border-brand-cream-200/50 opacity-60">
            <div className="flex gap-12 text-[10px] uppercase font-bold text-brand-gold-700 tracking-widest animate-[cat-chips-marquee_20s_linear_infinite] whitespace-nowrap">
              <span>✦ Custom Theme Cakes ✦</span>
              <span>✦ Baked Fresh Daily ✦</span>
              <span>✦ Premium Ingredients ✦</span>
              <span>✦ Artisan Craftsmanship ✦</span>
              <span>✦ Custom Theme Cakes ✦</span>
              <span>✦ Baked Fresh Daily ✦</span>
              <span>✦ Premium Ingredients ✦</span>
            </div>
          </div>
        </div>

        {/* ── Main Studio Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">

          {/* LEFT COLUMN: 10-Step Designer Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-8">
              
              {/* Step Navigation Header */}
              <div className="flex items-center justify-between border-b border-brand-cream-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold-700">Step {activeStep} of 10</span>
                  <h3 className="font-playfair text-lg font-bold text-brand-brown-950 mt-0.5">
                    {activeStep === 1 && 'Choose Celebration Type'}
                    {activeStep === 2 && 'Select Base Cake Shape'}
                    {activeStep === 3 && 'Choose Number of Layers'}
                    {activeStep === 4 && 'Choose Cake Weight'}
                    {activeStep === 5 && 'Select Premium Flavor'}
                    {activeStep === 6 && 'Choose Center Filling'}
                    {activeStep === 7 && 'Choose Frosting Texture'}
                    {activeStep === 8 && 'Select Design Theme'}
                    {activeStep === 9 && 'Choose Color Palette'}
                    {activeStep === 10 && 'Pick Extra Toppings'}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="p-2 rounded-full bg-brand-cream-50 border border-brand-cream-100 text-brand-brown-950 disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    type="button"
                    disabled={activeStep === 10}
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="p-2 rounded-full bg-brand-cream-50 border border-brand-cream-100 text-brand-brown-950 disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── STEP 1: Cake Type ───────────────────────────────────────── */}
              {activeStep === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CAKE_TYPES.map((type) => (
                    <button
                      key={type.name}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, cakeType: type.name }))}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        config.cakeType === type.name
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 shadow-sm'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                      }`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-brand-brown-950 block">{type.name}</span>
                        <span className="text-[10px] text-brand-brown-800/50 line-clamp-1">{type.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 2: Shape ───────────────────────────────────────────── */}
              {activeStep === 2 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CAKE_SHAPES.map((shape) => (
                    <button
                      key={shape.name}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, shape: shape.name }))}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        config.shape === shape.name
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 shadow-sm'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                      }`}
                    >
                      <span className="text-2xl">{shape.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-brand-brown-950 block">{shape.name}</span>
                        <span className="text-[10px] text-brand-brown-800/50 line-clamp-1">{shape.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 3: Layers ──────────────────────────────────────────── */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, layers: num }))}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          config.layers === num
                            ? 'border-brand-gold-500 bg-brand-cream-50/50 shadow-sm'
                            : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                        }`}
                      >
                        <span className="text-base font-bold text-brand-brown-950 block">{num}</span>
                        <span className="text-[9px] text-brand-brown-800/50 block mt-0.5">Tier{num > 1 ? 's' : ''}</span>
                        <span className="text-[8px] text-brand-gold-700 font-medium block mt-1">+₹{LAYER_PRICES[num]}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-brand-brown-800/50 italic text-center">
                    Multi-tier cakes create beautiful heights for weddings & milestone celebrations!
                  </p>
                </div>
              )}

              {/* ── STEP 4: Weight ──────────────────────────────────────────── */}
              {activeStep === 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.keys(WEIGHT_PRICES).map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, weight: wt }))}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        config.weight === wt
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 shadow-sm'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-brand-brown-950 block">{wt}</span>
                      <span className="text-[9px] text-brand-gold-700 block mt-1">+₹{WEIGHT_PRICES[wt]}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 5: Flavor ──────────────────────────────────────────── */}
              {activeStep === 5 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FLAVORS.map((flavor) => (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, flavor }))}
                      className={`p-3 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                        config.flavor === flavor
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 font-bold'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300 text-brand-brown-800'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 6: Filling ─────────────────────────────────────────── */}
              {activeStep === 6 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FILLINGS.map((filling) => (
                    <button
                      key={filling}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, filling }))}
                      className={`p-3 rounded-xl border text-center text-xs font-medium transition-all cursor-pointer ${
                        config.filling === filling
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 font-bold'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300 text-brand-brown-800'
                      }`}
                    >
                      {filling}
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 7: Frosting ────────────────────────────────────────── */}
              {activeStep === 7 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FROSTINGS.map((frosting) => (
                    <button
                      key={frosting}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, frosting }))}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        config.frosting === frosting
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 font-bold'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-brand-brown-950 block">{frosting}</span>
                      <span className="text-[9px] text-brand-gold-700 block mt-1">+₹{FROSTING_PRICES[frosting] ?? 0}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 8: Theme ───────────────────────────────────────────── */}
              {activeStep === 8 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, theme: theme.name }))}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        config.theme === theme.name
                          ? 'border-brand-gold-500 bg-brand-cream-50/50 font-bold'
                          : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                      }`}
                    >
                      <span className="text-xl block mb-1">{theme.icon}</span>
                      <span className="text-xs font-semibold text-brand-brown-950 block">{theme.name}</span>
                      <span className="text-[9px] text-brand-gold-700 block mt-1">+₹{THEME_PRICES[theme.name] ?? 0}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ── STEP 9: Color Palette ───────────────────────────────────── */}
              {activeStep === 9 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_PALETTE.map((color) => {
                      const isSelected = config.colors.includes(color.value);
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            setConfig(prev => {
                              const alreadySelected = prev.colors.includes(color.value);
                              const newColors = alreadySelected
                                ? prev.colors.filter(c => c !== color.value)
                                : [...prev.colors, color.value].slice(0, 3); // Max 3 colors
                              return { ...prev, colors: newColors };
                            });
                          }}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border cursor-pointer transition-all ${
                            isSelected ? 'border-brand-gold-500 bg-brand-cream-50/30' : 'border-brand-cream-100 hover:border-brand-cream-300'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full border shadow-sm ${color.border}`}
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-[9px] text-center text-brand-brown-950 leading-tight font-medium">{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-brand-brown-800/50 text-center italic">
                    Select up to 3 colors to define your custom cake palette!
                  </p>
                </div>
              )}

              {/* ── STEP 10: Toppings ───────────────────────────────────────── */}
              {activeStep === 10 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TOPPINGS.map((top) => {
                    const isSelected = config.toppings.includes(top);
                    return (
                      <button
                        key={top}
                        type="button"
                        onClick={() => {
                          setConfig(prev => {
                            const newTops = prev.toppings.includes(top)
                              ? prev.toppings.filter(t => t !== top)
                              : [...prev.toppings, top];
                            return { ...prev, toppings: newTops };
                          });
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                          isSelected ? 'border-brand-gold-500 bg-brand-cream-50/50 font-bold' : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs text-brand-brown-950 block">{top}</span>
                          <span className="text-[8px] text-brand-gold-700 block mt-0.5">+₹{TOPPING_PRICES[top] ?? 0}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'border-brand-gold-600 bg-brand-gold-500 text-white' : 'border-gray-300'}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── SECTION 4: Special Requirements ─────────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-4">
              <label className="block text-xs font-semibold text-brand-brown-850 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-brand-gold-850" />
                <span>Special Requirements & Design Notes</span>
              </label>
              <textarea
                rows={4}
                value={config.specialRequest}
                onChange={(e) => setConfig(prev => ({ ...prev, specialRequest: e.target.value }))}
                placeholder="Write your cake idea, inspiration, theme, names, special decorations or any custom requests..."
                className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-2xl px-4 py-3 text-xs text-brand-brown-950 placeholder-brand-brown-800/35 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20 resize-none leading-relaxed"
              />
            </div>

            {/* ── SECTION 5: Upload Inspiration Images ───────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-4">
              <label className="block text-xs font-semibold text-brand-brown-850 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-brand-gold-850" />
                <span>Upload Inspiration Images (Multiple)</span>
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragOver ? 'border-brand-gold-500 bg-brand-cream-50' : 'border-brand-cream-200 bg-brand-cream-50/30 hover:border-brand-cream-300'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-brand-gold-700" />
                <span className="text-xs font-bold text-brand-brown-950">Drag & Drop cake photos here</span>
                <span className="text-[10px] text-brand-brown-800/40">or click to browse local files (PNG, JPG)</span>
              </div>

              {/* Compressed Image Previews */}
              {config.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {config.images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-brand-cream-200 shadow-sm group">
                      <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-brand-brown-950/80 text-brand-cream-50 hover:bg-brand-brown-950 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── SECTION 6 & 7: Delivery & Celebration Details ───────────────── */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-6">
              <h3 className="font-playfair text-base font-bold text-brand-brown-950 border-b border-brand-cream-50 pb-2">Logistics & Dietary Preferences</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={config.deliveryDate}
                    onChange={(e) => setConfig(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-2.5 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                  />
                </div>

                {/* Time */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Preferred Time Slot</label>
                  <input
                    type="time"
                    value={config.preferredTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, preferredTime: e.target.value }))}
                    className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-2.5 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                  />
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Fulfillment Method</label>
                <div className="flex bg-brand-cream-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, deliveryType: 'Pickup' }))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      config.deliveryType === 'Pickup' ? 'bg-white text-brand-brown-950 shadow-sm' : 'text-brand-brown-800/60'
                    }`}
                  >
                    Store Pickup (Mohanur)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, deliveryType: 'Delivery' }))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      config.deliveryType === 'Delivery' ? 'bg-white text-brand-brown-950 shadow-sm' : 'text-brand-brown-800/60'
                    }`}
                  >
                    Home Delivery (+₹120)
                  </button>
                </div>
              </div>

              {config.deliveryType === 'Delivery' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Street address, building, floor..."
                      value={config.address}
                      onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-2.5 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Landmark</label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite post office"
                        value={config.landmark}
                        onChange={(e) => setConfig(prev => ({ ...prev, landmark: e.target.value }))}
                        className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-2.5 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Google Map Link (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://maps.google.com/..."
                        value={config.mapLocation}
                        onChange={(e) => setConfig(prev => ({ ...prev, mapLocation: e.target.value }))}
                        className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-2.5 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Celebration Details / Dietary */}
              <div className="border-t border-brand-cream-100 pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Guests */}
                  <div className="col-span-2 sm:col-span-1 space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-brown-800">Approx Guests</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, guests: Math.max(5, prev.guests - 5) }))}
                        className="p-1.5 rounded bg-brand-cream-100 text-brand-brown-950 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-brand-brown-950 w-8 text-center">{config.guests}</span>
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, guests: prev.guests + 5 }))}
                        className="p-1.5 rounded bg-brand-cream-100 text-brand-brown-950 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Eggless toggle */}
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, dietary: { ...prev.dietary, eggless: !prev.dietary.eggless } }))}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      config.dietary.eggless ? 'border-green-500 bg-green-50/30' : 'border-brand-cream-100'
                    }`}
                  >
                    <span className="text-xs font-semibold text-brand-brown-950 block">100% Eggless 🌱</span>
                  </button>

                  {/* Sugar free toggle */}
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, dietary: { ...prev.dietary, sugarFree: !prev.dietary.sugarFree } }))}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      config.dietary.sugarFree ? 'border-brand-gold-500 bg-brand-cream-50/30' : 'border-brand-cream-100'
                    }`}
                  >
                    <span className="text-xs font-semibold text-brand-brown-950 block">Sugar Free 🍬❌</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Gluten Free */}
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, dietary: { ...prev.dietary, glutenFree: !prev.dietary.glutenFree } }))}
                    className={`p-2 rounded-xl border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                      config.dietary.glutenFree ? 'border-brand-gold-500 bg-brand-cream-50/30' : 'border-brand-cream-100'
                    }`}
                  >
                    Gluten Free
                  </button>

                  {/* Less Sweet */}
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, dietary: { ...prev.dietary, lessSweet: !prev.dietary.lessSweet } }))}
                    className={`p-2 rounded-xl border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                      config.dietary.lessSweet ? 'border-brand-gold-500 bg-brand-cream-50/30' : 'border-brand-cream-100'
                    }`}
                  >
                    Less Sweet
                  </button>

                  {/* Extra Cream */}
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, dietary: { ...prev.dietary, extraCream: !prev.dietary.extraCream } }))}
                    className={`p-2 rounded-xl border text-center text-[10px] font-semibold cursor-pointer transition-all ${
                      config.dietary.extraCream ? 'border-brand-gold-500 bg-brand-cream-50/30' : 'border-brand-cream-100'
                    }`}
                  >
                    Extra Cream
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 8: Budget Estimator ─────────────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-4">
              <label className="block text-xs font-semibold text-brand-brown-850">Target Budget Estimate</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {BUDGET_RANGES.map((bRange) => (
                  <button
                    key={bRange}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, budget: bRange }))}
                    className={`p-2.5 rounded-xl border text-center text-[10px] font-semibold transition-all cursor-pointer ${
                      config.budget === bRange ? 'border-brand-gold-500 bg-brand-cream-50/50 font-bold' : 'border-brand-cream-100 bg-white hover:border-brand-cream-300'
                    }`}
                  >
                    {bRange}
                  </button>
                ))}
              </div>
            </div>

            {/* ── SECTION 11: Order Timeline ──────────────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-6">
              <h3 className="font-playfair text-base font-bold text-brand-brown-950">Inquiry & Customization Flow</h3>
              <div className="relative flex flex-col sm:flex-row justify-between gap-4 sm:gap-2">
                {[
                  { title: 'Inquiry Submitted', desc: 'Send customized configuration via WhatsApp' },
                  { title: 'Chef Review', desc: 'Head Pastry Chef reviews custom details' },
                  { title: 'Confirmation', desc: 'Price proposal & design confirmation' },
                  { title: 'Preparation', desc: 'Artisan hand-baking on delivery date' }
                ].map((step, idx) => (
                  <div key={idx} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2 flex-1">
                    <div className="w-6 h-6 rounded-full bg-brand-gold-500 text-brand-cream-50 text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-brown-950">{step.title}</h4>
                      <p className="text-[9px] text-brand-brown-800/50 mt-0.5 leading-tight">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 13: FAQs ────────────────────────────────────────────── */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-brand-cream-100/50 shadow-sm space-y-4">
              <h3 className="font-playfair text-base font-bold text-brand-brown-950">Studio FAQs</h3>
              <div className="space-y-2">
                {FAQS.map((faq, idx) => {
                  const isOpen = faqOpen === idx;
                  return (
                    <div key={idx} className="border-b border-brand-cream-50 pb-2">
                      <button
                        type="button"
                        onClick={() => setFaqOpen(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between py-2 text-left text-xs font-bold text-brand-brown-950 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-brand-gold-800 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[10px] text-brand-brown-800/60 font-light pb-2 leading-relaxed">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive 3D-Like Preview & Estimator HUD */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            {/* Live 3D-Like Preview Card */}
            <div className="bg-white rounded-[2rem] p-5 border border-brand-cream-100/50 shadow-sm space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block">Live Studio Preview</span>
              {render3DPreview()}
            </div>

            {/* Dynamic Price Estimation HUD */}
            <div className="bg-white rounded-[2rem] p-6 border border-brand-cream-100/50 shadow-sm space-y-4">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block">Price Breakdown</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-brand-brown-800/70">
                  <span>Base Studio Cost</span>
                  <span>₹{BASE_PRICE}</span>
                </div>
                <div className="flex justify-between text-brand-brown-800/70">
                  <span>Weight ({config.weight})</span>
                  <span>+₹{weightVal}</span>
                </div>
                {layersVal > 0 && (
                  <div className="flex justify-between text-brand-brown-800/70">
                    <span>Multi-Tier layers ({config.layers})</span>
                    <span>+₹{layersVal}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-brown-800/70">
                  <span>Frosting ({config.frosting})</span>
                  <span>+₹{frostingVal}</span>
                </div>
                <div className="flex justify-between text-brand-brown-800/70">
                  <span>Theme Details ({config.theme})</span>
                  <span>+₹{themeVal}</span>
                </div>
                {toppingsVal > 0 && (
                  <div className="flex justify-between text-brand-brown-800/70">
                    <span>Extra Toppings</span>
                    <span>+₹{toppingsVal}</span>
                  </div>
                )}
                {deliveryVal > 0 && (
                  <div className="flex justify-between text-brand-brown-800/70">
                    <span>Fulfillment ({config.deliveryType})</span>
                    <span>+₹{deliveryVal}</span>
                  </div>
                )}
                <div className="border-t border-brand-cream-100 pt-2 flex justify-between font-bold text-brand-brown-950 text-sm">
                  <span>Estimated Total</span>
                  <span className="text-brand-gold-850">₹{estimatedPrice}</span>
                </div>
              </div>
            </div>

            {/* WhatsApp Preview Modal Box */}
            <div className="bg-brand-cream-100/30 rounded-[2rem] p-6 border border-brand-cream-200/40 space-y-3">
              <div className="flex items-center gap-1.5 text-brand-brown-950">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold">WhatsApp Inquiry Format</span>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-brand-cream-100 text-[10px] text-brand-brown-800/70 space-y-1.5 max-h-40 overflow-y-auto font-mono scrollbar-thin">
                <div className="font-bold text-brand-brown-950 mb-1">🎂 CUSTOM CAKE INQUIRY</div>
                <div>👤 Flavor: {config.flavor}</div>
                <div>📐 Shape: {config.shape} • Layers: {config.layers}</div>
                <div>⚖️ Weight: {config.weight}</div>
                <div>🎉 Occasion: {config.cakeType}</div>
                <div>📆 Date: {config.deliveryDate || 'Not selected'}</div>
                <div>💵 Est. Total: ₹{estimatedPrice}</div>
              </div>
            </div>

            {/* Testimonials Auto-Slider */}
            <div className="bg-white rounded-[2rem] p-6 border border-brand-cream-100/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-4 right-4 text-brand-gold-600 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-brand-gold-500" />)}
              </div>
              <span className="text-[9px] uppercase tracking-widest text-brand-gold-700 font-bold block mb-3">Happy Celebrations</span>
              
              <div className="h-28 flex flex-col justify-between">
                <p className="text-[10px] text-brand-brown-800/80 italic leading-relaxed">
                  "{TESTIMONIALS[currentTestimonial].comment}"
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={TESTIMONIALS[currentTestimonial].photo}
                    alt={TESTIMONIALS[currentTestimonial].name}
                    className="w-8 h-8 rounded-full object-cover border border-brand-cream-100"
                  />
                  <div>
                    <span className="text-xs font-bold text-brand-brown-950 block">{TESTIMONIALS[currentTestimonial].name}</span>
                    <span className="text-[9px] text-brand-brown-800/40 block">Verified Customer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 12: Customer Confidence ── */}
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { label: '100% Freshly Baked', icon: '🧁' },
                { label: 'Premium Ingredients', icon: '🌾' },
                { label: 'Handcrafted Decoration', icon: '🎨' },
                { label: 'Hygienic Bakery Kitchen', icon: '🧼' }
              ].map((usp, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-3 border border-brand-cream-100/50 flex flex-col items-center justify-center gap-1">
                  <span className="text-xl">{usp.icon}</span>
                  <span className="text-[9px] font-bold text-brand-brown-950 leading-tight">{usp.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STICKY SUMMARY CARD (Bottom Pinned) ─────────────────────────────── */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-brand-cream-200 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] py-4 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-brand-cream-100 flex items-center justify-center text-brand-gold-850 shrink-0">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-brand-brown-950 block sm:inline-block mr-2">
                  {config.cakeType} • {config.weight} • {config.flavor}
                </span>
                <span className="text-[10px] text-brand-brown-800/60 block">
                  Date: {config.deliveryDate || 'Select Date'} • Color: {config.colors[0] ? 'Custom' : 'Cream'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[10px] text-brand-brown-800/40 block">Estimated Quote</span>
                <span className="text-base font-bold text-brand-gold-850">₹{estimatedPrice}</span>
              </div>
              <button
                onClick={handleWhatsAppSubmit}
                className="btn-primary py-3 px-6 text-xs font-bold flex items-center gap-2 rounded-full cursor-pointer shadow-md shadow-brand-gold-500/10 hover:shadow-brand-gold-500/20"
              >
                <Send className="w-3.5 h-3.5 text-brand-gold-850" />
                <span>Submit Inquiry on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomCake;
