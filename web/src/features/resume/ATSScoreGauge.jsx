import React from 'react';
import { motion } from 'framer-motion';

export default function ATSScoreGauge({ score = 0 }) {
  const safeScore = Math.min(100, Math.max(0, score));

  // Determine color coding based on range
  const getColor = (val) => {
    if (val < 50) return '#EF4444'; // Red
    if (val < 75) return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };

  // Determine Grade Letter
  const getGrade = (val) => {
    if (val >= 90) return 'A';
    if (val >= 80) return 'B';
    if (val >= 70) return 'C';
    if (val >= 60) return 'D';
    return 'F';
  };

  const color = getColor(safeScore);
  const grade = getGrade(safeScore);

  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-white/[0.00] pointer-events-none" />
      
      <div className="relative size-36 flex items-center justify-center">
        {/* SVG Circular Track and Progress */}
        <svg className="size-full -rotate-90">
          {/* Background track */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Active progress */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke={color}
            strokeWidth="5.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - safeScore / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ originX: '72px', originY: '72px' }}
          />
        </svg>

        {/* Center Labels */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span 
            className="text-4xl font-black text-white leading-none font-mono tracking-tighter"
            style={{ textShadow: `0 0 20px ${color}30` }}
          >
            {Math.round(safeScore)}
          </span>
          <span 
            className="text-xs font-mono font-bold mt-1 uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
            style={{ 
              color: color, 
              borderColor: `${color}30`, 
              backgroundColor: `${color}10`,
              boxShadow: `0 0 10px ${color}15`
            }}
          >
            Grade {grade}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
          ATS Compatibility
        </h4>
        <p className="text-[10px] text-[#A2A0C2] max-w-[200px] leading-relaxed">
          {safeScore >= 75 
            ? 'Excellent keyword optimization and layout compliance.' 
            : safeScore >= 50 
            ? 'Moderate indexing compatibility. Review missing skills.' 
            : 'Low parsability. Structure description statements with measurable impact.'}
        </p>
      </div>
    </motion.div>
  );
}
