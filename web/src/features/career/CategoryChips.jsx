import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  'All',
  'Technology',
  'Design',
  'AI',
  'Business',
  'Healthcare',
  'Finance',
];

export default function CategoryChips({ activeCategory = 'All', onChange }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 select-none flex items-center gap-2">
      {CATEGORIES.map((cat) => {
        const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              scale: isSelected ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`px-4.5 py-2 text-xs font-semibold rounded-full border transition-all duration-200 shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-violet-500/20 border-violet-400 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold'
                : 'bg-white/5 border-white/10 text-[#9D99B8] hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {cat}
          </motion.button>
        );
      })}
    </div>
  );
}
