import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, RouteIcon, CheckmarkCircle02Icon, Alert02Icon } from '@hugeicons/core-free-icons';

function MatchScoreCircle({ score = 85 }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // ~138.2
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-14 flex items-center justify-center shrink-0 select-none">
      <svg className="size-full rotate-[-90deg]">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="3.5"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          fill="transparent"
          stroke="#8B5CF6"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[10px] font-extrabold font-mono text-white leading-none">
          {score}%
        </span>
        <span className="text-[5px] text-[#A78BFA] font-bold tracking-widest mt-0.5 uppercase leading-none font-mono">
          FIT
        </span>
      </div>
    </div>
  );
}

export default function RecommendationCard({ recommendation, careersList = [] }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate target URL slug
  const title = recommendation.title || 'Unspecified';
  const slug = recommendation.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  // Look up career profile skills list in careersList
  const matchedCareer = careersList.find((c) => c.title.toLowerCase() === title.toLowerCase());
  const allSkills = matchedCareer ? matchedCareer.skills : [];
  const missingSkills = recommendation.gap_skills?.missing || [];
  const acquiredSkills = allSkills.filter((s) => !missingSkills.includes(s));

  // Construct readable reasoning string
  const commonCount = recommendation.reasoning?.common_skills_count || 0;
  const reasoningText = `You share ${commonCount} key skills with this role. Your current skill profile matches the baseline taxonomy configurations, displaying high aptitude for key role benchmarks.`;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
      }}
      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/20 transition-all duration-300 min-h-[360px] relative overflow-hidden group shadow-lg"
    >
      <div className="space-y-4">
        {/* Header Title + Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 font-mono uppercase tracking-wider">
              <HugeiconsIcon icon={SparklesIcon} className="size-3 animate-pulse" />
              <span>Match Rank #{recommendation.rank}</span>
            </div>
            <h3 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {title}
            </h3>
            <span className="text-[10px] text-[#9D99B8] font-mono leading-none block">
              {matchedCareer?.category || 'Technology'}
            </span>
          </div>
          <MatchScoreCircle score={recommendation.fit_score} />
        </div>

        {/* Dynamic expandable reasoning text */}
        <div className="border-t border-white/5 pt-3.5 space-y-1">
          <motion.div
            initial={{ height: 38 }}
            animate={{ height: isExpanded ? 'auto' : 38 }}
            className="overflow-hidden text-[11px] text-[#9D99B8] leading-relaxed relative"
          >
            {reasoningText}
          </motion.div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-bold text-[#A78BFA] hover:text-[#C084FC] transition-colors cursor-pointer select-none"
          >
            {isExpanded ? 'Show Less' : 'View reasoning'}
          </button>
        </div>

        {/* Skill gaps lists */}
        <div className="space-y-2 border-t border-white/5 pt-3.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#5C5A78] font-mono select-none">
            Skills Breakdown
          </h4>
          
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto no-scrollbar">
            {/* Acquired Skills */}
            {acquiredSkills.slice(0, 3).map((sk) => (
              <span
                key={`acq-${sk}`}
                className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold font-mono flex items-center gap-1 select-none"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" />
                {sk}
              </span>
            ))}

            {/* Missing Skills */}
            {missingSkills.slice(0, 3).map((sk) => (
              <span
                key={`miss-${sk}`}
                className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[9px] font-bold font-mono flex items-center gap-1 select-none"
              >
                <HugeiconsIcon icon={Alert02Icon} className="size-3" />
                {sk}
              </span>
            ))}

            {/* Overflow counts */}
            {allSkills.length > 6 && (
              <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-[#9D99B8] rounded text-[9px] font-bold font-mono select-none">
                +{allSkills.length - 6} More
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Explore Button */}
      <div className="border-t border-white/5 pt-4 mt-6">
        <button
          onClick={() => navigate(`/careers/${slug}`)}
          className="w-full py-2.5 bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(139,92,246,0.15)] select-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          <HugeiconsIcon icon={RouteIcon} className="size-3.5" />
          <span>Explore Career</span>
        </button>
      </div>
    </motion.div>
  );
}
