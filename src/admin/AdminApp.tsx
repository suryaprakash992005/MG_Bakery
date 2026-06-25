import React, { useEffect } from 'react';
import { AdminRouterProvider, useAdminRouter } from './hooks/useAdminRouter';
import { AdminStateProvider } from './hooks/useAdminState';
import { Login } from './pages/Login';
import { AdminLayout } from './layout/AdminLayout';
import { Products } from './pages/Products';
import { GalleryManager } from './pages/GalleryManager';
import { BannerManager } from './pages/BannerManager';
import { Settings } from './pages/Settings';
import { DatabaseProvider } from '../context/DatabaseContext';

const AdminRouteSwitcher: React.FC = () => {
  const { currentPath, navigate } = useAdminRouter();

  useEffect(() => {
    // Redirect /admin or /admin/ to products
    if (currentPath === '/admin' || currentPath === '/admin/') {
      navigate('/admin/products');
    }
  }, [currentPath, navigate]);

  if (currentPath === '/admin-login') {
    return <Login />;
  }

  if (currentPath.startsWith('/admin')) {
    const renderAdminPage = () => {
      switch (currentPath) {
        case '/admin/products':
          return <Products />;
        case '/admin/gallery-manager':
          return <GalleryManager />;
        case '/admin/banner-manager':
          return <BannerManager />;
        case '/admin/settings':
          return <Settings />;
        default:
          return <Products />;
      }
    };

    return <AdminLayout>{renderAdminPage()}</AdminLayout>;
  }

  return null;
};

export const AdminApp: React.FC = () => {
  return (
    <DatabaseProvider>
      <AdminRouterProvider>
        <AdminStateProvider>
          <AdminRouteSwitcher />
        </AdminStateProvider>
      </AdminRouterProvider>
    </DatabaseProvider>
  );
};
