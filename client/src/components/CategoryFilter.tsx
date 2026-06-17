import React, { useState, useEffect, useRef } from 'react';
import { getCategories, type Category } from '../api/categories.js';
import { buildCategoryTree, isDescendantOf, type NestedCategory } from '../utils/categoryTree.js';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);
  const [activeLevel2Id, setActiveLevel2Id] = useState<number | null>(null);
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState<number | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await getCategories();
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories dynamically in CategoryFilter', err);
      }
    };
    fetchCats();
  }, []);

  const tree = buildCategoryTree(categories);

  const handleMouseEnterCategory = (catId: number, catChildren: NestedCategory[]) => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredCategoryId(catId);
    if (catChildren && catChildren.length > 0) {
      setActiveLevel2Id(catChildren[0].id);
    } else {
      setActiveLevel2Id(null);
    }
  };

  const handleMouseLeaveCategory = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredCategoryId(null);
      setActiveLevel2Id(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (categoryName: string) => {
    onSelectCategory(categoryName);
    setHoveredCategoryId(null);
    setActiveLevel2Id(null);
    setMobileOpenCategoryId(null);
  };

  return (
    <div className="w-full">
      {/* DESKTOP VIEW: Horizontal Category Menu Bar with Hover Mega Menu */}
      <div className="hidden md:flex items-center gap-xs py-xs px-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm justify-start select-none w-full relative z-40">
        {/* 'All' option */}
        <button
          onClick={() => handleSelect('')}
          className={`flex items-center gap-xs px-sm py-[8px] rounded-lg font-label-md text-label-md uppercase tracking-wider transition-all duration-200 shrink-0 ${
            selectedCategory === ''
              ? 'text-primary font-bold bg-primary-fixed/20'
              : 'text-secondary hover:text-primary hover:bg-surface-container-low/50'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>All</span>
        </button>

        {tree.map(cat => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const hasChildren = cat.children && cat.children.length > 0;
          const isHovered = hoveredCategoryId === cat.id;
          
          // Check if selectedCategory is a descendant of this top level category
          const isCatActive = isSelected || isDescendantOf(
            categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.id || 0,
            cat.id,
            categories
          );

          return (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => handleMouseEnterCategory(cat.id, cat.children)}
              onMouseLeave={handleMouseLeaveCategory}
            >
              <button
                onClick={() => handleSelect(cat.name)}
                className={`flex items-center gap-xs px-sm py-[8px] rounded-lg font-label-md text-label-md uppercase tracking-wider transition-all duration-200 shrink-0 ${
                  isCatActive
                    ? 'text-primary font-bold bg-primary-fixed/15'
                    : 'text-secondary hover:text-primary hover:bg-surface-container-low/50'
                }`}
              >
                <span>{cat.name}</span>
                {hasChildren && (
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                    isHovered ? 'rotate-180 text-primary' : 'text-secondary/60'
                  }`}>
                    keyboard_arrow_down
                  </span>
                )}
              </button>

              {/* Mega Menu Dropdown */}
              {hasChildren && isHovered && (
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-[6px] w-[700px] bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-2xl z-50 flex animate-fade-in-up-sheet overflow-hidden"
                  style={{ transformOrigin: 'top center' }}
                >
                  {/* Left column: Level 2 */}
                  <div className="w-[40%] bg-surface-container-low/40 border-r border-outline-variant/10 p-sm flex flex-col gap-xs max-h-[380px] overflow-y-auto">
                    <div className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest px-sm pb-xs">
                      Subcategories
                    </div>
                    {cat.children.map(subCat => {
                      const isSubSelected = selectedCategory.toLowerCase() === subCat.name.toLowerCase();
                      const isSubActive = activeLevel2Id === subCat.id;
                      const subHasChildren = subCat.children && subCat.children.length > 0;
                      
                      return (
                        <div
                          key={subCat.id}
                          onMouseEnter={() => setActiveLevel2Id(subCat.id)}
                          onClick={() => handleSelect(subCat.name)}
                          className={`flex items-center justify-between px-md py-xs rounded-lg font-label-md text-label-md cursor-pointer transition-all duration-150 ${
                            isSubActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : isSubSelected
                                ? 'bg-primary-fixed text-primary font-semibold'
                                : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                          }`}
                        >
                          <span className="truncate">{subCat.name}</span>
                          {subHasChildren && (
                            <span className="material-symbols-outlined text-[16px] text-secondary/55">
                              chevron_right
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right column: Level 3 */}
                  <div className="w-[60%] p-md max-h-[380px] overflow-y-auto bg-surface-container-lowest flex flex-col">
                    {activeLevel2Id !== null ? (() => {
                      const activeSubCat = cat.children.find(c => c.id === activeLevel2Id);
                      const level3Items = activeSubCat?.children || [];
                      
                      return (
                        <div className="flex flex-col gap-sm flex-grow">
                          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-sm">
                            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">
                              {activeSubCat ? activeSubCat.name : ''} Items
                            </span>
                            {activeSubCat && (
                              <button
                                onClick={() => handleSelect(activeSubCat.name)}
                                className="text-body-sm font-semibold text-primary hover:underline"
                              >
                                View All
                              </button>
                            )}
                          </div>

                          {level3Items.length > 0 ? (
                            <div className="grid grid-cols-2 gap-xs">
                              {level3Items.map(level3 => {
                                const isL3Selected = selectedCategory.toLowerCase() === level3.name.toLowerCase();
                                return (
                                  <div
                                    key={level3.id}
                                    onClick={() => handleSelect(level3.name)}
                                    className={`flex items-center gap-sm px-sm py-[8px] rounded-lg font-body-sm text-body-sm cursor-pointer transition-all duration-150 ${
                                      isL3Selected
                                        ? 'bg-primary-fixed text-primary font-semibold'
                                        : 'text-secondary hover:text-primary hover:bg-surface-container-low/60'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-[16px] text-secondary/50">
                                      {level3.symbol || 'category'}
                                    </span>
                                    <span className="truncate">{level3.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-center text-secondary/35 py-xl gap-sm">
                              <span className="material-symbols-outlined text-[28px]">category</span>
                              <span className="text-body-sm">No sub-items</span>
                            </div>
                          )}
                        </div>
                      );
                    })() : (
                      <div className="flex-grow flex items-center justify-center text-secondary/35 py-xl">
                        Hover a subcategory to view items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE VIEW: Horizontally Scrollable Categories with Dropdown Triggers */}
      <div className="flex md:hidden flex-row gap-xs overflow-x-auto pb-sm scrollbar-none w-full px-xs">
        <button
          onClick={() => handleSelect('')}
          className={`flex items-center gap-xs whitespace-nowrap px-md py-[8px] rounded-full font-label-md text-[13px] transition-all duration-200 shrink-0 ${
            selectedCategory === ''
              ? 'bg-primary text-on-primary font-semibold shadow-sm'
              : 'text-secondary bg-surface-container-low/60 border border-outline-variant/15 hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
          <span>All</span>
        </button>

        {tree.map(cat => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const hasChildren = cat.children && cat.children.length > 0;
          
          const isCatActive = isSelected || isDescendantOf(
            categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase())?.id || 0,
            cat.id,
            categories
          );

          return (
            <button
              key={cat.id}
              onClick={() => {
                if (hasChildren) {
                  setMobileOpenCategoryId(cat.id);
                  setActiveLevel2Id(cat.children[0]?.id || null);
                } else {
                  handleSelect(cat.name);
                }
              }}
              className={`flex items-center gap-xs whitespace-nowrap px-md py-[8px] rounded-full font-label-md text-[13px] transition-all duration-200 shrink-0 ${
                isCatActive
                  ? 'bg-primary/10 text-primary border border-primary/25 font-semibold'
                  : 'text-secondary bg-surface-container-low/60 border border-outline-variant/15 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.symbol || 'category'}</span>
              <span>{cat.name}</span>
              {hasChildren && (
                <span className="material-symbols-outlined text-[14px] opacity-70">
                  keyboard_arrow_down
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MOBILE DRILL-DOWN BOTTOM DRAWER */}
      {mobileOpenCategoryId !== null && (() => {
        const activeTopCat = tree.find(c => c.id === mobileOpenCategoryId);
        if (!activeTopCat) return null;

        return (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/60 z-50 transition-opacity"
              onClick={() => setMobileOpenCategoryId(null)}
            />

            {/* Bottom sheet */}
            <div 
              className="fixed inset-x-0 bottom-0 bg-surface-container-lowest rounded-t-2xl shadow-2xl z-50 flex flex-col max-h-[70vh] animate-fade-in-up-sheet border-t border-outline-variant/30"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant/10">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    {activeTopCat.symbol || 'category'}
                  </span>
                  <span className="font-bold text-on-surface text-body-md uppercase tracking-wide">
                    {activeTopCat.name}
                  </span>
                </div>
                <button 
                  onClick={() => setMobileOpenCategoryId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-secondary"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Drawer Body (Split Panel) */}
              <div className="flex flex-grow h-[320px] overflow-hidden">
                {/* Left column (Level 2 subcategories) */}
                <div className="w-[40%] bg-surface-container-low/40 border-r border-outline-variant/10 overflow-y-auto py-xs flex flex-col gap-[2px]">
                  <div
                    onClick={() => handleSelect(activeTopCat.name)}
                    className="px-sm py-sm mx-xs rounded-lg text-body-sm font-bold text-center text-primary border border-dashed border-primary/20 bg-primary/5 mb-sm transition-all"
                  >
                    All {activeTopCat.name}
                  </div>

                  {activeTopCat.children.map(subCat => {
                    const isSubSelected = selectedCategory.toLowerCase() === subCat.name.toLowerCase();
                    const isSubActive = activeLevel2Id === subCat.id;

                    return (
                      <div
                        key={subCat.id}
                        onClick={() => {
                          setActiveLevel2Id(subCat.id);
                          if (!subCat.children || subCat.children.length === 0) {
                            handleSelect(subCat.name);
                          }
                        }}
                        className={`px-sm py-[8px] mx-xs rounded-lg font-label-sm text-[13px] cursor-pointer transition-all ${
                          isSubActive
                            ? 'bg-primary/10 text-primary font-bold shadow-sm'
                            : isSubSelected
                              ? 'bg-primary-fixed text-primary font-bold'
                              : 'text-secondary hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="truncate text-center">{subCat.name}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Right column (Level 3 subcategories) */}
                <div className="w-[60%] overflow-y-auto p-sm bg-surface-container-lowest">
                  {activeLevel2Id !== null ? (() => {
                    const activeSubCat = activeTopCat.children.find(c => c.id === activeLevel2Id);
                    const level3Items = activeSubCat?.children || [];

                    return (
                      <div className="flex flex-col gap-sm">
                        {activeSubCat && (
                          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-xs">
                            <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-wider">
                              {activeSubCat.name} Sub-items
                            </span>
                            <button
                              onClick={() => handleSelect(activeSubCat.name)}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              All
                            </button>
                          </div>
                        )}

                        {level3Items.length > 0 ? (
                          <div className="flex flex-col gap-[2px]">
                            {level3Items.map(level3 => {
                              const isL3Selected = selectedCategory.toLowerCase() === level3.name.toLowerCase();
                              return (
                                <div
                                  key={level3.id}
                                  onClick={() => handleSelect(level3.name)}
                                  className={`flex items-center gap-sm px-sm py-[8px] rounded-lg font-body-sm text-[13px] cursor-pointer transition-all ${
                                    isL3Selected
                                      ? 'bg-primary-fixed text-primary font-semibold'
                                      : 'text-secondary hover:text-primary hover:bg-surface-container-low/40'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[16px] text-secondary/50">
                                    {level3.symbol || 'category'}
                                  </span>
                                  <span className="truncate">{level3.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center text-secondary/35 py-xl gap-sm">
                            <span className="material-symbols-outlined text-[28px]">category</span>
                            <span className="text-[11px]">Tap options on left to load parts</span>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="flex items-center justify-center text-center text-secondary/35 h-full py-xl">
                      Select subcategory
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};
