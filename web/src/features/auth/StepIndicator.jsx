import React from 'react';
import { motion } from 'framer-motion';

export default function StepIndicator({ currentStep }) {
  const isStep2 = currentStep === 2;

  // Step states
  // Inactive: #5C5A78
  // Active: #8B5CF6
  // Completed: #22D3EE

  return (
    <div className="w-full flex flex-col gap-2 select-none mb-3">
      <div className="relative flex items-center justify-between w-full px-4">
        {/* Background connector line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-[#5C5A78]/30 z-0" />

        {/* Animated progress connector line */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] z-0 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isStep2 ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ right: '16px' }}
        />

        {/* Step 1: Account credentials node */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{
              backgroundColor: isStep2 ? '#22D3EE' : '#8B5CF6',
              boxShadow: isStep2
                ? '0 0 12px rgba(34, 211, 238, 0.4)'
                : '0 0 12px rgba(139, 92, 246, 0.6)',
              scale: isStep2 ? 1 : 1.15,
            }}
            transition={{ duration: 0.3 }}
            className="size-5 rounded-full flex items-center justify-center border border-black/40"
          >
            {isStep2 && (
              <svg
                className="size-3 text-[#060608] stroke-[3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
        </div>

        {/* Step 2: Profile node */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{
              backgroundColor: isStep2 ? '#8B5CF6' : '#5C5A78',
              boxShadow: isStep2 ? '0 0 12px rgba(139, 92, 246, 0.6)' : 'none',
              scale: isStep2 ? 1.15 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="size-5 rounded-full flex items-center justify-center border border-black/40"
          />
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between w-full px-2 text-[11px] font-semibold uppercase tracking-wider">
        <motion.span
          animate={{ color: isStep2 ? '#22D3EE' : '#8B5CF6' }}
          className="transition-colors duration-300"
        >
          Account
        </motion.span>
        <motion.span
          animate={{ color: isStep2 ? '#8B5CF6' : '#5C5A78' }}
          className="transition-colors duration-300"
        >
          Profile
        </motion.span>
      </div>
    </div>
  );
}
