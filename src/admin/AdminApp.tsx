import React, { useEffect } from 'react';
import { AdminRouterProvider, useAdminRouter } from './hooks/useAdminRouter';
import { AdminStateProvider } from './hooks/useAdminState';
import { Login } from './pages/Login';
import { AdminLayout } from './layout/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { CustomOrders } from './pages/CustomOrders';
import { GalleryManager } from './pages/GalleryManager';
import { Customers } from './pages/Customers';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

const AdminRouteSwitcher: React.FC = () => {
  const { currentPath, navigate } = useAdminRouter();

  useEffect(() => {
    // Redirect /admin or /admin/ to dashboard
    if (currentPath === '/admin' || currentPath === '/admin/') {
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
        case '/admin/products':
          return <Products />;
        case '/admin/orders':
          return <Orders />;
        case '/admin/custom-orders':
          return <CustomOrders />;
        case '/admin/gallery-manager':
          return <GalleryManager />;
        case '/admin/customers':
          return <Customers />;
        case '/admin/analytics':
          return <Analytics />;
        case '/admin/settings':
          return <Settings />;
        default:
          return <Dashboard />;
      }
    };

    return <AdminLayout>{renderAdminPage()}</AdminLayout>;
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
