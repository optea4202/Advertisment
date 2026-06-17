import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { SearchBar } from '../components/SearchBar.js';
import { CategoryFilter } from '../components/CategoryFilter.js';
import { AdCard } from '../components/AdCard.js';
import { useFeed } from '../hooks/useAds.js';
import { useAuth } from '../context/AuthContext.js';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.is_admin) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  const { ads, loading, error, refresh } = useFeed(category, search);

  // Spotlight rotation effect (cycles through top 5 ads every 4 seconds)
  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    setSpotlightIndex(0); // Reset index on feed update
    const interval = setInterval(() => {
      setSpotlightIndex((prevIndex) => (prevIndex + 1) % Math.min(ads.length, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleResetFilters = () => {
    setCategory('');
    setSearch('');
  };

  const spotlightAds = ads ? ads.slice(0, 5) : [];
  const currentSpotlightAd = spotlightAds[spotlightIndex];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg">
        {/* Banner/Header - Premium Hero Showcase */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-moving p-lg md:p-xl flex flex-col gap-lg border border-outline-variant/20 shadow-md bg-grid-pattern">
          {/* Responsive Grid inside Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-center relative z-10">
            {/* Left Side: Copy and Stats */}
            <div className="lg:col-span-7 flex flex-col gap-md">
              <div className="inline-flex items-center gap-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed font-label-sm text-label-sm px-sm py-[4px] rounded-full self-start">
                <span className="material-symbols-outlined text-[16px] animate-pulse">campaign</span>
                <span>Connecting Local Businesses & Customers</span>
              </div>
              
              <h1 className="text-[32px] md:text-[48px] font-bold leading-tight tracking-tight text-on-surface">
                Discover & Promote <span className="text-gradient">Advertisements</span> Instantly
              </h1>
              
              <p className="text-secondary max-w-[540px] text-body-md md:text-body-lg">
                Browse local services, premium products, and verified stores posted by the Fakna community. Build trust and grow your audience.
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-md mt-sm border-t border-outline-variant/15 pt-md">
                <div className="flex flex-col">
                  <span className="text-[20px] md:text-[28px] font-bold text-primary">{ads ? ads.length : 0}+</span>
                  <span className="text-secondary text-label-sm">Active Ads</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] md:text-[28px] font-bold text-tertiary">5+</span>
                  <span className="text-secondary text-label-sm">Categories</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[20px] md:text-[28px] font-bold text-gradient">Fast</span>
                  <span className="text-secondary text-label-sm">Publishing</span>
                </div>
              </div>
            </div>

            {/* Right Side: Interactive Spotlight / Card Preview */}
            <div className="lg:col-span-5 flex justify-center w-full">
              {spotlightAds.length > 0 && currentSpotlightAd ? (
                <Link 
                  to={`/ads/${currentSpotlightAd.id}`}
                  className="cursor-pointer w-full max-w-[360px] glassmorphism rounded-2xl p-md shadow-xl border border-white/20 dark:border-white/10 hover:-translate-y-1 transition-all duration-300 relative flex flex-col gap-sm no-underline text-inherit"
                >
                  {/* Spotlight Image & Fade wrapper */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-xs">
                    <img 
                      key={currentSpotlightAd.id}
                      src={currentSpotlightAd.images?.[0]?.cloudinary_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'} 
                      alt={currentSpotlightAd.title}
                      className="w-full h-full object-cover transition-all duration-500 animate-fade-in" 
                    />
                    <div className="absolute top-sm right-sm bg-tertiary text-on-tertiary font-label-sm text-[11px] px-sm py-[2px] rounded-full uppercase tracking-wider flex items-center gap-[2px] shadow-sm">
                      <span className="material-symbols-outlined text-[12px] animate-spin-slow">star</span>
                      Spotlight
                    </div>
                  </div>
                  
                  {/* Content details with key to re-trigger small entrance animation on change */}
                  <div key={`info-${currentSpotlightAd.id}`} className="flex flex-col gap-xs animate-fade-in">
                    <span className="text-primary font-bold text-label-sm uppercase tracking-wider">{currentSpotlightAd.category}</span>
                    <h3 className="font-semibold text-on-surface truncate text-body-lg">
                      {currentSpotlightAd.title}
                    </h3>
                    <p className="text-secondary text-body-sm line-clamp-1">{currentSpotlightAd.description}</p>
                    
                    <div className="flex justify-between items-center mt-sm pt-xs border-t border-outline-variant/10">
                      <span className="font-bold text-primary text-body-md">₹{currentSpotlightAd.price.toLocaleString()}</span>
                      <span className="text-secondary/70 text-label-sm flex items-center gap-[2px] truncate max-w-[150px]">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {currentSpotlightAd.location}
                      </span>
                    </div>
                  </div>

                  {/* Slider Indicators/Dots */}
                  {spotlightAds.length > 1 && (
                    <div className="flex justify-center gap-xs mt-xs">
                      {spotlightAds.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSpotlightIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            spotlightIndex === idx 
                              ? 'bg-primary w-4' 
                              : 'bg-outline-variant/40 hover:bg-outline-variant'
                          }`}
                          title={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </Link>
              ) : (
                <div className="w-full max-w-[360px] glassmorphism rounded-2xl p-lg text-center flex flex-col items-center justify-center gap-sm min-h-[200px]">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">campaign</span>
                  </div>
                  <h3 className="font-bold text-on-surface text-body-lg">Start Promoting Today</h3>
                  <p className="text-secondary text-body-sm">Post advertisements for your company, store, or service to reach your local community.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Decorative gradient background glows */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-tertiary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>

        {/* Search Bar & Category Bar Rows */}
        <div className="w-full flex flex-col gap-sm">
          <div className="w-full flex gap-md items-center">
            <SearchBar initialSearch={search} onSearchChange={setSearch} />
          </div>

          <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />

          {/* Active Filters Summary */}
          {(category || search) && (
            <div className="flex items-center justify-between bg-surface-container-low/40 px-md py-sm rounded-xl border border-outline-variant/15 mt-xs animate-fade-in-up-sheet">
              <div className="flex items-center gap-sm flex-wrap">
                <span className="font-label-sm text-label-sm text-secondary">Active Filters:</span>
                {category && (
                  <span className="bg-primary/10 text-primary text-[12px] font-semibold px-sm py-[4px] rounded-full flex items-center gap-[4px] border border-primary/20">
                    {category}
                    <button onClick={() => setCategory('')} className="hover:text-error text-[14px] font-bold ml-xs">×</button>
                  </span>
                )}
                {search && (
                  <span className="bg-tertiary/15 text-tertiary text-[12px] font-semibold px-sm py-[4px] rounded-full flex items-center gap-[4px] border border-tertiary/20 max-w-[200px] truncate">
                    "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-error text-[14px] font-bold ml-xs">×</button>
                  </span>
                )}
              </div>
              <button 
                onClick={handleResetFilters}
                className="font-label-sm text-label-sm text-primary hover:underline font-bold"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Layout: Main Full-Width Grid */}
        <div className="flex flex-col gap-lg min-h-[400px] mt-xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
              {ads.map((ad, idx) => (
                <div key={ad.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 75, 450)}ms` }}>
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
