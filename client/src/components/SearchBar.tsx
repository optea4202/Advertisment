import React, { useState, useEffect, useRef } from 'react';
import { getSearchSuggestions } from '../api/ads.js';

interface SearchBarProps {
  initialSearch: string;
  onSearchChange: (search: string) => void;
  onSelectCategory?: (category: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialSearch,
  onSearchChange,
  onSelectCategory,
  debounceMs = 400,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<{ categories: string[]; titles: string[] }>({
    categories: [],
    titles: []
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Keep state in sync with prop if it changes externally (like when clearing filters)
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // Handle debouncing for the main feed query change
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

  // Fetch autocomplete suggestions as the user types
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSuggestions({ categories: [], titles: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await getSearchSuggestions(trimmed);
        setSuggestions(data);
        // Open dropdown only if we have at least one suggestion
        setIsOpen(data.categories.length > 0 || data.titles.length > 0);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 200); // 200ms debounce for suggestion API queries to feel snappy

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle clicks outside the component to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
    setIsOpen(false);
  };

  const handleSelectCategory = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      // Clear search string to browse all ads of that category, which is the standard UX behavior
      setSearchTerm('');
      onSearchChange('');
    }
    setIsOpen(false);
  };

  const handleSelectTitle = (title: string) => {
    setSearchTerm(title);
    onSearchChange(title);
    setIsOpen(false);
  };

  // Keyboard accessibility handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasSuggestions = suggestions.categories.length > 0 || suggestions.titles.length > 0;

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Search Icon */}
      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary pointer-events-none z-10">
        search
      </span>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => {
          if (searchTerm.trim() && hasSuggestions) {
            setIsOpen(true);
          }
        }}
        placeholder="Search ads by keyword..."
        className="w-full bg-surface-container border border-outline-variant rounded-xl pl-[44px] pr-[44px] py-md font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
      />

      {/* Loading indicator or Clear button */}
      <div className="absolute right-md top-1/2 -translate-y-1/2 flex items-center gap-xs">
        {loading && (
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        )}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="text-secondary hover:text-on-surface transition-colors p-xs rounded-full hover:bg-surface-container"
            title="Clear search"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && hasSuggestions && (
        <div className="absolute left-0 right-0 mt-sm bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-2 backdrop-blur-md z-50 max-h-[320px] overflow-y-auto animate-fade-in-up-sheet">
          <div className="p-xs flex flex-col">
            
            {/* Category Suggestions */}
            {suggestions.categories.length > 0 && (
              <div className="flex flex-col mb-xs">
                <span className="font-label-sm text-[11px] text-secondary/70 uppercase tracking-wider px-sm py-[6px] select-none">
                  Categories
                </span>
                {suggestions.categories.map((cat) => (
                  <button
                    key={cat}
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

            {/* Divider if we have both */}
            {suggestions.categories.length > 0 && suggestions.titles.length > 0 && (
              <div className="h-[1px] bg-outline-variant/20 my-xs" />
            )}

            {/* Ad Title Suggestions */}
            {suggestions.titles.length > 0 && (
              <div className="flex flex-col">
                <span className="font-label-sm text-[11px] text-secondary/70 uppercase tracking-wider px-sm py-[6px] select-none">
                  Advertisements
                </span>
                {suggestions.titles.map((title) => (
                  <button
                    key={title}
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
            
          </div>
        </div>
      )}
    </div>
  );
};
