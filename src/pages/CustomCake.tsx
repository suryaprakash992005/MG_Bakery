import React, { useState } from 'react';
import { Cake, Calendar, FileText, Send, Image as ImageIcon } from 'lucide-react';
import { CustomCakeInquiry } from '../types';
import { getCustomCakeInquiryUrl } from '../utils/whatsappHelper';
import FlowingSelect from '../components/FlowingSelect';
import { useBakeryDatabase } from '../context/DatabaseContext';


export const CustomCake: React.FC = () => {
  const { products, settings } = useBakeryDatabase();
  const [formData, setFormData] = useState<CustomCakeInquiry>({
    name: '',
    mobile: '',
    flavor: 'Rasmalai Cake',
    weight: '1 Kg',
    occasion: 'Birthday',
    deliveryDate: '',
    instructions: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const flavorOptions = [
    'White Forest',
    'White Truffle',
    'Black Forest',
    'Chocochip Truffle',
    'Pineapple',
    'Strawberry',
    'Mango',
    'Blueberry',
    'Red Velvet',
    'Honey Almond',
    'Rasmalai Cake',
    'Choco Almond',
    'Nutty Bubble',
    'Other / Custom Choice'
  ];

  const weightOptions = [
    '1 Kg',
    '1.5 Kg',
    '2 Kg',
    '2.5 Kg',
    '3 Kg',
    '4 Kg',
    '5 Kg',
    'Above 5 Kg'
  ];

  const occasionOptions = [
    'Birthday',
    'Anniversary',
    'Wedding Reception',
    'Engagement',
    'Baby Shower',
    'Festival / Puja',
    'Corporate Event',
    'House Warming',
    'Other Celebration'
  ];

  const flavorOptionsMapped = flavorOptions.map(flavor => {
    const matchingProduct = products.find(p => p.name.toLowerCase() === flavor.toLowerCase());
    return {
      value: flavor,
      label: flavor,
      image: matchingProduct ? matchingProduct.image : 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80'
    };
  });

  const weightOptionsMapped = weightOptions.map((weight, idx) => {
    const images = [
      'https://images.unsplash.com/photo-1602351447937-745cb720612f?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&w=150&q=80'
    ];
    return {
      value: weight,
      label: weight,
      image: images[idx % images.length]
    };
  });

  const occasionOptionsMapped = occasionOptions.map((occ, idx) => {
    const images = [
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1519225495810-7517c296517a?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=150&q=80'
    ];
    return {
      value: occ,
      label: occ,
      image: images[idx % images.length]
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.deliveryDate) {
      alert('Please fill out all required fields.');
      return;
    }

    const cleanNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || '919345586112';
    const whatsappUrl = getCustomCakeInquiryUrl(formData, cleanNumber);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsSubmitted(true);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-brand-cream-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-3">
            <Cake className="w-3.5 h-3.5 text-brand-gold-850" />
            <span>Artisan Cake Boutique</span>
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-brown-950">
            Custom Cake Inquiry
          </h1>
          <p className="text-sm text-brand-brown-800/60 font-light mt-4">
            Bring your celebrations to life with our customized theme cakes. Design, flavor, and elegance tailored exactly to your dreams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Left Column: Visual instructions */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="glass-card rounded-[2rem] p-8 border border-white space-y-6">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold-700 font-bold block">
                How It Works
              </span>
              <h2 className="font-playfair text-2xl font-bold text-brand-brown-950">
                Crafting Your Custom Celebration
              </h2>
              
              <div className="space-y-6">
                {[
                  { num: '01', title: 'Submit Your Inquiry', desc: 'Fill in the flavor preference, size weight, delivery date, and theme details.' },
                  { num: '02', title: 'Connect on WhatsApp', desc: 'The form redirects you directly to WhatsApp. You can upload any reference sketches or photos directly in our chat window.' },
                  { num: '03', title: 'Get Direct Quote', desc: 'Our head pastry chef reviews your request and coordinates the cake design details, quotation, and payment options.' },
                  { num: '04', title: 'Fresh Bake & Delivery', desc: 'We prepare your custom cake fresh on the delivery date. Pick it up at Mohanur store or coordinate local delivery.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="font-playfair text-xl font-bold text-brand-gold-700/60 shrink-0">
                      {step.num}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-brand-brown-950 leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-brand-brown-800/60 mt-1 leading-normal font-light">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note on Reference Images */}
            <div className="bg-brand-brown-950 text-brand-cream-50 p-6 rounded-2xl flex items-start gap-4">
              <ImageIcon className="w-6 h-6 text-brand-gold-850 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold-850">
                  Sharing Reference Images
                </h4>
                <p className="text-[10px] text-brand-cream-100/70 font-light mt-1.5 leading-relaxed">
                  WhatsApp doesn't support sharing image attachments directly from website forms. Simply send this form inquiry, then attach your reference cake images directly inside the WhatsApp chat screen that opens up!
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[2rem] p-8 border border-brand-cream-100/50 shadow-sm space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-brand-brown-850">
                    Your Name <span className="text-brand-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 focus:outline-none focus:border-brand-gold-500 focus:ring-4 focus:ring-brand-gold-200/50 shadow-xs focus:shadow-md transition-all duration-300"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-brand-brown-850">
                    Mobile Number <span className="text-brand-orange-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 focus:outline-none focus:border-brand-gold-500 focus:ring-4 focus:ring-brand-gold-200/50 shadow-xs focus:shadow-md transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Cake Flavor */}
                <FlowingSelect
                  label="Cake Flavor Preference"
                  value={formData.flavor}
                  onChange={(val) => handleSelectChange('flavor', val)}
                  options={flavorOptionsMapped}
                />

                {/* Cake Weight */}
                <FlowingSelect
                  label="Cake Weight (estimate)"
                  value={formData.weight}
                  onChange={(val) => handleSelectChange('weight', val)}
                  options={weightOptionsMapped}
                />

                {/* Occasion */}
                <FlowingSelect
                  label="Occasion Type"
                  value={formData.occasion}
                  onChange={(val) => handleSelectChange('occasion', val)}
                  options={occasionOptionsMapped}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Delivery Date */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-brand-brown-850 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-gold-850" />
                    <span>Delivery Date <span className="text-brand-orange-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    required
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 focus:outline-none focus:border-brand-gold-500 focus:ring-4 focus:ring-brand-gold-200/50 shadow-xs focus:shadow-md transition-all duration-300"
                  />
                </div>

                {/* Reference Upload Placeholder UI */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-brand-brown-850 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-gold-850" />
                    <span>Reference Image Sketch</span>
                  </label>
                  <div className="border-2 border-dashed border-brand-cream-200 rounded-xl px-4 py-2.5 bg-brand-cream-50/50 flex items-center justify-between">
                    <span className="text-[10px] text-brand-brown-800/40">
                      Share photo inside WhatsApp chat
                    </span>
                    <span className="text-[9px] font-bold text-brand-brown-950 bg-brand-cream-100 px-2 py-1 rounded">
                      NO UPLOAD REQUIRED
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-brand-brown-850 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-brand-gold-850" />
                  <span>Cake Custom Theme & Message Instructions</span>
                </label>
                <textarea
                  name="instructions"
                  required={false}
                  rows={4}
                  placeholder="e.g. Please write 'Happy 50th Birthday Mom', paint base with light pink cream, add white chocolate curls and edible pearls..."
                  value={formData.instructions}
                  onChange={handleChange}
                  className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 placeholder-brand-brown-800/35 focus:outline-none focus:border-brand-gold-500 focus:ring-4 focus:ring-brand-gold-200/50 shadow-xs focus:shadow-md transition-all duration-300 resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-brand-gold-850" />
                  <span>Send Inquiry to WhatsApp</span>
                </button>
              </div>

              {isSubmitted && (
                <p className="text-[10px] text-center text-green-700 bg-green-50 py-2.5 rounded-xl border border-green-200 font-medium">
                  🎉 Inquiry processed! Redirecting to WhatsApp. If the tab did not open, please click the button again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
