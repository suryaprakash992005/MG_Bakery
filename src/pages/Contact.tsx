import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { getGeneralInquiryUrl, WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import { useBakeryDatabase } from '../context/DatabaseContext';

export const Contact: React.FC = () => {
  const { settings } = useBakeryDatabase();
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: '',
    message: ''
  });

  const [isSent, setIsSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert('Please fill out the name and message fields.');
      return;
    }

    const messageText = `Contact/Inquiry from Website:

Name: ${formData.name}
Mobile/Email: ${formData.contactInfo || 'Not provided'}
Message: ${formData.message}`;

    const cleanNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER;
    const whatsappUrl = getGeneralInquiryUrl(formData.name, messageText, cleanNumber);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsSent(true);
  };

  const cleanNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER;

  const contactCards = [
    { title: 'Call Us Direct', desc: 'Call us for urgent orders and quick pickups.', val: settings?.whatsappNumber || '+91 93455 86112', icon: Phone, href: `tel:${cleanNumber}` },
    { title: 'WhatsApp Ordering', desc: 'Message us to order cakes, pastries, or snacks.', val: settings?.whatsappNumber || '+91 93455 86112', icon: MessageSquare, href: `https://wa.me/${cleanNumber}` },
    { title: 'Bakery Store Location', desc: settings?.storeAddress || 'Mohanur Main Road, Mohanur, Namakkal, TN - 637015', val: 'Get Directions', icon: MapPin, href: settings?.googleMapsLink || 'https://maps.app.goo.gl/9SK6E3HLb6HzEQFz5?g_st=ac' },
    { title: 'Daily Hours', desc: 'We are open 7 days a week including holidays.', val: `${settings?.openingTime || '9:00 AM'} - ${settings?.closingTime || '10:00 PM'}`, icon: Clock }
  ];

  return (
    <div className="pt-28 pb-20 bg-brand-cream-50/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-brand-cream-100 px-3 py-1 rounded-full text-xs font-semibold text-brand-gold-700 uppercase tracking-widest mb-3">
            <Mail className="w-3.5 h-3.5 text-brand-gold-850" />
            <span>Connect with Us</span>
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-brown-950">
            Get in Touch
          </h1>
          <p className="text-sm text-brand-brown-800/60 font-light mt-4">
            Have questions about party orders, custom cakes, or daily specials? Message us on WhatsApp or call our store in Mohanur.
          </p>
        </div>

        {/* Mobile Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 lg:hidden">
          <a
            href={`tel:${cleanNumber}`}
            className="flex items-center justify-center gap-3 bg-brand-brown-950 text-brand-cream-50 hover:bg-brand-brown-900 px-6 py-4 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <Phone className="w-5 h-5 text-brand-gold-850" />
            <span>Call Store Direct</span>
          </a>
          <a
            href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hello M.G. Iyengar Bakery, I would like to inquire about your menu.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-green-700 text-white hover:bg-green-800 px-6 py-4 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-white" />
            <span>Order on WhatsApp</span>
          </a>
          <a
            href={settings?.googleMapsLink || "https://maps.app.goo.gl/9SK6E3HLb6HzEQFz5?g_st=ac"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-brand-cream-100 text-brand-brown-950 hover:bg-brand-cream-200 border border-brand-cream-200 px-6 py-4 rounded-2xl font-semibold shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-brand-gold-850" />
            <span>Get Store Directions</span>
          </a>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactCards.map((card, idx) => {
            const Icon = card.icon;
            const isLink = !!card.href;
            const CardElement = isLink ? 'a' : 'div';
            return (
              <CardElement
                key={idx}
                href={card.href}
                target={isLink && card.href?.startsWith('http') ? '_blank' : undefined}
                rel={isLink && card.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`bg-white rounded-3xl p-6 border border-brand-cream-100/50 shadow-sm flex flex-col items-center text-center justify-between min-h-[220px] transition-all duration-300 ${
                  isLink ? 'hover:shadow-md hover:border-brand-cream-200 cursor-pointer' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-cream-50 text-brand-brown-950 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-gold-850" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-brown-950 mb-1">{card.title}</h3>
                  <p className="text-[11px] text-brand-brown-800/60 font-light leading-relaxed px-2">
                    {card.desc}
                  </p>
                </div>
                <span className={`text-xs font-semibold mt-4 block ${isLink ? 'text-brand-gold-700 underline' : 'text-brand-brown-950'}`}>
                  {card.val}
                </span>
              </CardElement>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Left: Map Embed */}
          <div className="lg:col-span-5 h-96 lg:h-[450px] rounded-3xl overflow-hidden border border-brand-cream-100/60 shadow-sm relative group bg-brand-cream-100">
            <iframe
              title="M.G. Iyengar Bakery Mohanur Map Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.147133729864!2d78.07172081533221!3d11.02762299215112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzM5LjQiTiA3OMKwMDQnMjYuMCJF!5e0!3m2!1sen!2sin!4v1655829281355!5m2!1sen!2sin"
              className="w-full h-full border-none grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              allowFullScreen
              loading="lazy"
            ></iframe>
            <div className="absolute top-4 left-4 bg-brand-brown-950 text-brand-cream-50 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md">
              📍 Mohanur Main Road
            </div>
          </div>

          {/* Right: Quick Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-brand-cream-100/50 shadow-sm space-y-6"
            >
              <h2 className="font-playfair text-xl sm:text-2xl font-bold text-brand-brown-950 pb-4 border-b border-brand-cream-50">
                Send a Quick Message
              </h2>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-brand-brown-850">
                  Full Name <span className="text-brand-orange-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                />
              </div>

              {/* Mobile/Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-brand-brown-850">
                  Contact Number / Email
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  placeholder="e.g. +91 98765 43210 or name@example.com"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-brand-brown-850">
                  Your Message / Question <span className="text-brand-orange-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Write your question, party catering inquiry, or feedback here..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-brand-cream-50 border border-brand-cream-100 rounded-xl px-4 py-3 text-xs text-brand-brown-950 placeholder-brand-brown-800/35 focus:outline-none focus:ring-2 focus:ring-brand-gold-500/20 resize-none leading-relaxed"
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="btn-primary w-full py-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-brand-gold-850" />
                  <span>Send Message to WhatsApp</span>
                </button>
              </div>

              {isSent && (
                <p className="text-[10px] text-center text-green-700 bg-green-50 py-2.5 rounded-xl border border-green-200 font-medium">
                  🎉 Message ready! Redirecting to WhatsApp to send. If the tab did not open, click the button again.
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
