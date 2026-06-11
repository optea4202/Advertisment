import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
        <div className="w-12 h-12 rounded-full border-4 border-outline-variant border-t-primary animate-spin"></div>
        <p className="font-body-md text-body-md text-secondary mt-md">Loading your session...</p>
      </div>
    );
  }

  // Redirect to Clerk Login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render a banned banner if user is banned
  if (user?.is_banned) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-md">
        <div className="bg-error-container rounded-2xl p-xl elevation-1 border border-error/20 text-center max-w-md">
          <span className="material-symbols-outlined text-error text-[48px] mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_bad</span>
          <h1 className="font-headline-lg text-headline-lg text-on-error-container mb-sm">Account Banned</h1>
          <p className="font-body-md text-body-md text-on-error-container/80">
            Your account has been suspended by platform administrators. You no longer have access to Fakna.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to profile setup if phone or username are not set up
  // (Assuming phone is empty or null for initial profile sync, meaning setup is required)
  const isProfileIncomplete = !user?.phone;
  const isOnSetupPage = location.pathname === '/setup';

  if (isProfileIncomplete && !isOnSetupPage) {
    console.log('Redirecting to profile setup...');
    return <Navigate to="/setup" replace />;
  }

  // If profile is fully completed and user tries to hit /setup, redirect them to dashboard
  if (!isProfileIncomplete && isOnSetupPage) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
