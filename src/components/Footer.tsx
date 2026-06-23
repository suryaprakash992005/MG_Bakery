import React from 'react';
import { Coffee, MapPin, Phone, MessageSquare, Clock, Heart } from 'lucide-react';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  const currentYear = new Date().getFullYear();

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-brown-950 text-brand-cream-50 pt-16 pb-8 border-t border-brand-brown-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-brand-cream-50 flex items-center justify-center text-brand-brown-950">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-playfair font-bold text-lg tracking-wide leading-none">
                  M.G. Iyengar
                </span>
                <span className="block text-[10px] font-medium text-brand-gold-500 tracking-wider uppercase">
                  Bakery & Chats
                </span>
              </div>
            </div>
            <p className="text-sm text-brand-cream-100/70 font-light leading-relaxed">
              Serving freshly baked happiness, artisan cakes, melt-in-mouth cookies, hot spicy puffs, and traditional chat specialties since years in Mohanur.
            </p>
            <p className="text-xs text-brand-gold-500 italic">
              "Tradition, Taste, and Freshness in Every Bite"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair text-lg font-semibold text-brand-gold-500 mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-[1px] after:bg-brand-gold-500/50">
              Quick Menu
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { id: 'home', label: 'Home Page' },
                { id: 'menu', label: 'Explore Menu' },
                { id: 'cakes', label: 'Celebration Cakes' },
                { id: 'custom-cake', label: 'Order Custom Cake' },
                { id: 'gallery', label: 'Bakery Gallery' },
                { id: 'about', label: 'Our Story' },
                { id: 'contact', label: 'Get in Touch' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className="text-brand-cream-100/60 hover:text-brand-gold-500 transition-colors duration-300 font-light"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-playfair text-lg font-semibold text-brand-gold-500 mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-[1px] after:bg-brand-gold-500/50">
              Contact Info
            </h3>
            <ul className="space-y-4 text-sm font-light text-brand-cream-100/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold-500 shrink-0 mt-0.5" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=M.G.+Bakery+%26+Chat+Corner%2C+Mohanur%2C+Namakkal%2C+Tamil+Nadu+637015"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-gold-500 transition-colors duration-300"
                >
                  M.G. Iyengar Bakery & Chat Corner,<br />
                  Mohanur Main Road, Mohanur,<br />
                  Namakkal, Tamil Nadu - 637015
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-gold-500 shrink-0" />
                <a href="tel:+919047913344" className="hover:text-brand-gold-500 transition-colors">
                  +91 90479 13344
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-brand-gold-500 shrink-0" />
                <a 
                  href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-brand-gold-500 transition-colors"
                >
                  WhatsApp Ordering Chat
                </a>
              </li>
            </ul>
          </div>

          {/* Store Hours */}
          <div>
            <h3 className="font-playfair text-lg font-semibold text-brand-gold-500 mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-[1px] after:bg-brand-gold-500/50">
              Baking Hours
            </h3>
            <ul className="space-y-4 text-sm font-light text-brand-cream-100/70">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-gold-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-brand-cream-50">Monday - Sunday</p>
                  <p className="text-xs text-brand-cream-100/50 mt-1">9:00 AM - 10:00 PM</p>
                  <p className="text-xs text-brand-gold-500 mt-2">Fresh batches out at 11:00 AM & 4:30 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-brown-900 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-brand-cream-100/40">
          <p>© {currentYear} M.G. Iyengar Bakery & Chat Corner. All Rights Reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-brand-orange-500 fill-brand-orange-500" />
            <span>for Mohanur, Namakkal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
