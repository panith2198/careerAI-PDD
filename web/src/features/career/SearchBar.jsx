import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon, Loading01Icon } from '@hugeicons/core-free-icons';
import { Input } from '@/components/ui/input';

export default function SearchBar({ value, onChange, isSearching }) {
  return (
    <div className="relative w-full">
      <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[#9D99B8] z-10 flex items-center justify-center">
        {isSearching ? (
          <div className="relative size-5 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400/50 opacity-75"></span>
            <HugeiconsIcon icon={Loading01Icon} className="size-4.5 text-violet-400 animate-spin" />
          </div>
        ) : (
          <HugeiconsIcon icon={SearchIcon} className="size-5" />
        )}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search careers, skills, industries..."
        className="w-full pl-12 pr-4 py-6 text-sm font-medium bg-white/[0.03] border-white/10 rounded-2xl text-white placeholder-[#5C5A78] focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 backdrop-blur-xl transition-all duration-300 outline-none"
      />
    </div>
  );
}
