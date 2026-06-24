import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'growth', label: 'Fastest Growing' },
  { value: 'popularity', label: 'Most Popular' },
];

const CATEGORY_OPTIONS = [
  'All',
  'Technology',
  'Design',
  'AI',
  'Business',
  'Healthcare',
  'Finance',
];

export default function CareerFilterSheet({ isOpen, onClose, activeCategory, activeSort, onApply, onClear }) {
  const [localCategory, setLocalCategory] = useState(activeCategory);
  const [localSort, setLocalSort] = useState(activeSort);

  // Sync with props when opened
  useEffect(() => {
    if (isOpen) {
      setLocalCategory(activeCategory);
      setLocalSort(activeSort);
    }
  }, [isOpen, activeCategory, activeSort]);

  const handleApply = () => {
    onApply({
      category: localCategory,
      sort: localSort
    });
    onClose();
  };

  const handleClear = () => {
    setLocalCategory('All');
    setLocalSort('recommended');
    onClear();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#0c0b14]/95 border-l border-white/10 text-white flex flex-col justify-between p-0 backdrop-blur-2xl">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <SheetHeader className="border-b border-white/5 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg">
                <HugeiconsIcon icon={FilterIcon} className="size-4.5 text-[#22D3EE]" />
              </span>
              <SheetTitle className="text-white text-sm font-extrabold font-mono uppercase tracking-wider">
                Filter Career Paths
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-[#9D99B8]">
              Refine the career opportunities list to match your preferences.
            </SheetDescription>
          </SheetHeader>

          {/* Filter Form Content */}
          <div className="p-6 space-y-6">
            
            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Field of Interest (Category)
              </label>
              
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = localCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLocalCategory(cat)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold'
                          : 'bg-white/5 border-white/5 text-[#9D99B8] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Sort Results By
              </label>
              
              <div className="grid grid-cols-1 gap-2.5">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = localSort === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setLocalSort(opt.value)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                        isSelected
                          ? 'bg-violet-500/10 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                          : 'bg-white/5 border-white/5 text-[#A2A0C2] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#22D3EE]' : 'border-white/20'
                      }`}>
                        {isSelected && <div className="size-2 rounded-full bg-[#22D3EE]" />}
                      </div>
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t border-white/5 p-6 flex flex-row gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] font-semibold text-xs transition-all cursor-pointer select-none text-center"
          >
            Clear Filters
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] text-center cursor-pointer select-none"
          >
            Apply Filters
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
