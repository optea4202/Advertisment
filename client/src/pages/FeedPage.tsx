import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { CategoryFilter } from '../components/CategoryFilter.js';
import { AdCard } from '../components/AdCard.js';
import { useFeed } from '../hooks/useAds.js';
import { useAuth } from '../context/AuthContext.js';
import { getPageBySlug, type PageContent } from '../api/pages.js';

export const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<PageContent | null>(null);
  const [featuredTick, setFeaturedTick] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  // Detect mobile viewport size changes (< 640px)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset tick when pageData loads
  useEffect(() => {
    setFeaturedTick(0);
  }, [pageData?.featured_ads]);

  // Featured ads rotation effect (simply increments tick every 4 seconds)
  useEffect(() => {
    if (!pageData?.featured_ads || pageData.featured_ads.length <= 1) return;
    const interval = setInterval(() => {
      setFeaturedTick((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [pageData?.featured_ads]);

  const { visibleFeaturedAds, featuredIndex } = useMemo(() => {
    if (!pageData?.featured_ads || pageData.featured_ads.length === 0) {
      return { visibleFeaturedAds: [], featuredIndex: 0 };
    }
    const pool = pageData.featured_ads;
    const groupSize = isMobile ? 2 : 5;
    
    if (pool.length <= groupSize) {
      return {
        visibleFeaturedAds: pool,
        featuredIndex: featuredTick % pool.length
      };
    }
    
    const featuredIndex = featuredTick % groupSize;
    const pageNumber = Math.floor(featuredTick / groupSize);
    const groupOffset = (pageNumber * groupSize) % pool.length;
    
    const visible = [];
    for (let i = 0; i < groupSize; i++) {
      const idx = (groupOffset + i) % pool.length;
      visible.push(pool[idx]);
    }
    
    return { visibleFeaturedAds: visible, featuredIndex };
  }, [pageData?.featured_ads, featuredTick, isMobile]);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const data = await getPageBySlug('home');
        setPageData(data);
      } catch (err) {
        console.error('Failed to fetch home page copy from database, using fallback:', err);
      }
    };
    fetchPageContent();
  }, []);

  useEffect(() => {
    if (user?.is_admin) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const banners = pageData?.banner_images || [];

  // Reset index when banners change
  useEffect(() => {
    setCurrentBannerIndex(0);
  }, [banners.length]);

  // Redirect to search page if search or category parameters exist
  useEffect(() => {
    if (category || search) {
      navigate(`/search?${searchParams.toString()}`, { replace: true });
    }
  }, [category, search, searchParams, navigate]);

  const { ads, totalPages, loading, error, refresh } = useFeed('', '', page);

  const setCategory = (cat: string) => {
    if (cat) {
      navigate(`/search?category=${encodeURIComponent(cat)}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
    }
  };

  const setPage = (p: number | ((prev: number) => number)) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const newPage = typeof p === 'function' ? p(page) : p;
      next.set('page', newPage.toString());
      return next;
    });
  };

  // Banner rotation effect (5 seconds)
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const getPageNumbers = () => {
    const range = [];
    const delta = 2; // Number of pages to show before and after current page
    const left = page - delta;
    const right = page + delta + 1;
    const rangeWithDots: (number | string)[] = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // Spotlight ad state removed for banner carousel

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg">
        {/* Mobile Category Bar Row (Mobile Only) */}
        <div className="flex flex-col gap-sm md:hidden">
          <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
        </div>

        {/* Banner/Header - Premium Hero Showcase (page 1 only) */}
        {page === 1 && (
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant/20 shadow-md w-full h-[140px] sm:h-[200px] md:h-[260px] bg-gradient-moving select-none">
            {banners.length > 0 ? (
              <>
                {banners.map((url, idx) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Banner ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  />
                ))}
                
                {/* Navigation Arrows */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                      className="absolute left-sm top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-[6px] transition z-20 flex items-center justify-center border-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                    </button>
                    <button
                      onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                      className="absolute right-sm top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-[6px] transition z-20 flex items-center justify-center border-none"
                    >
                      <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                    </button>

                    {/* Navigation Dots */}
                    <div className="absolute bottom-sm left-1/2 -translate-x-1/2 flex gap-xs z-20">
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentBannerIndex(idx)}
                          className={`w-[8px] h-[8px] rounded-full transition-all border-none ${
                            idx === currentBannerIndex ? 'bg-primary w-[16px]' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              // Fallback nice look if no banners are added
              <div className="w-full h-full flex flex-col justify-center px-lg md:px-xl relative z-10 text-on-surface bg-grid-pattern">
                <div className="inline-flex items-center gap-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed font-label-sm text-label-sm px-sm py-[4px] rounded-full self-start mb-xs">
                  <span className="material-symbols-outlined text-[16px] animate-pulse">campaign</span>
                  <span>Connecting Local Businesses & Customers</span>
                </div>
                <h1 className="text-[20px] sm:text-[28px] md:text-[36px] font-bold leading-tight tracking-tight text-on-surface">
                  {pageData ? pageData.title : 'Discover & Promote Advertisements Instantly'}
                </h1>
                <p className="text-secondary text-body-sm md:text-body-md max-w-[600px] mt-xs">
                  {pageData ? pageData.content : 'Browse local services, premium products, and verified stores posted by the Fakna community.'}
                </p>
              </div>
            )}
          </div>
        )}

        {page === 1 && visibleFeaturedAds && visibleFeaturedAds.length > 0 && (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-md shadow-sm relative overflow-hidden flex flex-col gap-sm">
            <div className="flex items-center gap-xs text-[12px] font-bold text-primary uppercase tracking-wider pl-xs">
              <span className="material-symbols-outlined text-[16px] animate-pulse">star</span>
              <span>Featured Listings</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-sm sm:gap-md">
              {visibleFeaturedAds.map((ad, idx) => {
                const isActive = idx === featuredIndex;
                const thumb = ad.images?.[0]?.cloudinary_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';
                return (
                  <Link
                    key={ad.id}
                    to={`/ads/${ad.id}`}
                    className={`animate-fade-in flex flex-col gap-xs rounded-xl p-sm sm:p-[6px] border transition-all duration-300 relative no-underline text-inherit cursor-pointer ${
                      isActive 
                        ? 'bg-surface-container-lowest border-primary shadow-lg scale-[1.03] ring-2 ring-primary/10' 
                        : 'bg-surface-container-lowest/50 border-outline-variant/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-container">
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                      {isActive && <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />}
                      
                      {/* Featured Marker Overlay */}
                      <div className="absolute bottom-xs left-xs bg-tertiary text-on-tertiary font-label-sm text-[10px] sm:text-[9px] px-xs py-[2px] sm:py-[1px] rounded-full uppercase tracking-wider flex items-center gap-[2px] shadow-sm z-10 animate-pulse">
                        <span className="material-symbols-outlined text-[11px] sm:text-[10px]">star</span>
                        Featured
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 px-[2px]">
                      <span className="text-[13px] sm:text-[12px] font-bold truncate text-on-surface block leading-tight">{ad.title}</span>
                      <span className="text-body-sm sm:text-[11px] font-semibold text-primary block mt-[1px]">₹{ad.price}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}


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
            </div>
          )}

          {!error && !loading && ads.length > 0 && (
            <>
              <div className="flex flex-col gap-md">
                <div className="flex items-center gap-xs text-[15px] font-bold text-primary uppercase tracking-wider pl-xs mb-xs">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span>Recent Post</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-sm md:gap-gutter">
                  {ads.map((ad, idx) => (
                    <div key={ad.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 75, 450)}ms` }}>
                      <AdCard ad={ad} isFeatured={pageData?.featured_ad_ids?.includes(ad.id)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-xs sm:gap-sm mt-xl py-md border-t border-outline-variant/10 flex-wrap">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(p - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="inline-flex items-center gap-xs px-sm sm:px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 border border-outline-variant/35 text-secondary hover:bg-surface-container-low hover:text-on-surface disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-xs">
                    {getPageNumbers().map((pageNum, idx) => {
                      if (pageNum === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-xs sm:px-sm text-secondary font-label-md">
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => {
                            setPage(pageNum as number);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-all duration-200 cursor-pointer ${
                            page === pageNum
                              ? 'bg-primary text-on-primary font-bold shadow-sm'
                              : 'text-secondary hover:bg-surface-container-low hover:text-on-surface border border-transparent'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setPage((p) => Math.min(p + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-xs px-sm sm:px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-200 border border-outline-variant/35 text-secondary hover:bg-surface-container-low hover:text-on-surface disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
