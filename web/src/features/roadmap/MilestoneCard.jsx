import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

export default function MilestoneCard({ milestone, isCompleted, roadmapId }) {
  const navigate = useNavigate();
  const { topic_id, title, description } = milestone;

  const handleCardClick = () => {
    navigate(`/roadmap/${roadmapId}/milestone/${topic_id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all duration-200 cursor-pointer select-none"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Completion status circle bubble */}
        <div className="shrink-0 flex items-center justify-center">
          {isCompleted ? (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-[#10B981]" />
          ) : (
            <div className="size-5 rounded-full border-2 border-white/20 bg-white/5 hover:border-white/35 transition-colors" />
          )}
        </div>

        {/* Info descriptions text */}
        <div className="min-w-0">
          <h4 className={`text-xs md:text-sm font-bold truncate transition-colors ${
            isCompleted ? 'text-[#5C5A78] line-through' : 'text-white'
          }`}>
            {title}
          </h4>
          <p className="text-[10px] text-[#A2A0C2] truncate max-w-[200px] sm:max-w-xs md:max-w-md mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* Button link trigger */}
      <span className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] text-[10px] font-bold uppercase tracking-wider transition-all shrink-0">
        Open
      </span>
    </motion.div>
  );
}
