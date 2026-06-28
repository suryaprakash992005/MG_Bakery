import React, { useState, useEffect, useRef } from 'react';
import { Coffee, ShieldCheck, Award, Heart, CheckCircle2, Leaf } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack';

// Count-up helper component for viewport trigger
const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 1.5, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const About: React.FC = () => {
  const highlights = [
    { title: 'Pure Ingredients', desc: '100% select grain flours, fresh local dairy, and organic sweet fruits with no artificial additives.', icon: Leaf },
    { title: 'Strict Hygiene', desc: 'Surgical cleanliness levels across our ovens, mixing stations, and display arrays.', icon: ShieldCheck },
    { title: 'Traditional Craft', desc: 'Baking methods passed down, preserving authentic flavors, textures, and tastes.', icon: Award },
    { title: 'Bake to Order', desc: 'Every celebratory cream cake is crafted fresh hours before pickup, never frozen.', icon: Heart }
  ];

  return (
    <div className="pt-28 pb-20 bg-brand-cream-50/10 overflow-hidden font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 1: Hero Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest">
              <Coffee className="w-3.5 h-3.5 text-brand-gold-850" />
              <span>Tradition & Taste</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-brown-950 leading-tight">
              M.G. Iyengar Bakery:<br />Freshly Baked Happiness
            </h1>
            <p className="text-sm sm:text-base text-brand-brown-800/80 font-light leading-relaxed">
              For generations, M.G. Iyengar Bakery has stood as a beacon of quality in Mohanur, Namakkal district. What began as a humble neighborhood baking shop has evolved into a local icon, beloved for our warm traditional loaves, crispy spicy puffs, signature salt biscuits, and modern celebration cakes.
            </p>
            <p className="text-xs sm:text-sm text-brand-brown-800/75 font-light leading-relaxed">
              We merge the traditional art of South Indian Iyengar baking with modern pastry engineering. Whether it is our classic honey cake that takes you back to childhood, or our exotic Rasmalai fusion cake designed for grand milestones, we bake each item with absolute passion.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-cream-100/50">
              <div className="border-l-2 border-brand-gold-850 pl-4">
                <span className="block text-3xl font-bold text-[#2A0E0A] font-playfair">
                  <CountUp end={100} suffix="%" />
                </span>
                <span className="block text-[10px] text-brand-brown-800/50 uppercase tracking-wider font-semibold mt-1">Freshly Baked Daily</span>
              </div>
              <div className="border-l-2 border-brand-gold-850 pl-4">
                <span className="block text-3xl font-bold text-[#2A0E0A] font-playfair">
                  <CountUp end={50} suffix="+" />
                </span>
                <span className="block text-[10px] text-brand-brown-800/50 uppercase tracking-wider font-semibold mt-1">Delicacy Varieties</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative flex justify-center w-full"
          >
            <div className="w-full max-w-[500px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative">
              <motion.img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                alt="Bakery kitchen interior"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Section 2: Values Grid */}
        <div className="bg-white rounded-[3rem] p-8 sm:p-12 border border-brand-cream-100/50 shadow-sm mb-24">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold-750 font-bold block mb-2">
              Our Principles
            </span>
            <h2 className="font-playfair text-3xl font-bold text-brand-brown-950">
              Why Mohanur Chooses Us
            </h2>
            <p className="text-xs text-brand-brown-800/60 font-light mt-4">
              Our commitment to excellence shapes every batch of cookies, puffs, breads, and celebration cakes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-cream-50 text-brand-brown-950 flex items-center justify-center mx-auto shadow-sm">
                    <Icon className="w-6 h-6 text-brand-gold-850" />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-brand-brown-950">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-brown-800/70 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 3: History Timeline (with ScrollStack Card effect) */}
        <div className="py-20 border-t border-brand-cream-100/50 mb-24 max-w-4xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-widest text-[#C9A227] font-bold block mb-2">Our Journey</span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-brand-brown-950">A Timeline of Baking Excellence</h2>
          </div>
          
          <ScrollStack 
            useWindowScroll={true} 
            itemDistance={120} 
            itemScale={0.04} 
            itemStackDistance={35}
            stackPosition="25%"
            baseScale={0.88}
          >
            {[
              { year: '1996', title: 'The Oven Lights Up', desc: 'First traditional Iyengar bakery established in Mohanur, Namakkal, baking crispy salt biscuits and wood-fired breads.' },
              { year: '2005', title: 'Generations of Loyalty', desc: 'Introduced signature local treats like Honey Cake and Hot Puffs, becoming a household name in Mohanur.' },
              { year: '2018', title: 'Modern Celebration Cakes', desc: 'Launched the Luxury Celebration Cake Boutique, blending custom fondant aesthetics with high-quality recipes.' },
              { year: '2026', title: 'Going Digital & Beyond', desc: 'Connecting directly with customers through professional WhatsApp shopping and online database menus.' }
            ].map((milestone, idx) => (
              <ScrollStackItem key={idx}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-full relative">
                  {/* Left: Year Badge */}
                  <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-brand-cream-100 pb-3 sm:pb-0 sm:pr-8 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-brand-cream-50 flex items-center justify-center font-playfair font-black text-xl text-[#C9A227]">
                      {milestone.year.substring(2)}
                    </div>
                    <span className="font-playfair text-3xl font-black text-[#C9A227] tracking-tight">{milestone.year}</span>
                  </div>
                  {/* Right: Text content */}
                  <div className="space-y-1.5 flex-1 text-left">
                    <h4 className="text-base sm:text-lg font-bold text-brand-brown-950 leading-tight">
                      {milestone.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-brown-800/60 font-light leading-relaxed">
                      {milestone.desc}
                    </p>
                  </div>
                  {/* Luxury accent background */}
                  <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none text-[#C9A227] font-bold text-7xl select-none font-playfair">
                    {milestone.year}
                  </div>
                </div>
              </ScrollStackItem>
            ))}
          </ScrollStack>
        </div>

        {/* Section 4: Story of Ingredients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative flex justify-center w-full lg:order-first"
          >
            <div className="w-full max-w-[500px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                alt="Flour wheat bread"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="text-[10px] uppercase tracking-widest text-[#C9A227] font-bold block">
              Ingredients & Process
            </span>
            <h2 className="font-playfair text-3xl font-bold text-[#2A0E0A]">
              Freshly Sourced, Meticulously Prepared
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-800/80 font-light leading-relaxed">
              We believe a bakery product is only as good as the raw ingredients used to craft it. That is why our flour is milled to spec, our butter is pure dairy, and our cream is rich and sweet. We avoid chemical enhancers and artificial preservatives in our breads and rolls, ensuring a healthy experience for your family.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                'Daily fresh milk sourced from local farms in Namakkal.',
                'Premium Grade A vanilla extracts and cocoa chocolates.',
                'Vegetable fillings for puffs are cut fresh daily.',
                'Filter coffee blends ground freshly on-site.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-brand-brown-800/80 font-light">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
