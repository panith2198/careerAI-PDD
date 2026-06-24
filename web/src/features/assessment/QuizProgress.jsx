import React from 'react';
import { motion } from 'framer-motion';

export default function QuizProgress({ currentQuestion, totalQuestions }) {
  const percentage = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <div className="w-full space-y-1.5 select-none">
      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">
        <span>Completion Progress</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="relative h-2 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-[#22D3EE] rounded-full shadow-[0_0_12px_rgba(139,92,246,0.25)]"
        />
      </div>
    </div>
  );
}
