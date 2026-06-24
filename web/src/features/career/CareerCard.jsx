import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Briefcase01Icon, BrainIcon, AnalyticsUpIcon, RouteIcon } from '@hugeicons/core-free-icons';

function MatchScoreCircle({ score = 85 }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius; // ~113.1
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-12 flex items-center justify-center shrink-0 select-none">
      <svg className="size-full rotate-[-90deg]">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="3.5"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="transparent"
          stroke="#22D3EE"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[10px] font-extrabold font-mono text-white leading-none">
          {score}%
        </span>
        <span className="text-[6px] text-[#22D3EE] font-bold tracking-widest mt-0.5 uppercase leading-none font-mono">
          FIT
        </span>
      </div>
    </div>
  );
}

const getCareerIcon = (title = '', category = '') => {
  const t = title.toLowerCase();
  const c = category.toLowerCase();
  if (t.includes('ai') || t.includes('machine') || t.includes('intelligence') || t.includes('data')) {
    return BrainIcon;
  }
  if (c.includes('tech') || t.includes('developer') || t.includes('engineer')) {
    return RouteIcon;
  }
  if (c.includes('finance') || c.includes('business') || t.includes('analyst')) {
    return AnalyticsUpIcon;
  }
  return Briefcase01Icon;
};

export default function CareerCard({ career }) {
  const navigate = useNavigate();
  const icon = getCareerIcon(career.title, career.category);

  const formatSalary = (min, max) => {
    if (!min && !max) return '₹8L - ₹18L';
    const formatLakh = (val) => `₹${(val / 100000).toFixed(0)}L`;
    if (min && max) return `${formatLakh(min)} - ${formatLakh(max)}`;
    if (min) return `${formatLakh(min)}+`;
    return `${formatLakh(max)}`;
  };

  // Limit skill chips to 3 maximum
  const displaySkills = career.skills ? career.skills.slice(0, 3) : [];
  const extraSkillsCount = career.skills ? Math.max(0, career.skills.length - 3) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.3)', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.08)' }}
      transition={{ duration: 0.25 }}
      className="bg-[#161525] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-full hover:shadow-[0_0_20px_rgba(139,92,246,0.06)] min-h-[280px]"
    >
      <div className="space-y-4">
        {/* Top row: Icon and Match Score */}
        <div className="flex items-center justify-between">
          <span className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-xl shrink-0">
            <HugeiconsIcon icon={icon} className="size-5" />
          </span>
          <MatchScoreCircle score={career.fit_score} />
        </div>

        {/* Content row: Title & description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white leading-snug truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {career.title}
          </h3>
          <p className="text-xs text-[#9D99B8] leading-relaxed line-clamp-3">
            {career.description}
          </p>
        </div>

        {/* Skills row */}
        <div className="flex flex-wrap items-center gap-1.5 select-none pt-1">
          {displaySkills.map((sk) => (
            <span
              key={sk}
              className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[10px] font-medium text-[#EEEAF8]"
            >
              {sk}
            </span>
          ))}
          {extraSkillsCount > 0 && (
            <span className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-[10px] font-bold text-[#A78BFA]">
              +{extraSkillsCount}
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: Salary and View Button */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4">
        <span className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] rounded-full text-xs font-semibold whitespace-nowrap font-mono select-none">
          {formatSalary(career.avg_salary_min, career.avg_salary_max)}
        </span>

        <button
          onClick={() => career.slug && career.slug !== 'undefined' && navigate(`/careers/${career.slug}`)}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0 cursor-pointer"
        >
          View Career
        </button>
      </div>
    </motion.div>
  );
}
