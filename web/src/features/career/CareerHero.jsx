import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';

function MatchScoreCircle({ score = 85 }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius; // ~150.8
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-16 flex items-center justify-center shrink-0 select-none">
      <svg className="size-full rotate-[-90deg]">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="4"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="transparent"
          stroke="#22D3EE"
          strokeWidth="4"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-extrabold font-mono text-white leading-none">
          {score}%
        </span>
        <span className="text-[7px] text-[#22D3EE] font-bold tracking-widest mt-0.5 uppercase leading-none font-mono">
          MATCH
        </span>
      </div>
    </div>
  );
}

export default function CareerHero({ career }) {
  const navigate = useNavigate();
  const { slug } = useParams();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-[0_0_50px_rgba(139,92,246,0.02)]"
    >
      {/* Background decoration glows */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-violet-500/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[20%] h-[20%] bg-cyan-500/5 blur-[50px] pointer-events-none rounded-full" />

      <div className="flex-1 space-y-4 relative z-10 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1 bg-white/5 border border-white/10 text-xs font-semibold text-[#A78BFA] rounded-full uppercase tracking-wider select-none">
            {career.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 animate-pulse" />
            <span>AI Analyzed Profile Fit</span>
          </div>
        </div>

        <motion.h1
          layoutId="career-title"
          className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-none select-none"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {career.title}
        </motion.h1>

        <p className="text-sm md:text-base text-[#9D99B8] leading-relaxed max-w-3xl pr-4">
          {career.description}
        </p>

        <div className="pt-2">
          <button
            onClick={() => navigate(`/careers/${slug}/path`)}
            className="px-6 py-3.5 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 hover:from-violet-600 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] cursor-pointer select-none"
          >
            Explore Career Path
          </button>
        </div>
      </div>

      {/* Match Score circle on the right */}
      <div className="shrink-0 flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative z-10">
        <MatchScoreCircle score={career.fit_score} />
        <div className="space-y-1">
          <div className="text-xs font-extrabold text-[#EEEAF8] tracking-wide">
            Highly Compatible
          </div>
          <div className="text-[10px] text-[#9D99B8] leading-normal max-w-[130px]">
            Based on matching skills taxonomy with your profile credentials.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
