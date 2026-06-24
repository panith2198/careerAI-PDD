import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, CircleIcon } from '@hugeicons/core-free-icons';

const steps = [
  { id: 0, label: 'Uploading Resume', description: 'Transmitting secure document payloads' },
  { id: 1, label: 'Extracting Content', description: 'OCR parsing and document block structuring' },
  { id: 2, label: 'Analyzing Skills', description: 'Jaccard intersection and semantic mapping' },
  { id: 3, label: 'Generating ATS Report', description: 'Index matching and recommendation summaries' },
  { id: 4, label: 'Complete', description: 'AI profile evaluation successfully compiled' }
];

export default function ProcessingTimeline({ currentStep = 0 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 select-none shadow-[0_15px_35px_rgba(0,0,0,0.3)]"
    >
      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
        Analysis Pipeline Telemetry
      </h4>

      <div className="relative pl-6 space-y-8">
        {/* Connecting vertical timeline track line */}
        <div className="absolute left-[11px] top-1.5 bottom-1.5 w-0.5 bg-white/5 pointer-events-none" />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className={`flex items-start gap-4 relative transition-colors duration-300 ${
                isPending ? 'opacity-30' : 'opacity-100'
              }`}
            >
              {/* Step indicator node */}
              <div className="absolute -left-[20px] top-0.5 z-10 flex items-center justify-center bg-[#060608] rounded-full size-6">
                {isCompleted ? (
                  <span className="text-emerald-400">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-pulse" />
                  </span>
                ) : isActive ? (
                  <span className="relative flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-3 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"></span>
                  </span>
                ) : (
                  <span className="text-[#5C5A78]">
                    <HugeiconsIcon icon={CircleIcon} className="size-4.5" />
                  </span>
                )}
              </div>

              {/* Step labels */}
              <div className="space-y-1">
                <h5
                  className={`text-xs font-bold uppercase tracking-wider font-mono transition-colors duration-300 ${
                    isActive ? 'text-violet-400' : isCompleted ? 'text-emerald-400' : 'text-[#A2A0C2]'
                  }`}
                >
                  {step.label}
                </h5>
                <p className="text-[10px] text-[#5C5A78] leading-relaxed font-mono">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
