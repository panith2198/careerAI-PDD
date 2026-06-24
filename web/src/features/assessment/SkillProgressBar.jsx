import React from 'react';
import { motion } from 'framer-motion';

export default function SkillProgressBar({ label, percentage, color }) {
  const barColor = color === 'cyan'
    ? 'from-[#22D3EE] to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
    : 'from-violet-500 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.2)]';

  const labelColor = color === 'cyan' ? 'text-cyan-400' : 'text-violet-400';

  return (
    <div className="space-y-1.5 w-full select-none">
      <div className="flex justify-between text-[11px] font-semibold font-mono tracking-wider uppercase">
        <span className="text-[#A2A0C2]">{label}</span>
        <span className={`font-bold ${labelColor}`}>{percentage}%</span>
      </div>
      <div className="h-2.5 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }}
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${barColor} rounded-full`}
        />
      </div>
    </div>
  );
}
