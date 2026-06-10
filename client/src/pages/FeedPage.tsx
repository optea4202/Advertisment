import React, { useState } from 'react';
import { Navbar } from '../components/Navbar.js';
import { SearchBar } from '../components/SearchBar.js';
import { CategoryFilter } from '../components/CategoryFilter.js';
import { AdCard } from '../components/AdCard.js';
import { useFeed } from '../hooks/useAds.js';

export const FeedPage: React.FC = () => {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const { ads, loading, error, refresh } = useFeed(category, search);

  const handleResetFilters = () => {
    setCategory('');
    setSearch('');
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg">
        {/* Banner/Header */}
        <div className="flex flex-col gap-xs py-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Discover Advertisements
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Browse items and services posted by the AdHub community.
          </p>
        </div>

        {/* Search Bar Row */}
        <div className="w-full flex gap-md items-center">
          <SearchBar initialSearch={search} onSearchChange={setSearch} />
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter items-start mt-xs">
          {/* Sidebar (Category Filter) */}
          <aside className="md:col-span-1 bg-surface-container-lowest md:border md:border-outline-variant/30 rounded-2xl p-md md:p-lg elevation-0 md:elevation-1 flex flex-col gap-md md:sticky md:top-[80px]">
            <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
            
            {/* Active Filters Summary on Desktop */}
            {(category || search) && (
              <div className="hidden md:flex flex-col gap-sm border-t border-outline-variant/10 pt-md mt-sm">
                <div className="flex justify-between items-center">
                  <span className="font-label-sm text-label-sm text-secondary">Active Filters</span>
                  <button 
                    onClick={handleResetFilters}
                    className="font-label-sm text-label-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-xs">
                  {category && (
                    <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold px-sm py-[4px] rounded-full flex items-center gap-[4px]">
                      {category}
                      <button onClick={() => setCategory('')} className="hover:text-error text-[12px] font-bold">×</button>
                    </span>
                  )}
                  {search && (
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-semibold px-sm py-[4px] rounded-full flex items-center gap-[4px] max-w-full truncate">
                      "{search}"
                      <button onClick={() => setSearch('')} className="hover:text-error text-[12px] font-bold">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Grid of Ads */}
          <div className="md:col-span-3 flex flex-col gap-lg min-h-[400px]">
            {error && (
              <div className="p-xl bg-error-container text-on-error-container rounded-2xl border border-error/10 flex flex-col gap-md items-center justify-center text-center">
                <span className="material-symbols-outlined text-[48px] text-error">error</span>
                <div>
                  <h3 className="font-headline-md text-[18px] font-semibold">Failed to load advertisements</h3>
                  <p className="font-body-sm text-body-sm text-on-error-container/85 mt-xs">There was an issue fetching the feed. Please try again.</p>
                </div>
                <button 
                  onClick={refresh}
                  className="bg-error text-on-error font-label-md text-label-md px-lg py-sm rounded-lg hover:brightness-110 transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {!error && loading && (
              <div className="flex-grow flex flex-col items-center justify-center py-[100px] gap-md">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="font-label-sm text-label-sm text-secondary">Loading marketplace feed...</p>
              </div>
            )}

            {!error && !loading && ads.length === 0 && (
              <div className="flex-grow bg-surface-container-lowest border border-outline-variant/30 rounded-2xl elevation-1 py-[80px] px-xl flex flex-col items-center justify-center text-center gap-md">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[32px]">search_off</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-[20px] font-semibold text-on-surface">No Ads Found</h3>
                  <p className="font-body-md text-body-md text-secondary mt-xs max-w-[400px] mx-auto">
                    We couldn't find any advertisements matching your current search or category filters.
                  </p>
                </div>
                {(category || search) && (
                  <button 
                    onClick={handleResetFilters}
                    className="mt-sm bg-primary text-on-primary font-label-md text-label-md px-xl py-md rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}

            {!error && !loading && ads.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
