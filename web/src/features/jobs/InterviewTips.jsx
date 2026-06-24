import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, ArrowDown01Icon } from '@hugeicons/core-free-icons';

export default function InterviewTips({ tips }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:border-white/15">
      {/* Header triggers click */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 md:p-6 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg shrink-0">
            <HugeiconsIcon icon={SparklesIcon} className="size-4.5 text-[#22D3EE] animate-pulse" />
          </span>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
            AI Interview Preparation
          </h3>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 shrink-0" />
        </motion.div>
      </div>

      {/* Accordion list details */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden border-t border-white/5 bg-white/[0.005]"
          >
            <div className="p-5 md:p-6 text-xs md:text-sm text-[#A2A0C2] leading-relaxed prose prose-invert max-w-none select-none">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-4 text-[#A2A0C2]" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-white font-bold text-xs font-mono uppercase tracking-wider mt-4 mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-[#A2A0C2]" {...props} />,
                  li: ({ node, ...props }) => <li className="text-xs md:text-sm" {...props} />,
                  strong: ({ node, ...props }) => <strong className="text-[#22D3EE] font-bold" {...props} />,
                }}
              >
                {tips || 'Compiling custom questions and target answer frameworks for this position...'}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
