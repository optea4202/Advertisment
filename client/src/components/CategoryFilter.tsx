import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles', 'Services', 'Other'];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex flex-col gap-sm w-full">
      <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider px-[4px] hidden md:block">
        Categories
      </h3>
      
      {/* Flex container: Column on desktop (sidebar style), row on mobile with horizontal scroll */}
      <div className="flex flex-row md:flex-col gap-xs overflow-x-auto md:overflow-x-visible pb-sm md:pb-0 scrollbar-none w-full">
        {CATEGORIES.map((category) => {
          const categoryValue = category === 'All' ? '' : category;
          const isSelected = selectedCategory === categoryValue;
          
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(categoryValue)}
              className={`whitespace-nowrap px-md py-[10px] rounded-lg font-label-md text-label-md transition-all duration-200 text-center md:text-left ${
                isSelected
                  ? 'bg-primary-fixed text-primary font-semibold shadow-sm'
                  : 'text-secondary bg-surface-container-low/50 md:bg-transparent hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
