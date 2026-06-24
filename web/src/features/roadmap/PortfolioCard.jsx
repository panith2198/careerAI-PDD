import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CodeIcon } from '@hugeicons/core-free-icons';

export default function PortfolioCard({ project }) {
  if (!project) return null;
  const { title, description } = project;

  return (
    <div className="w-full bg-violet-500/[0.01] border border-violet-500/20 backdrop-blur-2xl rounded-3xl p-6 relative overflow-hidden select-none">
      {/* Technical striping pattern backing inside card */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,#8b5cf602_12.5%,transparent_12.5%,transparent_50%,#8b5cf602_50%,#8b5cf602_62.5%,transparent_62.5%,transparent)] bg-[size:16px_16px] pointer-events-none" />

      <div className="flex items-start gap-4 relative z-10">
        {/* Glow code icon circle */}
        <div className="size-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.12)]">
          <HugeiconsIcon icon={CodeIcon} className="size-5 text-[#22D3EE]" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold font-mono text-[#A78BFA] uppercase tracking-widest">
              Capstone Portfolio Challenge
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] text-[8px] font-mono font-bold uppercase">
              Project Output
            </span>
          </div>

          <h4 className="text-sm md:text-base font-extrabold text-white">
            {title || 'Milestone Implementation Project'}
          </h4>

          <p className="text-xs text-[#A2A0C2] leading-relaxed">
            {description || 'Build a fully operational sandbox application applying all technical patterns covered in this milestone to showcase in your growth portfolio.'}
          </p>
        </div>
      </div>
    </div>
  );
}
