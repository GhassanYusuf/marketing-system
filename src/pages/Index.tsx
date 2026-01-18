import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import TenantDashboard from '@/components/TenantDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import PropertyManagerDashboard from '@/components/PropertyManagerDashboard';
import Header from '@/components/Header';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'tenant':
        return <TenantDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'property_manager':
        return <PropertyManagerDashboard />;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Index;
