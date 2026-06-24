import React from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Jobs', 'Roadmap', 'AI', 'System'];

export default function NotificationFilters({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 select-none relative z-20">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`relative px-4.5 py-2.5 rounded-xl text-[10px] font-extrabold font-mono uppercase tracking-wider transition-all duration-300 border focus:outline-none cursor-pointer ${
              isActive
                ? 'border-violet-500/40 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                : 'border-white/5 bg-white/5 text-[#A2A0C2] hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {/* Animated active pill background */}
            {isActive && (
              <motion.div
                layoutId="activeNotificationFilter"
                className="absolute inset-0 bg-violet-600/10 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
