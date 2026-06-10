import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-md">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-label-sm text-label-sm text-secondary">Checking admin authorization...</p>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    console.warn('Access denied: User is not an administrator. Redirecting...');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
