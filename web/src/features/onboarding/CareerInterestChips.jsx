import React from 'react';
import { motion } from 'framer-motion';

export default function CareerInterestChips({ selectedInterests = [], onChange }) {
  const options = [
    'Frontend',
    'Backend',
    'AI',
    'Data Science',
    'Cloud',
    'Mobile',
    'Cyber Security',
  ];

  const handleToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      onChange(selectedInterests.filter((item) => item !== interest));
    } else {
      onChange([...selectedInterests, interest]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center py-0.5 select-none">
      {options.map((option) => {
        const isSelected = selectedInterests.includes(option);

        return (
          <motion.button
            key={option}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: isSelected ? 1.04 : 1 }}
            onClick={() => handleToggle(option)}
            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 cursor-pointer select-none focus:outline-none ${
              isSelected
                ? 'bg-violet-500/20 border-violet-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                : 'bg-white/5 border-white/10 text-[#9D99B8] hover:bg-white/10 hover:text-white'
            }`}
          >
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}
