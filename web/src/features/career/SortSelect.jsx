import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'salary', label: 'Highest Salary' },
  { value: 'growth', label: 'Fastest Growing' },
  { value: 'popularity', label: 'Most Popular' },
];

export default function SortSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase font-mono tracking-wider text-[#5C5A78] hidden sm:inline">
        Sort By
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/10 rounded-xl text-[#EEEAF8] hover:bg-white/[0.06] transition-all h-10 select-none">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-[#161525] border-white/10 text-[#EEEAF8] rounded-xl shadow-2xl">
          {SORT_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="focus:bg-violet-500/20 focus:text-white cursor-pointer py-2 rounded-lg text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
