import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon, FilterIcon } from '@hugeicons/core-free-icons';

export default function JobSearch({ search, onSearchChange, onFilterOpen, activeFiltersCount = 0 }) {
  return (
    <div className="w-full flex items-center gap-3 select-none">
      {/* Search Bar Input */}
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78]">
          <HugeiconsIcon icon={SearchIcon} className="size-4.5" />
        </span>
        <input
          type="text"
          placeholder="Search jobs, companies, skills..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-xs font-semibold text-white placeholder:text-[#5C5A78] focus:border-violet-500 focus:outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        />
      </div>

      {/* Filter Action Button */}
      <button
        onClick={onFilterOpen}
        className={`px-5 py-3.5 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer font-bold text-xs ${
          activeFiltersCount > 0
            ? 'bg-violet-500/15 border-violet-500/50 text-[#22D3EE] shadow-[0_0_12px_rgba(139,92,246,0.1)]'
            : 'bg-white/5 border-white/10 text-[#A2A0C2] hover:bg-white/10 hover:text-white hover:border-white/20'
        }`}
      >
        <HugeiconsIcon icon={FilterIcon} className="size-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center size-5 rounded-full bg-[#22D3EE] text-black text-[9px] font-black font-mono">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
}
