import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useClerk } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext.js';
import { useChat } from '../context/ChatContext.js';
import { SearchBar } from './SearchBar.js';
import { CategoryFilter } from './CategoryFilter.js';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const { hasUnreadMessages } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const handleSearchChange = (query: string) => {
    if (location.pathname !== '/search') {
      if (query.trim()) {
        navigate(`/search?search=${encodeURIComponent(query)}${category ? `&category=${encodeURIComponent(category)}` : ''}`);
      }
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (query) {
          next.set('search', query);
        } else {
          next.delete('search');
        }
        next.set('page', '1');
        return next;
      });
    }
  };

  const handleCategorySelect = (cat: string) => {
    if (location.pathname !== '/search') {
      if (cat) {
        navigate(`/search?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
      }
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (cat) {
          next.set('category', cat);
        } else {
          next.delete('category');
        }
        next.set('page', '1');
        return next;
      });
    }
  };

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
        <div className={`flex w-full px-xs py-[6px] gap-sm ${
          user?.is_admin
            ? 'flex-col justify-start items-stretch h-full gap-lg px-md py-lg'
            : 'items-center md:px-sm lg:px-md md:py-[6px] max-w-container-max mx-auto'
        }`}>
          
          <div className={`flex items-center gap-sm lg:gap-md overflow-x-auto md:overflow-visible scrollbar-none py-[2px] ${
            user?.is_admin ? 'flex-col items-stretch gap-lg w-full overflow-visible' : 'flex-grow'
          }`}>
            {/* Brand / Logo */}
            <Link to={user?.is_admin ? "/admin" : "/"} className="flex items-center gap-xs shrink-0">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-md flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[16px] md:text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              </div>
              <span className="text-body-md md:text-body-lg font-bold text-primary tracking-tight">Fakna</span>
            </Link>

            {/* Global Search Bar (resizing it to be larger/flex-grow next to Fakna logo) */}
            {!user?.is_admin && (location.pathname === '/' || location.pathname === '/search') && (
              <div className="hidden md:flex items-center flex-grow max-w-[1100px] mx-auto px-md">
                <SearchBar initialSearch={search} onSearchChange={handleSearchChange} onSelectCategory={handleCategorySelect} />
              </div>
            )}

            {/* Navigation Links */}
            {user?.is_admin && (
              <nav className="flex flex-col items-stretch gap-sm w-full overflow-visible">
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
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('reviews') ? "'FILL' 1" : "'FILL' 0" }}>chat</span>
                  <span>Comments</span>
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
                <Link 
                  to="/admin?tab=profile_reviews" 
                  className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                    isActiveTab('profile_reviews') 
                      ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                      : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('profile_reviews') ? "'FILL' 1" : "'FILL' 0" }}>rate_review</span>
                  <span>Profile Reviews</span>
                </Link>
                <Link 
                  to="/admin?tab=pages" 
                  className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                    isActiveTab('pages') 
                      ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                      : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('pages') ? "'FILL' 1" : "'FILL' 0" }}>description</span>
                  <span>Pages</span>
                </Link>
                <Link 
                  to="/admin?tab=featured" 
                  className={`transition-all duration-200 px-sm lg:px-md py-xs rounded-md text-body-sm lg:text-body-md font-bold tracking-wider lg:tracking-widest uppercase flex items-center gap-xs md:gap-sm md:px-md md:py-sm md:rounded-lg ${
                    isActiveTab('featured') 
                      ? 'bg-primary-fixed text-primary drop-shadow-sm' 
                      : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActiveTab('featured') ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  <span>Featured</span>
                </Link>
              </nav>
            )}
          </div>

          {/* User Info / Actions — all items flat in one top-right row */}
          <div className={`flex items-center gap-[2px] shrink-0 ml-auto ${
            user?.is_admin
              ? 'flex-col items-stretch w-full mt-auto pt-md border-t border-outline-variant/20'
              : ''
          }`}>

            {user && !user.is_admin ? (
              <>
                {/* Post Ad CTA */}
                <Link 
                  to="/ads/create" 
                  className="hidden sm:flex bg-primary text-on-primary font-label-md text-label-md px-sm py-[5px] rounded-md shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all items-center gap-xs text-[13px] mr-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Post Ad
                </Link>

                {/* Inbox */}
                <Link
                  to="/inbox"
                  className={`relative text-secondary hover:text-primary transition-colors px-[6px] py-[4px] flex items-center rounded-md ${
                    isActive('/inbox') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                  }`}
                  title="Inbox"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive('/inbox') ? "'FILL' 1" : "'FILL' 0" }}>inbox</span>
                  {hasUnreadMessages && (
                    <span className="absolute top-[2px] right-[2px] flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </Link>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="text-secondary hover:text-primary transition-colors px-[6px] py-[4px] flex items-center rounded-md hover:bg-surface-container-low"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>

                {/* Profile Avatar */}
                <Link
                  to={`/profile/${user.id}`}
                  className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all shrink-0"
                  title="View my profile"
                >
                  {user.photo_url ? (
                    <img src={user.photo_url} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-fixed flex items-center justify-center text-primary font-bold uppercase text-[11px]">
                      {user.username?.substring(0, 2)}
                    </div>
                  )}
                </Link>

                {/* Settings */}
                <Link
                  to="/settings"
                  className={`text-secondary hover:text-primary transition-colors px-[6px] py-[4px] flex items-center rounded-md ${
                    isActive('/settings') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                  }`}
                  title="Settings"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </Link>

                {/* About */}
                <Link
                  to="/dashboard"
                  className={`text-secondary hover:text-primary transition-colors px-[6px] py-[4px] flex items-center rounded-md ${
                    isActive('/dashboard') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                  }`}
                  title="About"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "'FILL' 0" }}>info</span>
                </Link>

                {/* Sign Out */}
                <button
                  onClick={() => signOut()}
                  className="text-secondary hover:text-error transition-colors px-[6px] py-[4px] flex items-center rounded-md hover:bg-surface-container-low"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </>
            ) : user?.is_admin ? (
              <>
                {/* Admin: Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="text-secondary hover:text-primary transition-colors w-full px-md py-sm flex items-center gap-sm rounded-lg hover:bg-surface-container-low text-left"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="text-body-sm font-bold">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>

                {/* Admin: Profile row */}
                <div className="flex items-center flex-row justify-start w-full gap-sm mb-xs px-sm">
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

                {/* Admin: Sign Out */}
                <button
                  onClick={() => signOut()}
                  className="text-secondary hover:text-error transition-colors px-md py-sm flex items-center gap-sm rounded-lg w-full text-left hover:bg-surface-container-low"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span className="text-body-sm font-bold">Sign Out</span>
                </button>
              </>
            ) : (
              /* Logged-out state */
              <>
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="text-secondary hover:text-primary transition-colors px-[6px] py-[4px] flex items-center rounded-md hover:bg-surface-container-low"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: theme === 'dark' ? "'FILL' 1" : "'FILL' 0" }}>
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
                </button>

                {/* About */}
                <Link
                  to="/dashboard"
                  className={`text-secondary hover:text-primary transition-colors px-[6px] py-[4px] flex items-center rounded-md ${
                    isActive('/dashboard') ? 'text-primary bg-primary-fixed' : 'hover:bg-surface-container-low'
                  }`}
                  title="About"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "'FILL' 0" }}>info</span>
                </Link>

                {/* Sign In */}
                <Link
                  to="/login"
                  className="bg-primary text-on-primary font-label-md text-label-md px-sm py-[5px] rounded-md shadow-sm btn-primary-inner hover:brightness-110 active:scale-[0.98] transition-all text-center block text-[13px] ml-[4px]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row (Row 2 - Mobile Only, Admin Excluded) */}
        {!user?.is_admin && (location.pathname === '/' || location.pathname === '/search') && (
          <div className="block md:hidden w-full px-md pb-xs bg-surface-container-lowest">
            <SearchBar initialSearch={search} onSearchChange={handleSearchChange} onSelectCategory={handleCategorySelect} />
          </div>
        )}
        {/* Categories Bar Row (Row 2 - Desktop Only, Admin Excluded) */}
        {!user?.is_admin && (location.pathname === '/' || location.pathname === '/search') && (
          <div className="hidden md:block w-full border-t border-outline-variant/10 bg-surface-container-lowest">
            <div className="max-w-container-max mx-auto px-md lg:px-lg py-xs">
              <CategoryFilter selectedCategory={category} onSelectCategory={handleCategorySelect} />
            </div>
          </div>
        )}
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
