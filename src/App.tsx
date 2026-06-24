import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Menu = React.lazy(() => import('./pages/Menu').then(m => ({ default: m.Menu })));
const Cakes = React.lazy(() => import('./pages/Cakes').then(m => ({ default: m.Cakes })));
const CustomCake = React.lazy(() => import('./pages/CustomCake').then(m => ({ default: m.CustomCake })));
const Gallery = React.lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const AdminApp = React.lazy(() => import('./admin/AdminApp').then(m => ({ default: m.AdminApp })));
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
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-brand-cream-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-gold-850 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AdminApp />
      </React.Suspense>
    );
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
              <React.Suspense fallback={
                <div className="min-h-[60vh] bg-brand-cream-50/10 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-brand-gold-850 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }>
                {renderPage()}
              </React.Suspense>
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

