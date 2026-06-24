import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  BrainIcon, 
  ClipboardIcon, 
  CodeIcon, 
  AnalyticsUpIcon,
  Clock01Icon,
  HelpCircleIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';

import DifficultyBadge from './DifficultyBadge';
import ScoreChip from './ScoreChip';

export default function AssessmentCard({ assessment, pastScore }) {
  const { assessment_id, title, difficulty, total_questions, time_limit_minutes, career_title, skill_name } = assessment;

  // Dynamically resolve card icon based on name context
  const getIcon = () => {
    const titleLower = (title || '').toLowerCase();
    if (titleLower.includes('code') || titleLower.includes('kotlin') || titleLower.includes('programming') || titleLower.includes('python')) {
      return CodeIcon;
    }
    if (titleLower.includes('architecture') || titleLower.includes('components') || titleLower.includes('layout')) {
      return ClipboardIcon;
    }
    if (titleLower.includes('science') || titleLower.includes('data') || titleLower.includes('analysis')) {
      return AnalyticsUpIcon;
    }
    return BrainIcon;
  };

  const IconComponent = getIcon();

  return (
    <motion.div
      layout
      whileHover={{
        y: -6,
        boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15)'
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden group hover:border-violet-500/30"
    >
      {/* Background Glow Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.02] to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Glowing Icon Circle */}
        <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.1)] mb-4 select-none">
          <HugeiconsIcon icon={IconComponent} className="size-5 text-[#22D3EE] group-hover:scale-110 transition-transform duration-300" />
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-white tracking-tight leading-snug mb-1 font-sans">
          {title}
        </h3>

        {/* Dynamic Category/Skill Subtitles */}
        {(career_title || skill_name) && (
          <p className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono mb-3.5">
            {career_title || 'General'} • {skill_name || 'Skill'}
          </p>
        )}

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DifficultyBadge difficulty={difficulty} />
          {pastScore !== undefined && pastScore !== null && (
            <ScoreChip score={pastScore} />
          )}
        </div>
      </div>

      <div>
        {/* Metadata Details Row */}
        <div className="flex items-center gap-4 text-[11px] text-[#9D99B8] mb-5 font-semibold select-none border-t border-white/5 pt-4">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={HelpCircleIcon} className="size-3.5 text-violet-400" />
            <span>{total_questions} Questions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Clock01Icon} className="size-3.5 text-cyan-400" />
            <span>{time_limit_minutes} Min</span>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          to={`/assessments/${assessment_id}/quiz`}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] hover:from-[#5B21B6] hover:to-[#8B5CF6] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(109,40,217,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 select-none cursor-pointer"
        >
          <span>Start Assessment</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
