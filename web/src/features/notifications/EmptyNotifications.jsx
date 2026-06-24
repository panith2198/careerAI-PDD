import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, SparklesIcon } from '@hugeicons/core-free-icons';

export default function EmptyNotifications() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-12 bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl shadow-xl border-dashed py-24 select-none relative overflow-hidden w-full"
    >
      {/* Decorative glow overlays */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/[0.03] rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-600/[0.02] rounded-full blur-[40px] pointer-events-none" />

      <div className="p-4 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 rounded-full mb-4 relative z-10 shadow-lg">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8 text-cyan-400" />
      </div>

      <div className="space-y-1 relative z-10">
        <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <HugeiconsIcon icon={SparklesIcon} className="size-3 text-cyan-400 animate-pulse" />
          <span>Status Clear</span>
        </span>
        <h3 className="text-sm font-bold text-white mb-1 font-mono uppercase tracking-wider">
          You're all caught up!
        </h3>
        <p className="text-xs text-[#5C5A78] max-w-xs leading-relaxed mx-auto">
          Your personal career assistant has no pending alerts at this moment. You will be notified of new job matches or roadmap progress instantly.
        </p>
      </div>
    </motion.div>
  );
}
