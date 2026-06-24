import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import MarkdownRenderer from '@/features/chat/MarkdownRenderer';

export default function AIFeedbackCard({ feedback }) {
  return (
    <div className="w-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden select-none">
      {/* Background vector grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Header title */}
      <div className="flex items-center gap-2.5 border-b border-white/5 pb-4 relative z-10">
        <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg">
          <HugeiconsIcon icon={SparklesIcon} className="size-4.5 text-[#22D3EE] animate-pulse" />
        </span>
        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
          AI Diagnostic Feedback
        </h3>
      </div>

      {/* Markdown Content Container */}
      <div className="text-xs md:text-sm text-[#A2A0C2] leading-relaxed relative z-10">
        <MarkdownRenderer content={feedback || 'No diagnostic feedback is available for this assessment session.'} />
      </div>
    </div>
  );
}
