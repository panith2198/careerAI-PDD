import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreGauge({ score }) {
  const percentage = score || 0;
  
  // Choose colors based on performance
  let glowColor = 'shadow-[0_0_35px_rgba(139,92,246,0.22)]';
  let strokeGradient = ['#8B5CF6', '#22D3EE']; // Violet/Cyan
  let textColor = 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400';

  if (percentage < 50) {
    glowColor = 'shadow-[0_0_35px_rgba(244,63,94,0.25)]';
    strokeGradient = ['#EF4444', '#F43F5E']; // Red/Rose
    textColor = 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400';
  } else if (percentage < 70) {
    glowColor = 'shadow-[0_0_35px_rgba(245,158,11,0.2)]';
    strokeGradient = ['#F59E0B', '#D97706']; // Amber
    textColor = 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500';
  }

  // Circle configurations
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const pathLengthTarget = percentage / 100;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative flex items-center justify-center size-52 select-none"
    >
      {/* Background glass blur backer */}
      <div className={`absolute inset-4 rounded-full bg-black/45 backdrop-blur-xl border border-white/[0.04] ${glowColor} -z-10`} />

      <svg className="size-full -rotate-90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeGradient[0]} />
            <stop offset="100%" stopColor={strokeGradient[1]} />
          </linearGradient>
        </defs>

        {/* Underlay Track */}
        <circle
          cx="104"
          cy="104"
          r={radius}
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress Stroke */}
        <motion.circle
          cx="104"
          cy="104"
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pathLengthTarget) }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-[44px] font-black leading-none tracking-tight font-mono ${textColor}`}>
          {Math.round(percentage)}%
        </span>
        <span className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-widest mt-1.5 font-mono">
          Score
        </span>
      </div>
    </motion.div>
  );
}
