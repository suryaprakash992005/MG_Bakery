import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Cake, ShoppingBag, Package, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen } = useAuth();

  const isLocationAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/admin-');

  // Do not show on admin routes
  if (isLocationAdmin) return null;

  const pathname = location.pathname;

  const isHomeActive = pathname === '/';
  const isProductsActive =
    pathname === '/menu' ||
    pathname.startsWith('/product/') ||
    pathname === '/cakes' ||
    pathname === '/custom-cake';
  const isOrdersActive =
    pathname === '/my-orders' ||
    pathname.startsWith('/order-confirmation');
  const isAccountActive = pathname === '/account' || pathname === '/profile';

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#2C1A17]/10 shadow-[0_-4px_24px_rgba(42,14,10,0.08)] select-none"
      style={{
        paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="grid grid-cols-5 items-center h-[56px] px-1 max-w-lg mx-auto">
        {/* 1. Home */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition-colors relative ${
            isHomeActive ? 'text-[#C9A227]' : 'text-[#2A0E0A]/60 hover:text-[#2A0E0A]'
          }`}
          aria-label="Home"
          aria-current={isHomeActive ? 'page' : undefined}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isHomeActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C9A227] rounded-full"
              />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isHomeActive ? 'font-bold' : 'font-medium'}`}>
            Home
          </span>
        </button>

        {/* 2. Products / Menu */}
        <button
          onClick={() => navigate('/menu')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition-colors relative ${
            isProductsActive ? 'text-[#C9A227]' : 'text-[#2A0E0A]/60 hover:text-[#2A0E0A]'
          }`}
          aria-label="Products"
          aria-current={isProductsActive ? 'page' : undefined}
        >
          <div className="relative">
            <Cake className={`w-5 h-5 transition-transform ${isProductsActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isProductsActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C9A227] rounded-full"
              />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isProductsActive ? 'font-bold' : 'font-medium'}`}>
            Products
          </span>
        </button>

        {/* 3. Cart */}
        <button
          id="cart-icon-target-float"
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition-colors relative text-[#2A0E0A]/60 hover:text-[#2A0E0A]"
          aria-label={`Cart with ${totalItemsCount} items`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {totalItemsCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalItemsCount}
                className="absolute -top-1.5 -right-2.5 min-w-4.5 h-4.5 px-1 bg-[#C9A227] text-[#2A0E0A] font-black text-[9px] rounded-full flex items-center justify-center shadow-xs border border-white"
              >
                {totalItemsCount}
              </motion.span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">
            Cart
          </span>
        </button>

        {/* 4. Orders */}
        <button
          onClick={() => navigate('/my-orders')}
          className={`flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition-colors relative ${
            isOrdersActive ? 'text-[#C9A227]' : 'text-[#2A0E0A]/60 hover:text-[#2A0E0A]'
          }`}
          aria-label="My Orders"
          aria-current={isOrdersActive ? 'page' : undefined}
        >
          <div className="relative">
            <Package className={`w-5 h-5 transition-transform ${isOrdersActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isOrdersActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C9A227] rounded-full"
              />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isOrdersActive ? 'font-bold' : 'font-medium'}`}>
            Orders
          </span>
        </button>

        {/* 5. Account */}
        <button
          onClick={() => (user ? navigate('/account') : setIsAuthModalOpen(true))}
          className={`flex flex-col items-center justify-center h-full w-full py-1 cursor-pointer transition-colors relative ${
            isAccountActive ? 'text-[#C9A227]' : 'text-[#2A0E0A]/60 hover:text-[#2A0E0A]'
          }`}
          aria-label="Account"
          aria-current={isAccountActive ? 'page' : undefined}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${isAccountActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isAccountActive && (
              <motion.span
                layoutId="mobileNavDot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C9A227] rounded-full"
              />
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 ${isAccountActive ? 'font-bold' : 'font-medium'}`}>
            Account
          </span>
        </button>
      </div>
    </nav>
  );
};
