import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useClerk } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext.js';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="bg-surface-container-lowest border-b border-outline-variant full-width top-0 sticky z-50 shadow-sm">
        <div className="flex justify-between items-center w-full px-sm py-xs md:px-md lg:px-lg md:py-md max-w-container-max mx-auto">
          
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-xs md:gap-sm">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px] md:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            </div>
            <span className="text-body-lg md:text-headline-md font-bold text-primary tracking-tight">AdHub</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-xs lg:gap-md">
            <Link 
              to="/" 
              className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase ${
                isActive('/') 
                  ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                  : 'text-secondary hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Feed
            </Link>
            {user && (
              <Link 
                to={`/profile/${user.id}`}
                className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase ${
                  location.pathname === `/profile/${user.id}`
                    ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                    : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                My Profile
              </Link>
            )}
            <Link 
              to="/dashboard" 
              className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase ${
                isActive('/dashboard') 
                  ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                  : 'text-secondary hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              About
            </Link>
            {user?.is_admin && (
              <Link 
                to="/admin" 
                className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase ${
                  isActive('/admin') 
                    ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                    : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Info / Actions */}
          <div className="flex items-center gap-xs md:gap-md">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-secondary hover:text-primary transition-colors p-xs flex items-center justify-center rounded-md hover:bg-surface-container-low"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Create Ad Button */}
            <Link 
              to="/ads/create" 
              className="hidden sm:flex bg-primary text-on-primary font-label-md text-label-md px-md py-[8px] rounded-lg shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Post Ad
            </Link>

            {/* User profile avatar — clicks to own profile */}
            <div className="flex items-center gap-sm">
              <Link
                to={user ? `/profile/${user.id}` : '#'}
                className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                title="View my profile"
              >
                {user?.photo_url ? (
                  <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase">
                    {user?.username?.substring(0, 2)}
                  </div>
                )}
              </Link>

              <button
                onClick={() => signOut()}
                className="text-secondary hover:text-error transition-colors p-xs flex items-center justify-center rounded-md hover:bg-surface-container-low"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>

              <Link
                to="/dashboard"
                className={`md:hidden text-secondary hover:text-primary transition-colors p-xs flex items-center justify-center rounded-md ${
                  isActive('/dashboard') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                }`}
                title="About"
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
              </Link>

              <Link
                to="/settings"
                className={`text-secondary hover:text-primary transition-colors p-xs flex items-center justify-center rounded-md ${
                  isActive('/settings') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                }`}
                title="Settings"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Action Button (FAB) */}
      {user && location.pathname !== '/ads/create' && !location.pathname.startsWith('/ads/edit/') && (
        <Link 
          to="/ads/create" 
          className="fixed bottom-6 right-6 z-50 flex sm:hidden w-14 h-14 bg-primary text-on-primary rounded-full items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all elevation-2 animate-bounce-short"
          title="Post Ad"
        >
          <span className="material-symbols-outlined text-[28px]">add</span>
        </Link>
      )}
    </>
  );
};
