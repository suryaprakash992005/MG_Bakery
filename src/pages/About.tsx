import React from 'react';
import { Coffee, ShieldCheck, Award, Heart, CheckCircle2, Leaf } from 'lucide-react';

export const About: React.FC = () => {
  const highlights = [
    { title: 'Pure Ingredients', desc: '100% select grain flours, fresh local dairy, and organic sweet fruits with no artificial additives.', icon: Leaf },
    { title: 'Strict Hygiene', desc: 'Surgical cleanliness levels across our artisan ovens, mixing stations, and display arrays.', icon: ShieldCheck },
    { title: 'Traditional Craft', desc: 'Baking methods passed down, preserving authentic flavors, textures, and tastes.', icon: Award },
    { title: 'Bake to Order', desc: 'Every celebratory cream cake is crafted fresh hours before pickup, never frozen.', icon: Heart }
  ];

  return (
    <div className="pt-28 pb-20 bg-brand-cream-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 1: Hero Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest">
              <Coffee className="w-3.5 h-3.5 text-brand-gold-850" />
              <span>Tradition & Taste</span>
            </div>
            <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-brand-brown-950 leading-tight">
              M.G. Iyengar Bakery:<br />Freshly Baked Happiness
            </h1>
            <p className="text-sm sm:text-base text-brand-brown-800/80 font-light leading-relaxed">
              For generations, M.G. Iyengar Bakery has stood as a beacon of quality in Mohanur, Namakkal district. What began as a humble neighborhood baking shop has evolved into a local icon, beloved for our warm traditional loaves, crispy spicy puffs, signature salt biscuits, and modern celebration cakes.
            </p>
            <p className="text-xs sm:text-sm text-brand-brown-800/70 font-light leading-relaxed">
              We merge the traditional art of South Indian Iyengar baking with modern pastry engineering. Whether it is our classic honey cake that takes you back to childhood, or our exotic Rasmalai fusion cake designed for grand milestones, we bake each item with absolute passion.
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="border-l-2 border-brand-gold-850 pl-4">
                <span className="block text-2xl font-bold text-brand-brown-950 font-playfair">100%</span>
                <span className="block text-[10px] text-brand-brown-800/50 uppercase tracking-wider font-semibold mt-1">Freshly Baked Daily</span>
              </div>
              <div className="border-l-2 border-brand-gold-850 pl-4">
                <span className="block text-2xl font-bold text-brand-brown-950 font-playfair">50+</span>
                <span className="block text-[10px] text-brand-brown-800/50 uppercase tracking-wider font-semibold mt-1">Delicacy Varieties</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-full max-w-[500px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                alt="Bakery kitchen interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Values Grid */}
        <div className="bg-white rounded-[3rem] p-8 sm:p-12 lg:p-16 border border-brand-cream-100/50 shadow-sm mb-24">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block mb-2">
              Our Principles
            </span>
            <h2 className="font-playfair text-3xl font-bold text-brand-brown-950">
              Why Mohanur Chooses Us
            </h2>
            <p className="text-xs sm:text-sm text-brand-brown-800/60 font-light mt-4">
              Our commitment to excellence shapes every batch of cookies, puffs, breads, and celebration cakes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-cream-50 text-brand-brown-950 flex items-center justify-center mx-auto shadow-sm">
                    <Icon className="w-6 h-6 text-brand-gold-850" />
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-brand-brown-950">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-brown-800/70 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Story of Ingredients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative flex justify-center">
            <div className="w-full max-w-[500px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white relative">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                alt="Flour wheat bread"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block">
              Ingredients & Process
            </span>
            <h2 className="font-playfair text-3xl font-bold text-brand-brown-950">
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
                <li key={idx} className="flex items-center gap-2.5 text-xs text-brand-brown-800/80 font-light">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold-850 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
