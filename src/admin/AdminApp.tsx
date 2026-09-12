import React, { useEffect } from 'react';
import { AdminRouterProvider, useAdminRouter } from './hooks/useAdminRouter';
import { AdminStateProvider } from './hooks/useAdminState';
import { Login } from './pages/Login';
import { AdminLayout } from './layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { GalleryManager } from './pages/GalleryManager';
import { VideoManager } from './pages/VideoManager';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';

const AdminRouteSwitcher: React.FC = () => {
  const { currentPath, navigate } = useAdminRouter();

  useEffect(() => {
    // Redirect /admin or /admin/ to dashboard
    if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin-dashboard') {
      navigate('/admin/dashboard');
    }
  }, [currentPath, navigate]);

  if (currentPath === '/admin-login') {
    return <Login />;
  }

  if (currentPath.startsWith('/admin')) {
    const renderAdminPage = () => {
      switch (currentPath) {
        case '/admin/dashboard':
          return <Dashboard />;
        case '/admin/orders':
        case '/admin-orders':
          return <Orders />;
        case '/admin/products':
        case '/admin-products':
          return <Products />;
        case '/admin/gallery-manager':
        case '/admin-gallery':
        case '/admin-gallery-manager':
          return <GalleryManager />;
        case '/admin/video-manager':
        case '/admin/banner-manager':
        case '/admin-banner':
        case '/admin-banner-manager':
          return <VideoManager />;
        case '/admin/settings':
        case '/admin-settings':
          return <Settings />;
        case '/admin/customers':
          return <Customers />;
        default:
          return <Orders />;
      }
    };

    return (
      <ProtectedRoute>
        <AdminLayout>{renderAdminPage()}</AdminLayout>
      </ProtectedRoute>
    );
  }

  return null;
};

export const AdminApp: React.FC = () => {
  return (
    <AdminRouterProvider>
      <AdminStateProvider>
        <AdminRouteSwitcher />
      </AdminStateProvider>
    </AdminRouterProvider>
  );
};
