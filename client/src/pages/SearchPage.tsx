import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import { Footer } from '../components/Footer.js';
import { CategoryFilter } from '../components/CategoryFilter.js';
import { AdCard } from '../components/AdCard.js';
import { useFeed } from '../hooks/useAds.js';
import { useAuth } from '../context/AuthContext.js';
import { getPageBySlug } from '../api/pages.js';

export const SearchPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredAdIds, setFeaturedAdIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchFeaturedIds = async () => {
      try {
        const data = await getPageBySlug('home');
        setFeaturedAdIds(data.featured_ad_ids || []);
      } catch (err) {
        console.error('Failed to fetch featured ad ids:', err);
      }
    };
    fetchFeaturedIds();
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

  useEffect(() => {
    if (!category && !search) {
      navigate('/', { replace: true });
    }
  }, [category, search, navigate]);

  const { ads, total, totalPages, loading, error, refresh } = useFeed(category, search, page);

  const setCategory = (cat: string) => {
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
  };

  const setSearch = (query: string) => {
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
  };

  const setPage = (p: number | ((prev: number) => number)) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const newPage = typeof p === 'function' ? p(page) : p;
      next.set('page', newPage.toString());
      return next;
    });
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

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

  const startIndex = (page - 1) * 12 + 1;
  const endIndex = Math.min(page * 12, total);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-md md:px-xl py-xl flex flex-col gap-lg animate-fade-in">
        {/* Mobile Category Bar Row (Mobile Only) */}
        <div className="flex flex-col gap-sm md:hidden">
          <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />
        </div>

        {/* Search Header Area */}
        <div className="flex flex-col gap-md">
          <div className="flex items-center gap-xs text-primary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search results</span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold leading-tight tracking-tight text-on-surface">
            {search.trim() ? (
              <>
                Results for <span className="text-gradient">"{search}"</span>
              </>
            ) : category ? (
              <>
                Browse Category <span className="text-gradient">"{category}"</span>
              </>
            ) : (
              <>
                Browse All <span className="text-gradient">Advertisements</span>
              </>
            )}
          </h1>
        </div>


          {/* Active Filters Summary (visible on both mobile and desktop when filters exist) */}
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

        {/* Layout: Main Full-Width Grid */}
        <div className="flex flex-col gap-lg min-h-[400px] mt-xs">
          {error && (
            <div className="p-xl bg-error-container text-on-error-container rounded-2xl border border-error/10 flex flex-col gap-md items-center justify-center text-center">
              <span className="material-symbols-outlined text-[48px] text-error">error</span>
              <div>
                <h3 className="font-headline-md text-[18px] font-semibold">Failed to load advertisements</h3>
                <p className="font-body-sm text-body-sm text-on-error-container/85 mt-xs">There was an issue fetching the search results. Please try again.</p>
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
              <p className="font-label-sm text-label-sm text-secondary">Searching matching ads...</p>
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
            <>
              <div className="flex flex-col gap-md">
                <div className="text-body-md font-medium text-secondary/90">
                  Showing {startIndex}-{endIndex} of {total} results
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm md:gap-gutter">
                  {ads.map((ad, idx) => (
                    <div key={ad.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 75, 450)}ms` }}>
                      <AdCard ad={ad} isFeatured={featuredAdIds.includes(ad.id)} />
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
