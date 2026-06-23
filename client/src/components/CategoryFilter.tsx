import React, { useState, useEffect } from 'react';
import { getCategories, type Category } from '../api/categories.js';
import { buildCategoryTree, isDescendantOf } from '../utils/categoryTree.js';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeLevel2Id, setActiveLevel2Id] = useState<number | null>(null);
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState<number | null>(null);
  // Tracks which Level-2 item is hovered so the Level-3 panel can render
  // OUTSIDE the scrollable Level-2 container (avoiding overflow clipping).
  const [hoveredSubCatId, setHoveredSubCatId] = useState<number | null>(null);

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

  const handleSelect = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onSelectCategory('');
    } else {
      onSelectCategory(categoryName);
    }
    setActiveLevel2Id(null);
    setMobileOpenCategoryId(null);
  };

  return (
    <div className="w-full">
      {/* DESKTOP VIEW: Category Menu Bar with Dropdown Hover Sub Tree */}
      <div className="hidden md:flex flex-col w-full relative z-40">
        <div className="flex items-center gap-md py-xs justify-start select-none w-full border-b border-outline-variant/10 pb-xs overflow-visible">
          {/* Horizontal category buttons list */}
          <div className="flex items-center gap-xs overflow-visible flex-wrap w-full">
            {tree.map((cat, idx) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              const hasChildren = cat.children && cat.children.length > 0;
              const isRightAligned = idx >= tree.length - 2;

              return (
                <div
                  key={cat.id}
                  className="relative group overflow-visible py-[6px]"
                  onMouseLeave={() => setHoveredSubCatId(null)}
                >
                  <button
                    onClick={() => handleSelect(cat.name)}
                    className={`flex items-center gap-xs px-sm py-[8px] rounded-lg font-label-md text-label-md uppercase tracking-wider transition-all duration-150 ${
                      isSelected
                        ? 'text-primary font-bold bg-primary-fixed/15'
                        : 'text-secondary hover:text-primary hover:bg-surface-container-low/50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{cat.symbol || 'category'}</span>
                    <span>{cat.name}</span>
                    {hasChildren && (
                      <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180 opacity-70">
                        keyboard_arrow_down
                      </span>
                    )}
                  </button>

                  {/* ── Dropdown shell ── */}
                  {hasChildren && (
                    <div
                      className={`absolute top-full mt-[4px] border border-outline-variant/30 rounded-xl shadow-xl z-50 pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-150 invisible group-hover:visible origin-top scale-95 group-hover:scale-100 flex border-t-4 border-t-primary bg-surface-container-lowest ${
                        isRightAligned ? 'right-0 flex-row-reverse' : 'left-0 flex-row'
                      }`}
                    >
                      {/* ── Level 2 scrollable list (left panel) ── */}
                      <div
                        className="flex flex-col py-xs max-h-[350px] overflow-y-auto scrollbar-hide"
                        style={{ width: '220px' }}
                      >
                        {cat.children.map(subCat => {
                          const hasLevel3 = (subCat.children?.length ?? 0) > 0;
                          const isHovered = hoveredSubCatId === subCat.id;

                          return (
                            <div
                              key={subCat.id}
                              className="w-full"
                              onMouseEnter={() => setHoveredSubCatId(hasLevel3 ? subCat.id : null)}
                            >
                              <button
                                onClick={() => handleSelect(subCat.name)}
                                className={`flex items-center justify-between px-md py-sm w-full text-left text-body-sm font-medium transition-colors ${
                                  isHovered
                                    ? 'text-primary bg-surface-container-low'
                                    : 'text-secondary hover:text-primary hover:bg-surface-container-low'
                                }`}
                              >
                                <span className="truncate">{subCat.name}</span>
                                {hasLevel3 && (
                                  <span className="material-symbols-outlined text-[16px] text-secondary/60">
                                    {isRightAligned ? 'chevron_left' : 'chevron_right'}
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* ── Level 3 panel (right / left panel) — outside overflow boundary ── */}
                      {hoveredSubCatId !== null && (() => {
                        const hoveredSub = cat.children.find(c => c.id === hoveredSubCatId);
                        const level3Items = hoveredSub?.children ?? [];
                        if (!level3Items.length) return null;
                        return (
                          <div
                            className={`flex flex-col py-xs max-h-[350px] overflow-y-auto scrollbar-hide border-outline-variant/20 bg-surface-container-lowest rounded-xl ${
                              isRightAligned ? 'border-r' : 'border-l'
                            }`}
                            style={{ width: '220px' }}
                          >
                            {/* Sub-section header */}
                            <div className="px-md pt-xs pb-[6px] border-b border-outline-variant/15 mb-[2px]">
                              <span className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest">
                                {hoveredSub?.name}
                              </span>
                            </div>
                            {level3Items.map(level3 => (
                              <button
                                key={level3.id}
                                onClick={() => handleSelect(level3.name)}
                                className="flex items-center gap-xs px-md py-sm text-left text-body-sm text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px] text-secondary/40 shrink-0">
                                  {level3.symbol || 'category'}
                                </span>
                                <span className="truncate">{level3.name}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Horizontally Scrollable Categories with Dropdown Triggers */}
      <div className="flex md:hidden flex-row gap-xs overflow-x-auto pb-sm scrollbar-none w-full px-xs">

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
