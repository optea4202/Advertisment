import React, { useState, useEffect } from 'react';
import { getCategories, type Category } from '../api/categories.js';
import { buildCategoryTree } from '../utils/categoryTree.js';

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredSubCatId, setHoveredSubCatId] = useState<number | null>(null);
  
  // Mobile accordion states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

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

  // Auto-expand parents when selectedCategory changes
  useEffect(() => {
    if (!selectedCategory || categories.length === 0) return;
    const activeCat = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
    if (!activeCat) return;

    setExpandedCategories(prev => {
      const next = { ...prev };
      let currentParentId = activeCat.parent_id;
      while (currentParentId !== null && currentParentId !== undefined) {
        next[currentParentId] = true;
        const parent = categories.find(c => c.id === currentParentId);
        currentParentId = parent?.parent_id ?? null;
      }
      return next;
    });
  }, [selectedCategory, categories]);

  const tree = buildCategoryTree(categories);

  const handleSelect = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onSelectCategory('');
    } else {
      onSelectCategory(categoryName);
    }
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
                    className={`flex items-center gap-xs px-sm py-[8px] rounded-lg font-category-l1 text-category-l1 uppercase tracking-wider transition-all duration-150 ${
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
                                className={`flex items-center justify-between px-md py-sm w-full text-left text-category-sub font-medium transition-colors ${
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
                                className="flex items-center gap-xs px-md py-sm text-left text-category-sub text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
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

      {/* MOBILE VIEW: Vertical Accordion Menu Bar */}
      <div className="flex md:hidden flex-col w-full px-xs">
        {/* Toggle Header Row */}
        <div 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-between px-md py-sm bg-surface-container-lowest border border-outline-variant/35 rounded-xl shadow-sm cursor-pointer select-none active:bg-surface-container-low/40 transition-all"
        >
          <span className="font-bold text-on-surface text-body-md uppercase tracking-wider">
            {selectedCategory ? `Category: ${selectedCategory}` : 'Menu'}
          </span>
          <span className="material-symbols-outlined text-[24px] text-secondary">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </div>

        {/* Vertical Accordion category list */}
        {isMobileMenuOpen && (
          <div className="mt-xs bg-surface-container-lowest border border-outline-variant/25 rounded-xl shadow-md overflow-hidden animate-fade-in-up-sheet flex flex-col">
            {tree.map(cat => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isExpanded = !!expandedCategories[cat.id];
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();

              return (
                <div key={cat.id} className="flex flex-col border-b border-outline-variant/10 last:border-b-0">
                  {/* Level 1 Item */}
                  <div 
                    className={`flex items-center justify-between px-md py-[14px] cursor-pointer transition-all duration-150 ${
                      isExpanded ? 'bg-surface-container/40' : 'hover:bg-surface-container-low/40'
                    }`}
                    onClick={() => {
                      if (hasChildren) {
                        setExpandedCategories(prev => ({
                          ...prev,
                          [cat.id]: !prev[cat.id]
                        }));
                      } else {
                        handleSelect(cat.name);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[20px] text-secondary/70">
                        {cat.symbol || 'category'}
                      </span>
                      <span className={`text-[13px] font-semibold uppercase tracking-wider ${
                        isSelected ? 'text-primary font-bold' : 'text-on-surface'
                      }`}>
                        {cat.name}
                      </span>
                    </div>
                    {hasChildren ? (
                      <span className={`material-symbols-outlined text-[20px] text-secondary/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    ) : (
                      cat.name === 'SELL' && (
                        <span className="text-[10px] bg-tertiary-fixed text-on-tertiary-fixed px-sm py-[2px] rounded-full font-bold uppercase tracking-wider">
                          HOT
                        </span>
                      )
                    )}
                  </div>

                  {/* Level 2 Sub-items */}
                  {hasChildren && isExpanded && (
                    <div className="flex flex-col bg-surface-container-low/20 border-t border-outline-variant/5">
                      {/* Option to select All Level 1 */}
                      <div 
                        className={`flex items-center px-[32px] py-[12px] cursor-pointer hover:bg-surface-container-low/50 transition-all ${
                          isSelected ? 'text-primary font-bold bg-primary-fixed/10' : 'text-secondary'
                        }`}
                        onClick={() => {
                          handleSelect(cat.name);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <span className="text-[10px] mr-sm opacity-60">▪</span>
                        <span className="text-[12px] font-medium uppercase tracking-wide">
                          ALL {cat.name}
                        </span>
                      </div>

                      {cat.children.map(subCat => {
                        const hasSubChildren = subCat.children && subCat.children.length > 0;
                        const isSubExpanded = !!expandedCategories[subCat.id];
                        const isSubSelected = selectedCategory.toLowerCase() === subCat.name.toLowerCase();

                        return (
                          <div key={subCat.id} className="flex flex-col border-t border-outline-variant/5">
                            {/* Level 2 Item */}
                            <div 
                              className={`flex items-center justify-between px-[32px] py-[12px] cursor-pointer transition-all duration-150 ${
                                isSubExpanded ? 'bg-surface-container/30' : 'hover:bg-surface-container-low/30'
                              }`}
                              onClick={() => {
                                if (hasSubChildren) {
                                  setExpandedCategories(prev => ({
                                    ...prev,
                                    [subCat.id]: !prev[subCat.id]
                                  }));
                                } else {
                                  handleSelect(subCat.name);
                                  setIsMobileMenuOpen(false);
                                }
                              }}
                            >
                              <div className="flex items-center">
                                <span className="text-[10px] mr-sm opacity-60">▪</span>
                                <span className={`text-[12px] font-medium uppercase tracking-wide ${
                                  isSubSelected ? 'text-primary font-bold' : 'text-secondary'
                                }`}>
                                  {subCat.name}
                                </span>
                              </div>
                              {hasSubChildren && (
                                <span className={`material-symbols-outlined text-[18px] text-secondary/50 transition-transform duration-200 ${isSubExpanded ? 'rotate-180' : ''}`}>
                                  keyboard_arrow_down
                                </span>
                              )}
                            </div>

                            {/* Level 3 Sub-items */}
                            {hasSubChildren && isSubExpanded && (
                              <div className="flex flex-col bg-surface-container/20 border-t border-outline-variant/5">
                                {/* Option to select All Level 2 */}
                                <div 
                                  className={`flex items-center px-[48px] py-[10px] cursor-pointer hover:bg-surface-container-high/30 transition-all ${
                                    isSubSelected ? 'text-primary font-bold bg-primary-fixed/10' : 'text-secondary/85'
                                  }`}
                                  onClick={() => {
                                    handleSelect(subCat.name);
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  <span className="text-[10px] mr-sm opacity-50">•</span>
                                  <span className="text-[11px] font-medium uppercase tracking-wide">
                                    ALL {subCat.name}
                                  </span>
                                </div>

                                {subCat.children.map(level3 => {
                                  const isL3Selected = selectedCategory.toLowerCase() === level3.name.toLowerCase();

                                  return (
                                    <div 
                                      key={level3.id}
                                      className={`flex items-center px-[48px] py-[10px] cursor-pointer hover:bg-surface-container-high/30 transition-all border-t border-outline-variant/5 last:border-b-0 ${
                                        isL3Selected ? 'text-primary font-bold bg-primary-fixed/10' : 'text-secondary/85'
                                      }`}
                                      onClick={() => {
                                        handleSelect(level3.name);
                                        setIsMobileMenuOpen(false);
                                      }}
                                    >
                                      <span className="text-[10px] mr-sm opacity-50">•</span>
                                      <span className="text-[11px] font-medium uppercase tracking-wide truncate">
                                        {level3.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
