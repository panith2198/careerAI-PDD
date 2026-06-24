import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Briefcase01Icon, BrainIcon, AnalyticsUpIcon, RouteIcon } from '@hugeicons/core-free-icons';

const getCareerIcon = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('ai') || t.includes('machine') || t.includes('intelligence') || t.includes('data')) {
    return BrainIcon;
  }
  if (t.includes('developer') || t.includes('engineer') || t.includes('web') || t.includes('code')) {
    return RouteIcon;
  }
  if (t.includes('analyst') || t.includes('finance') || t.includes('business')) {
    return AnalyticsUpIcon;
  }
  return Briefcase01Icon;
};

export default function CareerNode({ title, isCurrent, isTarget, x, y, slug, skillsCount = 10, difficulty = 'medium' }) {
  const navigate = useNavigate();
  const icon = getCareerIcon(title);

  const getDifficultyColor = () => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const borderClass = isCurrent
    ? 'border-violet-500/60 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/30'
    : isTarget
    ? 'border-cyan-500/60 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-500/30'
    : 'border-white/10 hover:border-white/20';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => slug && slug !== 'undefined' && navigate(`/careers/${slug}`)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 240,
        height: 125,
      }}
      className={`bg-white/[0.03] backdrop-blur-xl border rounded-2xl p-4 flex flex-col justify-between cursor-pointer select-none transition-shadow duration-300 ${borderClass}`}
    >
      <div className="flex items-start gap-3">
        <span className={`p-2 rounded-xl border shrink-0 ${
          isCurrent
            ? 'bg-violet-500/15 border-violet-500/30 text-[#A78BFA]'
            : isTarget
            ? 'bg-cyan-500/15 border-cyan-500/30 text-[#22D3EE]'
            : 'bg-white/5 border-white/5 text-[#9D99B8]'
        }`}>
          <HugeiconsIcon icon={icon} className="size-4.5" />
        </span>
        <div className="min-w-0 flex-grow">
          <div className="text-xs font-bold text-[#9D99B8] leading-none mb-1 font-mono uppercase tracking-wider">
            {isCurrent ? 'Current' : isTarget ? 'Target' : 'Transition'}
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
            {title}
          </h4>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-2">
        <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] text-[9px] font-bold rounded-full font-mono">
          {skillsCount} Skills
        </span>
        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-full font-mono uppercase ${getDifficultyColor()}`}>
          {difficulty}
        </span>
      </div>
    </motion.div>
  );
}
