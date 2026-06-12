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
      <header className="bg-surface-container-lowest border-b border-outline-variant full-width top-0 sticky z-50 shadow-sm md:fixed md:left-0 md:top-0 md:h-screen md:w-[240px] md:border-r md:border-b-0 md:shadow-md md:bg-surface-container-high">
        <div className="flex justify-between items-center w-full px-sm py-xs md:px-md lg:px-lg md:py-md max-w-container-max mx-auto gap-md md:flex-col md:justify-start md:items-stretch md:h-full md:gap-lg md:px-md md:py-lg">
          
          <div className="flex items-center gap-md lg:gap-xl overflow-x-auto scrollbar-none py-xs md:flex-col md:items-stretch md:gap-lg md:w-full md:overflow-visible">
            {/* Brand / Logo */}
            <Link to={user?.is_admin ? "/admin" : "/"} className="flex items-center gap-xs md:gap-sm shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px] md:text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              </div>
              <span className="text-body-lg md:text-headline-md font-bold text-primary tracking-tight">Fakna</span>
            </Link>

            {/* Navigation Links */}
            <nav className={`${user?.is_admin ? 'flex' : 'hidden md:flex'} items-center gap-xs lg:gap-md overflow-x-auto scrollbar-none whitespace-nowrap py-xs md:flex-col md:items-stretch md:gap-sm md:w-full md:overflow-visible`}>
              {user?.is_admin ? (
                <>
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
          <div className="flex items-center gap-xs md:gap-md shrink-0 md:flex-col md:items-stretch md:w-full md:mt-auto md:pt-md md:border-t md:border-outline-variant/20">
            {/* Inbox Button */}
            {user && !user.is_admin && (
              <Link
                to="/inbox"
                className={`relative text-secondary hover:text-primary transition-colors px-xs py-xs md:px-md md:py-sm flex items-center gap-xs md:gap-sm rounded-md md:rounded-lg ${
                  isActive('/inbox') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                }`}
                title="Inbox"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive('/inbox') ? "'FILL' 1" : "'FILL' 0" }}>inbox</span>
                <span className="text-body-sm font-bold md:inline hidden">Inbox</span>
                {hasUnreadMessages && (
                  <span className="absolute top-[4px] right-[4px] md:top-[12px] md:right-[16px] flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-secondary hover:text-primary transition-colors px-xs py-xs md:px-md md:py-sm flex items-center gap-xs md:gap-sm rounded-md md:rounded-lg hover:bg-surface-container-low w-full text-left"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="text-body-sm font-bold md:inline hidden">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
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
                className="hidden sm:flex bg-primary text-on-primary font-label-md text-label-md px-md py-[8px] rounded-lg shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all items-center gap-xs md:gap-sm justify-center md:w-full"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="md:inline hidden">Post Ad</span>
              </Link>
            )}

            {/* User Profile / Auth State Actions */}
            {user ? (
              <div className="flex items-center gap-sm md:flex-col md:items-stretch md:w-full md:gap-xs">
                {!user.is_admin ? (
                  <>
                    <div className="flex items-center gap-sm md:flex-col md:gap-xs md:mb-xs">
                      <Link
                        to={`/profile/${user.id}`}
                        className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all md:w-12 md:h-12"
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
                      <span className="text-body-sm font-semibold text-on-surface truncate max-w-[120px] md:block hidden text-center">{user.username}</span>
                    </div>

                    <Link
                      to="/settings"
                      className={`text-secondary hover:text-primary transition-colors px-xs py-xs md:px-md md:py-sm flex items-center gap-xs md:gap-sm rounded-md md:rounded-lg w-full ${
                        isActive('/settings') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                      }`}
                      title="Settings"
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                      <span className="text-body-sm font-bold md:inline hidden">Settings</span>
                    </Link>

                    <button
                      onClick={() => signOut()}
                      className="text-secondary hover:text-error transition-colors px-xs py-xs md:px-md md:py-sm flex items-center gap-xs md:gap-sm rounded-md md:rounded-lg w-full text-left hover:bg-surface-container-low"
                      title="Sign Out"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-body-sm font-bold md:inline hidden">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-sm md:flex-col md:gap-xs md:mb-xs">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden md:w-12 md:h-12" title="Administrator">
                        {user.photo_url ? (
                          <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase">
                            {user.username?.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed px-sm py-[2px] rounded-full text-center md:block hidden truncate font-semibold uppercase tracking-wider">Admin</span>
                    </div>

                    <button
                      onClick={() => signOut()}
                      className="text-secondary hover:text-error transition-colors px-xs py-xs md:px-md md:py-sm flex items-center gap-xs md:gap-sm rounded-md md:rounded-lg w-full text-left hover:bg-surface-container-low"
                      title="Sign Out"
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      <span className="text-body-sm font-bold md:inline hidden">Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-on-primary font-label-md text-label-md px-md py-[8px] rounded-lg shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all text-center block md:w-full"
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
