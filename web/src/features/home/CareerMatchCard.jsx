import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

// Custom SVG Circular Progress Component
function CircularProgress({ score }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // ~138.23
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-16 flex items-center justify-center shrink-0 select-none">
      <svg className="size-full rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="3.5"
        />
        {/* Progress circle with stroke animation */}
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="transparent"
          stroke="#8B5CF6"
          strokeWidth="4"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-extrabold font-mono text-white leading-none">
          {score}%
        </span>
        <span className="text-[7px] text-[#22D3EE] font-bold tracking-widest mt-0.5 leading-none uppercase">
          Match
        </span>
      </div>
    </div>
  );
}

// Helper to slugify titles for exploration routing
const getSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

// Helper to map salaries and skills fallback for visual telemetry depth
const getRoleMetaData = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('front') || lower.includes('web') || lower.includes('ui')) {
    return {
      salary: '₹8L - ₹15L',
      skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    };
  }
  if (lower.includes('back') || lower.includes('api') || lower.includes('server')) {
    return {
      salary: '₹9L - ₹18L',
      skills: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL'],
    };
  }
  if (lower.includes('data') || lower.includes('ai') || lower.includes('learn') || lower.includes('model')) {
    return {
      salary: '₹12L - ₹25L',
      skills: ['Python', 'PyTorch', 'SQL', 'LLMs'],
    };
  }
  return {
    salary: '₹7L - ₹14L',
    skills: ['Git', 'Docker', 'AWS', 'Linux'],
  };
};

export default function CareerMatchCard({ careers = [] }) {
  const navigate = useNavigate();

  if (!careers || careers.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
        <span className="text-sm text-[#5C5A78]">No career matches calculated yet. Complete onboarding setup to generate.</span>
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-visible">
      {/* Horizontal Carousel Container */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {careers.map((career, idx) => {
          const meta = getRoleMetaData(career.title);
          const score = Math.round(career.fit_score || 75);
          const skillsToShow = meta.skills.slice(0, 3);
          const overflow = meta.skills.length - skillsToShow.length;

          return (
            <motion.div
              key={career.career_id || idx}
              whileHover={{ scale: 1.03, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-[320px] shrink-0 bg-[#161525] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4 snap-start hover:border-violet-500/40 hover:shadow-[0_10px_30px_-10px_rgba(139,92,246,0.3)] transition-colors duration-300 cursor-default"
            >
              {/* Header Title & Fit Ring */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono tracking-widest text-[#5C5A78] uppercase">
                    AI recommendation
                  </span>
                  <h3 className="text-lg font-bold text-[#EEEAF8] line-clamp-2 leading-snug">
                    {career.title}
                  </h3>
                </div>
                <CircularProgress score={score} />
              </div>

              {/* Salary & Details */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[#9D99B8]">Average Salary</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-gradient-to-r from-[#8B5CF6]/10 to-[#22D3EE]/10 border border-violet-500/20 text-[#22D3EE] rounded-lg">
                  {meta.salary}
                </span>
              </div>

              {/* Skills Area */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold text-[#5C5A78] uppercase tracking-wider">Required Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillsToShow.map((s, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-white/5 text-[#9D99B8] rounded-md border border-white/5"
                    >
                      {s}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/5 text-[#A78BFA] rounded-md">
                      +{overflow}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Explorer Button */}
              <motion.button
                onClick={() => navigate(`/careers/${career.slug || getSlug(career.title)}`)}
                whileTap={{ scale: 0.97 }}
                className="w-full h-10 mt-2 bg-white/5 border border-white/10 hover:bg-violet-600 hover:border-violet-500 text-xs font-semibold rounded-xl text-[#EEEAF8] transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
              >
                <span>Explore Path</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-3.5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
