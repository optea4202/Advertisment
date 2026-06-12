import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useClerk } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext.js';
import { useChat } from '../context/ChatContext.js';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const { hasUnreadMessages } = useChat();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isActiveTab = (tabName: string) => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab') || 'ads';
    return location.pathname === '/admin' && currentTab === tabName;
  };

  React.useEffect(() => {
    if (user?.is_admin) {
      document.body.classList.add('admin-sidebar-layout');
    } else {
      document.body.classList.remove('admin-sidebar-layout');
    }
    return () => {
      document.body.classList.remove('admin-sidebar-layout');
    };
  }, [user?.is_admin]);

  return (
    <>
      <header className={`bg-surface-container-lowest border-b border-outline-variant top-0 z-50 shadow-sm ${
          user?.is_admin
            ? 'fixed left-0 h-screen w-[240px] border-r border-b-0 shadow-md bg-surface-container-high'
            : 'sticky w-full'
        }`}>
        <div className={`flex w-full px-sm py-xs gap-md ${
          user?.is_admin
            ? 'flex-col justify-start items-stretch h-full gap-lg px-md py-lg'
            : 'justify-between items-center md:px-md lg:px-lg md:py-md max-w-container-max mx-auto'
        }`}>
          
          <div className={`flex items-center gap-md lg:gap-xl overflow-x-auto scrollbar-none py-xs ${
            user?.is_admin ? 'flex-col items-stretch gap-lg w-full overflow-visible' : ''
          }`}>
            {/* Brand / Logo */}
            <Link to={user?.is_admin ? "/admin" : "/"} className="flex items-center gap-xs md:gap-sm shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px] md:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              </div>
              <span className="text-body-lg md:text-headline-md font-bold text-primary tracking-tight">Fakna</span>
            </Link>

            {/* Navigation Links */}
            <nav className={`${
              user?.is_admin ? 'flex flex-col items-stretch gap-sm w-full overflow-visible' : 'hidden md:flex items-center gap-xs lg:gap-md overflow-x-auto scrollbar-none whitespace-nowrap py-xs'
            }`}>
              {user?.is_admin ? (
                <>
                  <Link 
                    to="/admin/home" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActive('/admin/home') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/admin/home') ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                    <span>Home</span>
                  </Link>
                  <Link 
                    to="/admin?tab=ads" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActiveTab('ads') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('ads') ? "'FILL' 1" : "'FILL' 0" }}>campaign</span>
                    <span>Ads</span>
                  </Link>
                  <Link 
                    to="/admin?tab=reviews" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActiveTab('reviews') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('reviews') ? "'FILL' 1" : "'FILL' 0" }}>rate_review</span>
                    <span>Reviews</span>
                  </Link>
                  <Link 
                    to="/admin?tab=users" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActiveTab('users') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('users') ? "'FILL' 1" : "'FILL' 0" }}>group</span>
                    <span>Users</span>
                  </Link>
                  <Link 
                    to="/admin?tab=reports" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActiveTab('reports') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('reports') ? "'FILL' 1" : "'FILL' 0" }}>flag</span>
                    <span>Reports</span>
                  </Link>
                  <Link 
                    to="/admin?tab=categories" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActiveTab('categories') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('categories') ? "'FILL' 1" : "'FILL' 0" }}>category</span>
                    <span>Categories</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActive('/') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/') ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                    <span>Home</span>
                  </Link>
                  {user && (
                    <Link 
                      to={`/profile/${user.id}`}
                      className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                        location.pathname === `/profile/${user.id}`
                          ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                          : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: location.pathname === `/profile/${user.id}` ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                      <span>My Profile</span>
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                      isActive('/dashboard') 
                        ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "'FILL' 0" }}>info</span>
                    <span>About</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User Info / Actions */}
          <div className={`flex items-center gap-xs shrink-0 ${
            user?.is_admin
              ? 'flex-col items-stretch w-full mt-auto pt-md border-t border-outline-variant/20'
              : 'md:gap-md'
          }`}>
            {/* Inbox Button */}
            {user && !user.is_admin && (
              <Link
                to="/inbox"
                className={`relative text-secondary hover:text-primary transition-colors px-xs py-xs flex items-center gap-xs rounded-md ${
                  isActive('/inbox') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                }`}
                title="Inbox"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/inbox') ? "'FILL' 1" : "'FILL' 0" }}>inbox</span>
                {hasUnreadMessages && (
                  <span className="absolute top-[4px] right-[4px] flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`text-secondary hover:text-primary transition-colors px-xs py-xs flex items-center gap-xs rounded-md hover:bg-surface-container-low text-left ${
                user?.is_admin ? 'w-full px-md py-sm gap-sm rounded-lg' : ''
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              {user?.is_admin && (
                <span className="text-body-sm font-bold">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>

            {/* Mobile About Button */}
            {!user?.is_admin && (
              <Link
                to="/dashboard"
                className={`md:hidden text-secondary hover:text-primary transition-colors p-xs flex items-center justify-center rounded-md ${
                  isActive('/dashboard') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                }`}
                title="About"
              >
                <span className="material-symbols-outlined text-[20px]">info</span>
              </Link>
            )}

            {/* Create Ad Button */}
            {user && !user.is_admin && (
              <Link 
                to="/ads/create" 
                className="hidden sm:flex bg-primary text-on-primary font-label-md text-label-md px-md py-[8px] rounded-lg shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Post Ad
              </Link>
            )}

            {/* User Profile / Auth State Actions */}
            {user ? (
              <div className={`flex items-center gap-sm ${
                user?.is_admin ? 'flex-col items-stretch w-full gap-xs' : ''
              }`}>
                {!user.is_admin ? (
                  <>
                    <div className="flex items-center gap-sm">
                      <Link
                        to={`/profile/${user.id}`}
                        className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all"
                        title="View my profile"
                      >
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase">
                            {user.username?.substring(0, 2)}
                          </div>
                        )}
                      </Link>
                    </div>

                    <Link
                      to="/settings"
                      className={`text-secondary hover:text-primary transition-colors px-xs py-xs flex items-center gap-xs rounded-md ${
                        isActive('/settings') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                      }`}
                      title="Settings"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="text-secondary hover:text-error transition-colors px-xs py-xs flex items-center gap-xs rounded-md hover:bg-surface-container-low"
                      title="Sign Out"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-sm flex-row items-center justify-start w-full gap-sm mb-xs px-sm">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden shrink-0" title="Administrator">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase">
                            {user.username?.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-body-sm font-bold text-on-surface truncate block">{user.username}</span>
                        <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed px-sm py-[1px] rounded-full font-bold uppercase tracking-wider mt-[2px] inline-block">Admin</span>
                      </div>
                    </div>

                    <button
                      onClick={() => signOut()}
                      className="text-secondary hover:text-error transition-colors px-md py-sm flex items-center gap-sm rounded-lg w-full text-left hover:bg-surface-container-low"
                      title="Sign Out"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-body-sm font-bold">Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-on-primary font-label-md text-label-md px-md py-[8px] rounded-lg shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all text-center block"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Floating Action Buttons (FABs) */}
      {user && !user.is_admin && location.pathname !== '/ads/create' && !location.pathname.startsWith('/ads/edit/') && location.pathname !== '/inbox' && (
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
