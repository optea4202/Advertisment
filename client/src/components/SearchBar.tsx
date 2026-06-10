import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  initialSearch: string;
  onSearchChange: (search: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialSearch,
  onSearchChange,
  debounceMs = 400,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const isFirstMount = useRef(true);

  // Keep state in sync with prop if it changes externally (like when clearing filters)
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // Handle debouncing
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

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
        search
      </span>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search ads by keyword..."
        className="w-full bg-surface-container border border-outline-variant rounded-xl pl-[44px] pr-[44px] py-md font-body-md text-body-md text-on-surface placeholder:text-secondary/60 focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
      />

      {/* Clear Button */}
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-md top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
          title="Clear search"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}
    </div>
  );
};
