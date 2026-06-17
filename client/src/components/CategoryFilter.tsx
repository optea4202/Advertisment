import React, { useState, useEffect } from 'react';
import { getCategories, type Category } from '../api/categories.js';
import { buildCategoryTree, type NestedCategory } from '../utils/categoryTree.js';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await getCategories();
        setCategories(list);
        
        // Auto-expand the parent of the currently selected category, if any
        if (selectedCategory) {
          const activeCat = list.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
          if (activeCat && activeCat.parent_id !== null) {
            setExpandedIds(prev => ({ ...prev, [activeCat.parent_id!]: true }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories dynamically in CategoryFilter', err);
      }
    };
    fetchCats();
  }, [selectedCategory]);

  const tree = buildCategoryTree(categories);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Find active parent category for mobile subcategory row
  const activeCategoryObj = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
  const activeParentId = activeCategoryObj
    ? (activeCategoryObj.parent_id !== null ? activeCategoryObj.parent_id : activeCategoryObj.id)
    : null;
  
  const activeParentCategory = activeParentId ? categories.find(c => c.id === activeParentId) : null;
  const mobileSubcategories = activeParentId
    ? categories.filter(c => c.parent_id === activeParentId)
    : [];

  // Desktop recursive tree renderer
  const renderTreeNodes = (nodes: NestedCategory[]) => {
    return nodes.map((cat) => {
      const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = !!expandedIds[cat.id];
      const icon = cat.symbol || 'category';

      return (
        <div key={cat.id} className="flex flex-col w-full">
          <div 
            onClick={() => onSelectCategory(cat.name)}
            className={`flex items-center gap-xs pr-sm rounded-lg font-label-md text-label-md transition-all duration-200 cursor-pointer hover:bg-surface-container-low group w-full ${
              isSelected ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'text-secondary hover:text-on-surface'
            }`}
          >
            {/* Expand / Collapse Chevron */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(cat.id, e)}
                className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-on-primary' : 'text-secondary/70 group-hover:text-on-surface'}`}>
                  chevron_right
                </span>
              </button>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-secondary/35 font-mono text-[10px] select-none">
                •
              </div>
            )}

            {/* Category selection contents */}
            <div className="flex items-center gap-sm py-[10px] flex-grow select-none">
              <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-on-primary' : 'text-secondary/70 group-hover:text-on-surface'}`}>
                {icon}
              </span>
              <span>{cat.name}</span>
            </div>
          </div>

          {/* Children block */}
          {hasChildren && isExpanded && (
            <div className="flex flex-col ml-md border-l border-outline-variant/30 pl-sm mt-xs gap-xs">
              {renderTreeNodes(cat.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-sm w-full">
      <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider px-[4px] hidden md:block">
        Categories
      </h3>

      {/* DESKTOP VIEW: Collapsible Tree Sidebar */}
      <div className="hidden md:flex flex-col gap-xs w-full">
        {/* 'All' option */}
        <button
          onClick={() => onSelectCategory('')}
          className={`flex items-center gap-sm px-md py-[10px] rounded-lg font-label-md text-label-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left ${
            selectedCategory === ''
              ? 'bg-primary text-on-primary font-semibold shadow-md'
              : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>All Categories</span>
        </button>

        {renderTreeNodes(tree)}
      </div>

      {/* MOBILE VIEW: Nested Two-Row Horizontal Scroll */}
      <div className="flex md:hidden flex-col gap-sm w-full">
        {/* Row 1: Top-Level Categories */}
        <div className="flex flex-row gap-xs overflow-x-auto pb-xs scrollbar-none w-full">
          <button
            onClick={() => onSelectCategory('')}
            className={`flex items-center gap-xs whitespace-nowrap px-md py-[8px] rounded-full font-label-md text-[13px] transition-all duration-200 shrink-0 ${
              selectedCategory === ''
                ? 'bg-primary text-on-primary font-semibold shadow-sm'
                : 'text-secondary bg-surface-container-low/50 border border-outline-variant/20 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>All</span>
          </button>

          {tree.map(cat => {
            // A top-level category is active if it is selected, or if its parent is active
            const isTopLevelActive = activeParentId === cat.id || selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`flex items-center gap-xs whitespace-nowrap px-md py-[8px] rounded-full font-label-md text-[13px] transition-all duration-200 shrink-0 ${
                  isTopLevelActive
                    ? 'bg-primary/10 text-primary border border-primary/30 font-semibold'
                    : 'text-secondary bg-surface-container-low/50 border border-outline-variant/20 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.symbol || 'category'}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Subcategories of currently active top-level category (if any exist) */}
        {mobileSubcategories.length > 0 && (
          <div className="flex flex-row gap-xs overflow-x-auto pb-sm scrollbar-none w-full border-t border-outline-variant/20 pt-sm animate-fade-in">
            {/* Direct link to filter by the top-level parent itself in sub-row */}
            {activeParentCategory && (
              <button
                onClick={() => onSelectCategory(activeParentCategory.name)}
                className={`flex items-center gap-xs whitespace-nowrap px-sm py-[6px] rounded-lg font-label-sm text-[12px] transition-all shrink-0 ${
                  selectedCategory.toLowerCase() === activeParentCategory.name.toLowerCase()
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-secondary bg-surface-container-low/30 border border-dashed border-outline-variant/30'
                }`}
              >
                <span>All {activeParentCategory.name}</span>
              </button>
            )}

            {mobileSubcategories.map(sub => {
              const isSubActive = selectedCategory.toLowerCase() === sub.name.toLowerCase();
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectCategory(sub.name)}
                  className={`flex items-center gap-xs whitespace-nowrap px-sm py-[6px] rounded-lg font-label-sm text-[12px] transition-all shrink-0 ${
                    isSubActive
                      ? 'bg-primary text-on-primary font-semibold shadow-sm'
                      : 'text-secondary bg-surface-container-low/60 hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{sub.symbol || 'category'}</span>
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
