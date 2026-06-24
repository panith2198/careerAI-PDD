import React from 'react';
import { motion } from 'framer-motion';
import MarkdownRenderer from '@/features/chat/MarkdownRenderer';

export default function AnswerOption({ id, letter, text, isSelected, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
      whileTap={{ scale: 0.99 }}
      animate={{ scale: isSelected ? 1.02 : 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer border transition-all duration-300 backdrop-blur-xl ${
        isSelected
          ? 'bg-violet-500/20 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-white'
          : 'bg-white/5 border-white/10 text-[#A2A0C2] hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3.5 w-full">
        {/* Option Letter Bubble */}
        <div className={`flex items-center justify-center size-8 rounded-lg text-xs font-bold font-mono transition-all duration-300 shrink-0 ${
          isSelected
            ? 'bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
            : 'bg-white/10 text-white group-hover:bg-white/15'
        }`}>
          {letter}
        </div>
        
        {/* Option Text */}
        <div className="text-[14px] font-medium leading-relaxed select-none cursor-pointer flex-grow prose-sm max-w-full overflow-hidden">
          <MarkdownRenderer content={text} />
        </div>
      </div>
    </motion.div>
  );
}
