import React, { Suspense, lazy } from 'react';
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
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { AdminApp } from './admin/AdminApp';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { CartDrawer } from './components/CartDrawer';
import { FloatingCartButton } from './components/FloatingCartButton';
import { AuthModal } from './components/AuthModal';
import { DatabaseProvider } from './context/DatabaseContext';
import ScrollToTop from './components/ScrollToTop';

// Lazy-loaded routes for optimal performance
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const MyOrders = lazy(() => import('./pages/MyOrders').then(m => ({ default: m.MyOrders })));
const Account = lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));

// ─── Page Loading Skeleton ────────────────────────────────────────────────────
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-[#C9A227] border-t-transparent"
      />
      <p className="text-xs text-[#2A0E0A]/50 font-semibold">Loading…</p>
    </div>
  </div>
);

// ─── App Content ─────────────────────────────────────────────────────────────

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

  const isLocationAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/admin-');

  const getPageId = (path: string): string => {
    if (path === '/') return 'home';
    const sub = path.substring(1);
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
    <div className="flex flex-col min-h-screen bg-brand-cream-50">
      {/* Navbar */}
      <Navbar currentPage={currentPage} setCurrentPage={handleNavClick} />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <FloatingCartButton />

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full h-full"
          >
            <Suspense fallback={<PageLoader />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home setCurrentPage={handleNavClick} />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cakes" element={<Cakes />} />
                <Route path="/custom-cake" element={<CustomCake />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/special-offer" element={<SpecialOffer />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

                {/* ── UPGRADED E-COMMERCE ROUTES ── */}
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/orders" element={<Navigate to="/my-orders" replace />} />
                <Route path="/track" element={<MyOrders />} />
                <Route path="/track/:orderId" element={<MyOrders />} />
                <Route path="/account" element={<Account />} />
                <Route path="/profile" element={<Navigate to="/account" replace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer setCurrentPage={handleNavClick} />
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ScrollToTop />
              <AppContent />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </DatabaseProvider>
  );
};

export default App;
