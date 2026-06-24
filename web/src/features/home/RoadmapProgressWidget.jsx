import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, CourseIcon } from '@hugeicons/core-free-icons';

import { Progress } from '@/components/ui/progress';

export default function RoadmapProgressWidget({ roadmap }) {
  const navigate = useNavigate();
  const [animatedValue, setAnimatedValue] = useState(0);

  const completionPct = roadmap ? Math.round(roadmap.completion_pct) : 0;

  useEffect(() => {
    if (roadmap) {
      const timer = setTimeout(() => {
        setAnimatedValue(completionPct);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(0);
    }
  }, [completionPct, roadmap]);

  const handleCtaClick = () => {
    if (roadmap) {
      navigate(`/roadmap/${roadmap.roadmap_id}`);
    } else {
      navigate('/dashboard'); // default redirect
    }
  };

  return (
    <div className="w-full h-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-violet-500/20 transition-all duration-300">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <h3 
          className="text-base font-bold text-[#EEEAF8]"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Learning Roadmap Progress
        </h3>
        <span className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20 text-[#A78BFA]">
          <HugeiconsIcon icon={CourseIcon} className="size-4" />
        </span>
      </div>

      {roadmap ? (
        <div className="flex flex-col gap-4 flex-1 justify-center">
          {/* Active Phase Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 text-[#A78BFA] rounded-full uppercase tracking-wider">
              Phase {completionPct < 40 ? '1' : completionPct < 80 ? '2' : '3'}
            </span>
            <span className="text-xs text-[#9D99B8]">
              {completionPct < 40 ? 'Core Foundations' : completionPct < 80 ? 'Skill Development' : 'Expert Specialization'}
            </span>
          </div>

          {/* Milestone Title */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-[#5C5A78] uppercase tracking-wider">Current Milestone</span>
            <span className="text-sm font-bold text-[#EEEAF8] line-clamp-1">
              {completionPct < 40 
                ? 'Establish baseline environment & tools setup' 
                : completionPct < 80 
                  ? 'Complete advanced framework concepts & state management' 
                  : 'Deploy sandbox project with JWT authorization integration'}
            </span>
          </div>

          {/* Progress Tracker */}
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#5C5A78] uppercase">Completion</span>
              <span className="text-[#22D3EE] font-bold">{completionPct}%</span>
            </div>
            <Progress 
              value={animatedValue} 
              className="h-2 bg-white/5 [&>[data-slot=progress-indicator]]:bg-gradient-to-r [&>[data-slot=progress-indicator]]:from-[#8B5CF6] [&>[data-slot=progress-indicator]]:to-[#22D3EE]" 
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-2xl flex-1 gap-2">
          <span className="text-xs text-[#9D99B8]">No active career roadmap generated yet.</span>
          <span className="text-[10px] text-[#5C5A78]">Personalize your experience to start tracking milestone completion metrics.</span>
        </div>
      )}

      {/* Continue CTA */}
      <motion.button
        onClick={handleCtaClick}
        whileTap={{ scale: 0.97 }}
        className="w-full h-11 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 shadow-[0_4px_20px_rgba(109,40,217,0.25)] border-0 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer group"
      >
        <span>{roadmap ? 'Continue Learning' : 'Generate Roadmap'}</span>
        <HugeiconsIcon 
          icon={ArrowRight01Icon} 
          className="size-4 group-hover:translate-x-0.5 transition-transform" 
          strokeWidth={2.5} 
        />
      </motion.button>
    </div>
  );
}
