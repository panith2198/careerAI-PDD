import React from 'react';
import { motion } from 'framer-motion';

export default function RoadmapProgress({ percentage }) {
  const pct = percentage || 0;
  
  const radius = 76;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const pathLengthTarget = pct / 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl w-full shadow-[0_15px_35px_rgba(0,0,0,0.35)] select-none">
      <h3 className="text-[10px] font-mono font-bold text-[#5C5A78] uppercase tracking-widest mb-4">
        Overall Progress
      </h3>
      
      <div className="relative flex items-center justify-center size-44">
        {/* Glow backing */}
        <div className="absolute inset-4 rounded-full bg-violet-600/5 blur-xl -z-10" />

        <svg className="size-full -rotate-90">
          <defs>
            <linearGradient id="roadmapProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>

          {/* Underlay Track */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Stroke */}
          <motion.circle
            cx="88"
            cy="88"
            r={radius}
            stroke="url(#roadmapProgressGrad)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pathLengthTarget) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[32px] font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 leading-none font-mono">
            {Math.round(pct)}%
          </span>
          <span className="text-[9px] font-mono font-bold text-[#9D99B8] uppercase tracking-widest mt-1">
            Complete
          </span>
        </div>
      </div>
    </div>
  );
}
