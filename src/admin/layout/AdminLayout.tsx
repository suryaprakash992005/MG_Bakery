import React, { useState, useEffect } from 'react';
import { useAdminRouter } from '../hooks/useAdminRouter';
import {
  LayoutDashboard,
  Cake,
  ShoppingBag,
  HeartHandshake,
  Image as ImageIcon,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Globe
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPath, navigate } = useAdminRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@mgiyengar.com');

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('admin_auth');
    if (!auth) {
      navigate('/admin-login');
    }
    const user = localStorage.getItem('admin_user');
    if (user) {
      setAdminEmail(user);
    }
  }, [navigate]);

  const navigationItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Cake },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Custom Orders', path: '/admin/custom-orders', icon: HeartHandshake },
    { name: 'Gallery Manager', path: '/admin/gallery-manager', icon: ImageIcon },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_user');
    navigate('/admin-login');
  };

  const currentNav = navigationItems.find(item => item.path === currentPath) || navigationItems[0];

  const mockNotifications = [
    { id: 1, text: 'New custom cake request from Archana Devi', time: '10 mins ago', unread: true },
    { id: 2, text: 'Order ORD-2034 is pending approval', time: '20 mins ago', unread: true },
    { id: 3, text: 'Veg Puff stock running low', time: '2 hours ago', unread: false },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-slate-800 flex overflow-hidden font-poppins">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col bg-[#1A1110] text-[#F3EDE2] border-r border-[#2C1717]/10 select-none transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-[#2C1717]/20 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-gold-850 flex items-center justify-center text-[#1A1110] shrink-0 shadow-inner">
              <Coffee className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-playfair font-bold text-sm tracking-wide text-white">M.G. Iyengar</span>
                <span className="text-[9px] font-semibold text-brand-gold-500 uppercase tracking-wider">Admin Portal</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-6 h-6 rounded-md hover:bg-white/5 items-center justify-center text-[#F3EDE2]/60 hover:text-white transition-colors border border-white/5 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                  isActive 
                    ? 'bg-brand-gold-850 text-[#1A1110] shadow-[0_4px_12px_rgba(212,175,55,0.15)] font-semibold' 
                    : 'text-[#F3EDE2]/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-[#1A1110]' : 'text-[#F3EDE2]/50 group-hover:text-[#D4AF37] transition-colors'
                }`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#2C1717]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout Portal</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#1A1110] text-[#F3EDE2] z-50 flex flex-col transition-transform duration-300 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 border-b border-[#2C1717]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold-850 flex items-center justify-center text-[#1A1110] shadow-inner">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-playfair font-bold text-sm tracking-wide text-white">M.G. Iyengar</span>
              <span className="text-[9px] font-semibold text-brand-gold-500 uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#F3EDE2]/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-brand-gold-850 text-[#1A1110] shadow-[0_4px_12px_rgba(212,175,55,0.15)] font-semibold' 
                    : 'text-[#F3EDE2]/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1A1110]' : 'text-[#F3EDE2]/50'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#2C1717]/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs / Page Title */}
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Admin</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">{currentNav.name}</span>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, products..."
                className="w-64 bg-slate-50 border border-slate-200 focus:border-brand-gold-500 rounded-full py-1.5 pl-9 pr-4 text-xs font-medium focus:outline-none transition-all focus:bg-white"
              />
            </div>

            {/* View Store public button */}
            <a 
              href="/" 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-gold-700 bg-brand-gold-50 hover:bg-brand-gold-100/70 border border-brand-gold-200/50 rounded-full transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Site</span>
            </a>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-orange-500 border border-white" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-xs text-slate-800">Notifications</span>
                      <span className="text-[10px] text-brand-gold-700 bg-brand-gold-50 px-2 py-0.5 rounded-full font-semibold">2 New</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {mockNotifications.map((notif) => (
                        <div key={notif.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.unread ? 'bg-brand-gold-600' : 'bg-transparent'}`} />
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-700 font-medium leading-normal">{notif.text}</span>
                            <span className="text-[10px] text-slate-400 mt-1">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Avatar / Profile section with Online indicator */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-brand-brown-800 text-white font-playfair font-bold text-sm flex items-center justify-center shadow-md">
                  {adminEmail.charAt(0).toUpperCase()}
                </div>
                {/* Active Indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" title="Admin is Online" />
              </div>
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-xs font-semibold text-slate-800">Bakery Admin</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{adminEmail}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Scrollable Main Content Frame */}
        <main className="flex-1 overflow-y-auto bg-[#FAF8F5] p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
