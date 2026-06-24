import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CategoryCheckbox({ label, checked, onChange }) {
  const id = `cat-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex items-center gap-3 select-none py-1.5 group cursor-pointer">
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={(val) => onChange(!!val)} 
      />
      <label 
        htmlFor={id} 
        className="text-xs font-semibold text-[#A2A0C2] group-hover:text-white transition-colors cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
