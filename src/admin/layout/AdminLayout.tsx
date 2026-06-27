import React, { useState, useEffect } from 'react';
import { useAdminRouter } from '../hooks/useAdminRouter';
import { supabase } from '../../utils/supabase';
import {
  Cake,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Globe,
  Layers,
  LayoutDashboard,
  Users
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
  const [adminEmail, setAdminEmail] = useState('admin@mgiyengar.com');

  useEffect(() => {
    // Retrieve email from Supabase session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email) {
        setAdminEmail(user.email);
      }
    });
  }, []);

  const navigationItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Cake },
    { name: 'Gallery Manager', path: '/admin/gallery-manager', icon: ImageIcon },
    { name: 'Banner Manager', path: '/admin/banner-manager', icon: Layers },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('admin_user');
      navigate('/admin-login');
    }
  };

  const currentNav = navigationItems.find(item => item.path === currentPath) || navigationItems[0];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1A17] flex overflow-hidden font-poppins">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col bg-[#1E110F] text-[#F3EDE2] border-r border-[#2C1A17]/10 select-none transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 border-b border-[#2C1A17]/20 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-gold-850 flex items-center justify-center text-[#1E110F] shrink-0 shadow-inner">
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
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group group cursor-pointer ${
                  isActive 
                    ? 'bg-brand-gold-850 text-[#1E110F] shadow-[0_4px_12px_rgba(212,175,55,0.15)] font-semibold' 
                    : 'text-[#F3EDE2]/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-[#1E110F]' : 'text-[#F3EDE2]/50 group-hover:text-[#D4AF37] transition-colors'
                }`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#2C1A17]/20">
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
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#1E110F] text-[#F3EDE2] z-50 flex flex-col transition-transform duration-300 md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 border-b border-[#2C1A17]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-gold-850 flex items-center justify-center text-[#1E110F] shadow-inner">
              <Coffee className="w-5 h-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-playfair font-bold text-sm tracking-wide text-white">M.G. Iyengar</span>
              <span className="text-[9px] font-semibold text-brand-gold-500 uppercase tracking-wider">Admin Portal</span>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-[#F3EDE2]/60 cursor-pointer border-none bg-transparent"
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
                    ? 'bg-brand-gold-850 text-[#1E110F] shadow-[0_4px_12px_rgba(212,175,55,0.15)] font-semibold' 
                    : 'text-[#F3EDE2]/70 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1E110F]' : 'text-[#F3EDE2]/50'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#2C1A17]/20">
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
        <header className="h-16 bg-[#FAF6F0] border-b border-[#2C1A17]/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl border border-[#2C1A17]/10 flex items-center justify-center text-[#2C1A17] hover:bg-[#1E110F]/5 cursor-pointer bg-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs / Page Title */}
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#2C1A17]/55">
              <span>Admin</span>
              <span className="text-[#2C1A17]/20">/</span>
              <span className="text-[#2C1A17] font-semibold">{currentNav.name}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* View Store public button */}
            <a 
              href="/" 
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-gold-800 bg-[#FAF6F0] hover:bg-brand-gold-50 border border-brand-gold-250/50 rounded-full transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Site</span>
            </a>

            {/* Avatar / Profile section with Online indicator */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#2C1A17]/10">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-brand-brown-800 text-white font-playfair font-bold text-sm flex items-center justify-center shadow-md">
                  {adminEmail.charAt(0).toUpperCase()}
                </div>
                {/* Active Indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" title="Admin is Online" />
              </div>
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-xs font-semibold text-[#2C1A17]">Bakery Owner</span>
                <span className="text-[10px] text-[#2C1A17]/60 truncate max-w-[120px]">{adminEmail}</span>
              </div>
            </div>

          </div>
        </header>

        {/* Scrollable Main Content Frame */}
        <main className="flex-1 overflow-y-auto bg-[#FAF6F0] p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
