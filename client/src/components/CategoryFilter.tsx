import React from 'react';
import { getCategories } from '../api/categories.js';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'All': 'grid_view',
  'Electronics': 'devices',
  'Furniture': 'chair',
  'Vehicles': 'directions_car',
  'Services': 'build',
  'Other': 'category',
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = React.useState<string[]>(['All']);

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await getCategories();
        setCategories(['All', ...list.map(c => c.name)]);
      } catch (err) {
        console.error('Failed to load categories dynamically in CategoryFilter', err);
        // fallback
        setCategories(['All', 'Electronics', 'Furniture', 'Vehicles', 'Services', 'Other']);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="flex flex-col gap-sm w-full">
      <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider px-[4px] hidden md:block">
        Categories
      </h3>
      
      {/* Flex container: Column on desktop (sidebar style), row on mobile with horizontal scroll */}
      <div className="flex flex-row md:flex-col gap-xs overflow-x-auto md:overflow-x-visible pb-sm md:pb-0 scrollbar-none w-full">
        {categories.map((category) => {
          const categoryValue = category === 'All' ? '' : category;
          const isSelected = selectedCategory === categoryValue;
          const icon = CATEGORY_ICONS[category] || 'category';
          
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(categoryValue)}
              className={`flex items-center gap-sm whitespace-nowrap px-md py-[10px] rounded-lg font-label-md text-label-md transition-all duration-200 text-center md:text-left hover:scale-[1.02] active:scale-[0.98] ${
                isSelected
                  ? 'bg-primary text-on-primary font-semibold shadow-md'
                  : 'text-secondary bg-surface-container-low/50 md:bg-transparent hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-on-primary' : 'text-secondary/70'}`}>
                {icon}
              </span>
              <span>{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

