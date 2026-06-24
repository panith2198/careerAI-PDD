import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';

export default function AuthCard({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[420px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] flex flex-col gap-6"
    >
      {/* Header Section */}
      <div className="flex flex-col items-center text-center">
        {/* Animated Spark Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="size-12 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-4"
        >
          <HugeiconsIcon icon={SparklesIcon} className="size-6 text-white" strokeWidth={2} />
        </motion.div>

        {/* Title */}
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[#EEEAF8] mb-1">
          Welcome back
        </h2>

        {/* Subtitle */}
        <p className="text-xs text-[#9D99B8] px-2 leading-relaxed">
          Sign in to continue your AI career journey
        </p>
      </div>

      {/* Form Content */}
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </motion.div>
  );
}
