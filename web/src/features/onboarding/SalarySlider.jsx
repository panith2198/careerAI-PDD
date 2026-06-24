import React from 'react';
import { Slider } from '@/components/ui/slider';

export default function SalarySlider({ value = 800000, onChange }) {
  // Format the salary value to Indian Rupees currency format
  const formattedVal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

  const handleValueChange = (val) => {
    if (val && val.length > 0) {
      onChange(val[0]);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full py-2 select-none">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-[#9D99B8]">Expected Annual Salary</span>
        <span className="text-base md:text-lg font-bold font-mono text-[#A78BFA] tracking-tight bg-violet-500/10 px-3 py-1 rounded-lg border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          {formattedVal}/year
        </span>
      </div>

      <div className="relative px-1 py-4">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          min={200000}
          max={3000000}
          step={50000}
          className="cursor-pointer [&>[data-slot=slider-track]>[data-slot=slider-range]]:bg-gradient-to-r [&>[data-slot=slider-track]>[data-slot=slider-range]]:from-[#6D28D9] [&>[data-slot=slider-track]>[data-slot=slider-range]]:to-[#A78BFA] [&>[data-slot=slider-thumb]]:border-[#8B5CF6] [&>[data-slot=slider-thumb]]:bg-[#060608] [&>[data-slot=slider-thumb]]:ring-[#8B5CF6]/30 [&>[data-slot=slider-thumb]]:scale-125"
        />
      </div>

      <div className="flex justify-between text-xs text-[#5C5A78] font-mono">
        <span>₹2,00,000</span>
        <span>₹30,00,000</span>
      </div>
    </div>
  );
}
