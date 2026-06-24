import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { RouteIcon, RefreshIcon, Share01Icon } from '@hugeicons/core-free-icons';

export default function ResultActions({ onViewRoadmap, onRetake, onShare }) {
  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' } },
    tap: { scale: 0.98, transition: { duration: 0.1, ease: 'easeIn' } }
  };

  return (
    <div className="w-full flex flex-col gap-3 py-2 select-none">
      {/* View Roadmap - Primary Action */}
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onViewRoadmap}
        className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(139,92,246,0.35)] cursor-pointer transition-all h-11"
      >
        <HugeiconsIcon icon={RouteIcon} className="size-4.5" />
        <span>View Roadmap</span>
      </motion.button>

      {/* Retake Assessment - Secondary Action */}
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onRetake}
        className="w-full px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[#A2A0C2] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all h-11"
      >
        <HugeiconsIcon icon={RefreshIcon} className="size-4.5" />
        <span>Retake Assessment</span>
      </motion.button>

      {/* Share Result - Tertiary Action */}
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onShare}
        className="w-full px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[#A2A0C2] hover:text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all h-11"
      >
        <HugeiconsIcon icon={Share01Icon} className="size-4.5" />
        <span>Share Result</span>
      </motion.button>
    </div>
  );
}
