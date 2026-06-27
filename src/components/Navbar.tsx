import React from 'react';
import { Coffee, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import { WHATSAPP_PHONE_NUMBER } from '../utils/whatsappHelper';
import { StaggeredMenu, StaggeredMenuItem } from './StaggeredMenu';
import { CartIcon } from './CartIcon';
import { useBakeryDatabase } from '../context/DatabaseContext';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { settings } = useBakeryDatabase();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Menu' },
    { id: 'cakes', label: 'Cakes' },
    { id: 'custom-cake', label: 'Custom Cakes' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
  };

  const staggeredItems: StaggeredMenuItem[] = navItems.map((item) => ({
    label: item.label,
    ariaLabel: `Go to ${item.label}`,
    link: `#${item.id}`,
    onClick: () => handleNavClick(item.id)
  }));

  const getBakeryNameParts = () => {
    const name = settings?.bakeryName || 'M.G. Iyengar Bakery & Chats';
    const words = name.split(' ');
    if (words.length > 2) {
      const part1 = words.slice(0, 2).join(' ');
      const part2 = words.slice(2).join(' ');
      return { part1, part2 };
    }
    return { part1: name, part2: '' };
  };
  const { part1, part2 } = getBakeryNameParts();

  const cleanNumber = settings?.whatsappNumber?.replace(/[^0-9]/g, '') || WHATSAPP_PHONE_NUMBER;

  const socialItems = [
    { label: 'WhatsApp', link: `https://wa.me/${cleanNumber}` },
    { label: 'Location Directions', link: settings?.googleMapsLink || 'https://www.google.com/maps/search/?api=1&query=M.G.+Bakery+%26+Chat+Corner%2C+Mohanur%2C+Namakkal%2C+Tamil+Nadu+637015' },
    ...(settings?.instagramUrl ? [{ label: 'Instagram', link: settings.instagramUrl }] : [])
  ];

  return (
    <>
      <nav className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 lg:px-8 ${scrolled ? 'py-2' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto font-poppins">
          <div className={`rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'glass-nav bg-[#FAF7F2]/90 border-brand-cream-200/50 shadow-md py-2.5' : 'glass-nav bg-[#FAF7F2]/75 border-brand-cream-100/30 shadow-lg py-3.5'}`}>
            {/* Logo */}
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-brand-brown-950 flex items-center justify-center text-brand-gold-850 group-hover:scale-105 transition-transform duration-300">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-playfair font-bold text-base sm:text-lg text-brand-brown-950 tracking-wide leading-tight">
                  {part1}
                </span>
                {part2 && (
                  <span className="block text-[10px] sm:text-xs font-medium text-brand-gold-850 tracking-widest uppercase">
                    {part2}
                  </span>
                )}
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full cursor-pointer ${
                      isActive ? 'text-brand-brown-950 font-semibold' : 'text-brand-brown-800/75 hover:text-brand-brown-950 hover:bg-brand-cream-100/30'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-1 left-4 right-4 h-[2px] bg-brand-gold-850 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick WhatsApp Action Button (Desktop) & Shopping Cart */}
            <div className="hidden lg:flex items-center gap-3">
              <CartIcon />
              <a
                href={`https://wa.me/${cleanNumber}?text=${encodeURIComponent('Hello M.G. Iyengar Bakery, I would like to explore your menu and place an order.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-brown-950 hover:bg-brand-brown-900 text-brand-cream-50 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-brand-brown-950/20 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-brand-gold-850" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Staggered Menu Component for Mobile Responsive view */}
      <StaggeredMenu
        position="right"
        items={staggeredItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        isFixed={true}
        changeMenuColorOnOpen={true}
        colors={['#F3EDE2', '#BEA66B', '#2A0E0A']}
        accentColor="#C9A227"
      />
    </>
  );
};

