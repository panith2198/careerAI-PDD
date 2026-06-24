import React from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/common/Logo';

export default function AIStreamingIndicator() {
  const dotTransition = {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  return (
    <div className="flex gap-3 py-4 items-start select-none">
      {/* Avatar */}
      <motion.div
        animate={{ borderColor: ['rgba(139, 92, 246, 0.2)', 'rgba(34, 211, 238, 0.3)', 'rgba(139, 92, 246, 0.2)'] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/15 to-cyan-600/10 border border-violet-500/15 flex items-center justify-center shrink-0 mt-0.5"
      >
        <Logo className="size-4" />
      </motion.div>

      {/* Thinking dots */}
      <div className="flex items-center gap-1.5 pt-2">
        <motion.span
          animate={{ opacity: [0.2, 1], scale: [0.85, 1] }}
          transition={{ ...dotTransition, delay: 0 }}
          className="size-1.5 rounded-full bg-violet-400"
        />
        <motion.span
          animate={{ opacity: [0.2, 1], scale: [0.85, 1] }}
          transition={{ ...dotTransition, delay: 0.15 }}
          className="size-1.5 rounded-full bg-white/40"
        />
        <motion.span
          animate={{ opacity: [0.2, 1], scale: [0.85, 1] }}
          transition={{ ...dotTransition, delay: 0.3 }}
          className="size-1.5 rounded-full bg-violet-400"
        />
      </div>
    </div>
  );
}
