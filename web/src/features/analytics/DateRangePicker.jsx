import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon } from '@hugeicons/core-free-icons';
import { format } from 'date-fns';

export default function DateRangePicker({ range, onRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const displayString = () => {
    if (!range?.from) return "Select Date Range";
    if (!range?.to) return format(range.from, "MMM d, yyyy");
    return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-md select-none">
          <HugeiconsIcon icon={Calendar02Icon} className="size-4 text-cyan-400" />
          <span>{displayString()}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1 border border-white/10 bg-[#0C0C12] rounded-2xl shadow-2xl z-50 w-auto" align="end">
        <Calendar
          mode="range"
          selected={range}
          onSelect={(newRange) => {
            onRangeChange(newRange);
            // Auto close popover once both range bounds are selected
            if (newRange?.from && newRange?.to) {
              setIsOpen(false);
            }
          }}
          className="bg-transparent text-white"
        />
      </PopoverContent>
    </Popover>
  );
}
