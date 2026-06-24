import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Home01Icon, UserGroupIcon, Briefcase01Icon } from '@hugeicons/core-free-icons';

export default function WorkModeSelector({ selectedMode, onChange }) {
  const options = [
    { value: 'remote', label: 'Remote', icon: Home01Icon, description: 'Work from anywhere in the world' },
    { value: 'hybrid', label: 'Hybrid', icon: UserGroupIcon, description: 'Mix of home and office work' },
    { value: 'office', label: 'Office', icon: Briefcase01Icon, description: 'Traditional office workspace' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1 select-none">
      {options.map((option) => {
        const isSelected = selectedMode === option.value;

        return (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onChange(option.value)}
            className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all duration-200 select-none ${
              isSelected
                ? 'bg-violet-500/10 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                : 'bg-[#161525] border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${
              isSelected ? 'bg-violet-500/20 border-violet-400 text-white' : 'bg-white/5 border-white/10 text-[#9D99B8]'
            }`}>
              <HugeiconsIcon icon={option.icon} className="size-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-bold text-xs text-[#EEEAF8]">{option.label}</span>
              <span className="text-[10px] text-[#5C5A78] leading-tight truncate">{option.description}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
