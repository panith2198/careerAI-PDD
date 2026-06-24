import React from 'react';
import { Slider } from '@/components/ui/slider';

export default function SalarySlider({ value, onChange }) {
  return (
    <div className="space-y-2.5 w-full select-none">
      <div className="flex justify-between text-[10px] font-mono font-bold text-[#5C5A78] uppercase tracking-widest">
        <span>Compensation Scale</span>
        <span className="text-[#22D3EE] font-bold">
          ₹{value[0]}L - ₹{value[1]}L
        </span>
      </div>
      
      <Slider
        min={5}
        max={50}
        step={1}
        value={value}
        onValueChange={onChange}
        className="py-3"
      />
    </div>
  );
}
