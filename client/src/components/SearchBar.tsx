import React, { useState, useEffect, useRef } from 'react';
import { algoliasearch } from 'algoliasearch';
import { getSearchSuggestions } from '../api/ads.js';

// ── Algolia client (Search-Only key, mirrors useAds.ts pattern) ──────────────
let searchClient: ReturnType<typeof algoliasearch> | null = null;
const adsIndexName = import.meta.env.VITE_ALGOLIA_ADS_INDEX_NAME || 'fakna_ads';

try {
  const appId = import.meta.env.VITE_ALGOLIA_APP_ID || '';
  const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_ONLY_API_KEY || '';
  if (
    appId &&
    searchKey &&
    !appId.includes('placeholder') &&
    !searchKey.includes('placeholder')
  ) {
    searchClient = algoliasearch(appId, searchKey);
  }
} catch (err) {
  console.warn('SearchBar: Algolia client init skipped:', err);
}

// ── Types ────────────────────────────────────────────────────────────────────
interface SearchBarProps {
  initialSearch: string;
  onSearchChange: (search: string) => void;
  onSelectCategory?: (category: string) => void;
  debounceMs?: number;
}

// ── Component ────────────────────────────────────────────────────────────────
export const SearchBar: React.FC<SearchBarProps> = ({
  initialSearch,
  onSearchChange,
  onSelectCategory,
  debounceMs = 400,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<{
    categories: string[];
    titles: string[];
    fromAlgolia: boolean;
  }>({ categories: [], titles: [], fromAlgolia: false });

  // Controls whether the dropdown panel is visible
  const [isOpen, setIsOpen] = useState(false);
  // True while the API request is in flight
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<string[]>([]);

  // ── Load history from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('fakna_search_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
  }, []);

  // ── History helpers ──────────────────────────────────────────────────────
  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    const stored = localStorage.getItem('fakna_search_history');
    let currentHistory: string[] = [];
    if (stored) {
      try {
        currentHistory = JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    const updated = [trimmed, ...currentHistory.filter((item) => item !== trimmed)].slice(0, 5);
    localStorage.setItem('fakna_search_history', JSON.stringify(updated));
    setHistory(updated);
  };

  const deleteHistoryItem = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = localStorage.getItem('fakna_search_history');
    let currentHistory: string[] = [];
    if (stored) {
      try {
        currentHistory = JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    const updated = currentHistory.filter((i) => i !== item);
    localStorage.setItem('fakna_search_history', JSON.stringify(updated));
    setHistory(updated);
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.removeItem('fakna_search_history');
    setHistory([]);
    setIsOpen(false);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // ── Keep state in sync with prop if it changes externally ────────────────
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // ── Main feed debounce — tells the parent what the current query is ───────
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange, debounceMs]);

  // ── Suggestions effect ────────────────────────────────────────────────────
  // Opens the dropdown immediately on first character, populates once fetch resolves.
  // Strategy: try Algolia directly (client-side) for ad title suggestions;
  //           always fetch categories from backend; fall back to backend titles if Algolia unavailable.
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setSuggestions({ categories: [], titles: [], fromAlgolia: false });
      setIsOpen(false);
      setLoading(false);
      return;
    }

    // Open the panel immediately so the user sees feedback right away
    setIsOpen(true);
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        let categories: string[] = [];
        let titles: string[] = [];
        let fromAlgolia = false;

        // ── Step 1: Always fetch categories from backend (fast, few rows) ──
        // ── Step 2: Try direct Algolia for ad title suggestions ────────────
        if (searchClient) {
          const [backendData, algoliaRes] = await Promise.allSettled([
            getSearchSuggestions(trimmed),
            searchClient.searchSingleIndex({
              indexName: adsIndexName,
              searchParams: {
                query: trimmed,
                hitsPerPage: 8,
                attributesToRetrieve: ['title'],
              },
            }),
          ]);

          // Categories from backend
          if (backendData.status === 'fulfilled') {
            categories = backendData.value.categories;
          }

          // Ad titles from Algolia
          if (algoliaRes.status === 'fulfilled' && algoliaRes.value?.hits?.length) {
            const uniqueTitles = new Set<string>();
            for (const hit of algoliaRes.value.hits) {
              const t = (hit as any).title as string | undefined;
              if (t) uniqueTitles.add(t);
            }
            titles = Array.from(uniqueTitles).slice(0, 6);
            fromAlgolia = true;
          } else if (backendData.status === 'fulfilled') {
            // Algolia failed or returned nothing — use DB titles from backend
            titles = backendData.value.titles;
          }
        } else {
          // Algolia client not configured — fall back entirely to backend
          const backendData = await getSearchSuggestions(trimmed);
          categories = backendData.categories;
          titles = backendData.titles;
        }

        setSuggestions({ categories, titles, fromAlgolia });

        // Close only if the input was cleared while we were waiting
        if (!searchTerm.trim()) {
          setIsOpen(false);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions({ categories: [], titles: [], fromAlgolia: false });
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Close on click outside ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
    setSuggestions({ categories: [], titles: [], fromAlgolia: false });
    setIsOpen(false);
  };

  const handleSelectCategory = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    setSuggestions({ categories: [], titles: [], fromAlgolia: false });
    setIsOpen(false);
  };

  const handleSelectTitle = (title: string) => {
    saveToHistory(title);
    setSearchTerm(title);
    onSearchChange(title);
    setIsOpen(false);
  };

  // Re-open on focus if there's already a query or search history exists
  const handleFocus = () => {
    if (searchTerm.trim() || history.length > 0) {
      setIsOpen(true);
    }
  };

  // Escape closes the dropdown, Enter saves/submits search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      const trimmed = searchTerm.trim();
      if (trimmed) {
        saveToHistory(trimmed);
        onSearchChange(trimmed);
        setIsOpen(false);
      }
    }
  };

  const hasSuggestions = suggestions.categories.length > 0 || suggestions.titles.length > 0;
  const showHistory = !searchTerm.trim() && history.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Search Icon */}
      <span className="material-symbols-outlined absolute left-sm md:left-md top-1/2 -translate-y-1/2 text-secondary pointer-events-none z-10 text-[16px] md:text-[18px]">
        search
      </span>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={handleFocus}
        onClick={handleFocus}
        autoComplete="off"
        spellCheck="false"
        placeholder="Search ads by keyword..."
        className="w-full bg-surface-container border border-outline-variant rounded-xl pl-[32px] md:pl-[40px] pr-[32px] md:pr-[40px] py-[3.5px] md:py-[5px] font-body-md text-[13px] md:text-body-sm text-on-surface placeholder:text-secondary/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
      />

      {/* Right-side controls: spinner + clear button */}
      <div className="absolute right-sm md:right-md top-1/2 -translate-y-1/2 flex items-center gap-xs">
        {loading && (
          <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        )}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="text-secondary hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container"
            title="Clear search"
          >
            <span className="material-symbols-outlined text-[16px] md:text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* ── Dropdown panel ──────────────────────────────────────────────────
          Visible as soon as isOpen=true. Shows skeleton while loading, then results. */}
      {isOpen && (!!searchTerm.trim() || history.length > 0) && (
        <div className="absolute left-0 right-0 mt-sm bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-2 backdrop-blur-md z-50 max-h-[320px] overflow-y-auto animate-fade-in-up-sheet">
          <div className="p-xs flex flex-col">

            {/* ── Recent Searches (Search History) ── */}
            {showHistory && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between px-sm py-[6px] select-none border-b border-outline-variant/10 mb-xs">
                  <span className="font-label-sm text-[11px] text-secondary/70 uppercase tracking-wider">
                    Recent Searches
                  </span>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearAllHistory}
                    className="text-[11px] font-semibold text-primary hover:text-primary-container transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                {history.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between px-sm py-[4px] rounded-lg hover:bg-primary/5 group transition-colors"
                  >
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectTitle(item)}
                      className="flex items-center gap-sm flex-grow text-left text-on-surface font-body-sm text-body-sm group py-[4px]"
                    >
                      <span className="material-symbols-outlined text-secondary/70 group-hover:text-primary text-[18px]">
                        history
                      </span>
                      <span className="truncate group-hover:text-primary font-medium">{item}</span>
                    </button>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => deleteHistoryItem(e, item)}
                      className="text-secondary hover:text-error hover:bg-error-container/20 p-[4px] rounded-full transition-colors flex items-center justify-center mr-xs"
                      title="Remove from history"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Loading skeleton rows ── */}
            {!!searchTerm.trim() && loading && (
              <div className="flex flex-col gap-xs px-sm py-sm">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-sm">
                    <div className="w-4 h-4 rounded bg-surface-container animate-pulse shrink-0" />
                    <div
                      className="h-3 rounded bg-surface-container animate-pulse"
                      style={{ width: `${50 + i * 15}%` }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── Category suggestions ── */}
            {!!searchTerm.trim() && !loading && suggestions.categories.length > 0 && (
              <div className="flex flex-col mb-xs">
                <span className="font-label-sm text-[11px] text-secondary/70 uppercase tracking-wider px-sm py-[6px] select-none">
                  Categories
                </span>
                {suggestions.categories.map((cat) => (
                  <button
                    key={cat}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectCategory(cat)}
                    className="flex items-center gap-sm px-sm py-[8px] text-left text-on-surface hover:bg-primary/5 active:bg-primary/10 rounded-lg transition-colors font-body-sm text-body-sm group"
                  >
                    <span className="material-symbols-outlined text-secondary/70 group-hover:text-primary text-[18px]">
                      folder
                    </span>
                    <span className="font-medium group-hover:text-primary">{cat}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Divider between category and ad-title sections ── */}
            {!!searchTerm.trim() &&
              !loading &&
              suggestions.categories.length > 0 &&
              suggestions.titles.length > 0 && (
                <div className="h-[1px] bg-outline-variant/20 my-xs" />
              )}

            {/* ── Ad title suggestions (Algolia or DB fallback) ── */}
            {!!searchTerm.trim() && !loading && suggestions.titles.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between px-sm py-[6px] select-none">
                  <span className="font-label-sm text-[11px] text-secondary/70 uppercase tracking-wider">
                    Advertisements
                  </span>
                  {suggestions.fromAlgolia && (
                    <span
                      className="text-[10px] font-semibold text-primary/60 flex items-center gap-[3px]"
                      title="Powered by Algolia"
                    >
                      <span className="material-symbols-outlined text-[13px]">bolt</span>
                      Algolia
                    </span>
                  )}
                </div>
                {suggestions.titles.map((title) => (
                  <button
                    key={title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectTitle(title)}
                    className="flex items-center gap-sm px-sm py-[8px] text-left text-on-surface hover:bg-primary/5 active:bg-primary/10 rounded-lg transition-colors font-body-sm text-body-sm group"
                  >
                    <span className="material-symbols-outlined text-secondary/70 group-hover:text-primary text-[18px]">
                      sell
                    </span>
                    <span className="truncate group-hover:text-primary">{title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── No results state ── */}
            {!!searchTerm.trim() && !loading && !hasSuggestions && (
              <div className="flex items-center gap-sm px-sm py-md text-secondary font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[18px]">search_off</span>
                <span>No suggestions for &ldquo;{searchTerm}&rdquo;</span>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
