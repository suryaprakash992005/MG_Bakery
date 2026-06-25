import React, { useState, useEffect } from 'react';
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
import { AdminApp } from './admin/AdminApp';
import { CartProvider } from './context/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Intercept Admin system routes
  const isLocationAdmin = 
    window.location.pathname.startsWith('/admin') || 
    window.location.pathname === '/admin-login';

  // Scroll to top automatically when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentPage]);

  if (isLocationAdmin) {
    return <AdminApp />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'menu':
        return <Menu />;
      case 'cakes':
        return <Cakes />;
      case 'custom-cake':
        return <CustomCake />;
      case 'gallery':
        return <Gallery />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number] // Apple-style custom ease-out
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-brand-cream-50 select-none">
        {/* Premium Floating Navigation Header */}
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {/* Shopping Cart Side Drawer */}
        <CartDrawer />

        {/* Mobile Floating Cart Action Button */}
        <FloatingCartButton />

        {/* Main Content Area with Route Transition Animations */}
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="w-full h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Luxury Footer */}
        <Footer setCurrentPage={setCurrentPage} />
      </div>
    </CartProvider>
  );
};

export default App;

