import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Cakes } from './pages/Cakes';
import { CustomCake } from './pages/CustomCake';
import { Gallery } from './pages/Gallery';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { SpecialOffer } from './pages/SpecialOffer';
import { AdminApp } from './admin/AdminApp';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { DatabaseProvider } from './context/DatabaseContext';
import ScrollToTop from './components/ScrollToTop';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        setVh();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Intercept Admin system routes
  const isLocationAdmin = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/admin-');

  // Synchronize state-based navbar highlight
  const getPageId = (path: string): string => {
    if (path === '/') return 'home';
    const sub = path.substring(1); // e.g., 'cakes' from '/cakes'
    return sub || 'home';
  };

  const currentPage = getPageId(location.pathname);

  const handleNavClick = (pageId: string) => {
    if (pageId === 'home') navigate('/');
    else navigate(`/${pageId}`);
  };

  if (isLocationAdmin) {
    return <AdminApp />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream-50 select-none">
      {/* Premium Floating Navigation Header */}
      <Navbar currentPage={currentPage} setCurrentPage={handleNavClick} />

      {/* Shopping Cart Side Drawer */}
      <CartDrawer />

      {/* Mobile Floating Cart Action Button */}
      <FloatingCartButton />

      {/* Main Content Area with Route Transition Animations */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1] // Apple-style custom ease-out
            }}
            className="w-full h-full"
          >
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home setCurrentPage={handleNavClick} />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cakes" element={<Cakes />} />
              <Route path="/custom-cake" element={<CustomCake />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/special-offer" element={<SpecialOffer />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Luxury Footer */}
      <Footer setCurrentPage={handleNavClick} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </DatabaseProvider>
  );
};

export default App;

