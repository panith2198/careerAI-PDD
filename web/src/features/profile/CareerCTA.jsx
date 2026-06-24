import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';

export default function CareerCTA() {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gradient-to-br from-violet-600/10 via-indigo-600/10 to-[#22D3EE]/5 border border-violet-500/20 backdrop-blur-2xl rounded-3xl p-6 flex flex-col gap-5 shadow-[0_15px_40px_rgba(139,92,246,0.08)] relative overflow-hidden select-none">
      {/* Animated glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-600/15 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-cyan-500/15 blur-[60px] pointer-events-none" />

      <div className="space-y-2.5 relative z-10 w-full">
        <span className="text-[9px] font-bold font-mono text-[#22D3EE] uppercase tracking-widest bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/20 inline-block shadow-sm">
          AI Recommendation
        </span>
        <h3 className="text-base font-extrabold text-white leading-tight font-sans">
          Discover your next career path
        </h3>
        <p className="text-xs text-[#A2A0C2] leading-relaxed font-sans">
          Compare skill validation gaps, simulate transition steps, and explore customized learning roadmaps instantly.
        </p>
      </div>

      <button
        onClick={() => navigate('/careers/recommend')}
        className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_22px_rgba(139,92,246,0.35)] flex items-center justify-center gap-2 cursor-pointer relative z-10 font-mono active:scale-[0.98]"
      >
        <HugeiconsIcon icon={SparklesIcon} className="size-4 text-[#22D3EE] animate-pulse" />
        <span>Explore Careers</span>
      </button>
    </div>
  );
}
