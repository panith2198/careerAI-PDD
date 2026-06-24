import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Alert02Icon, BrainIcon } from '@hugeicons/core-free-icons';

export default function SkillGapList({ skills = [] }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-[320px] hover:border-violet-500/20 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg">
          <HugeiconsIcon icon={BrainIcon} className="size-4.5" />
        </span>
        <h4 className="text-sm font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Your Skill Gap Analysis
        </h4>
      </div>

      {/* Scrollable list of skills */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 space-y-2">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <div
              key={skill.name}
              className="bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between gap-4 transition-all duration-200 hover:bg-white/[0.03]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{skill.name}</span>
                  <span className={`text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded ${
                    skill.importance === 'must_have'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {skill.importance === 'must_have' ? 'Required' : 'Preferred'}
                  </span>
                </div>
                {!skill.has_skill && (
                  <p className="text-[9px] text-[#A78BFA] mt-0.5 font-mono">
                    Recommended learning path available
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {skill.has_skill ? (
                  <span className="text-[#10B981] flex items-center gap-1 text-xs font-semibold font-mono">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-[#10B981]" />
                    <span className="hidden sm:inline">Acquired</span>
                  </span>
                ) : (
                  <span className="text-[#F43F5E] flex items-center gap-1 text-xs font-semibold font-mono">
                    <HugeiconsIcon icon={Alert02Icon} className="size-4 text-[#F43F5E]" />
                    <span className="hidden sm:inline">Gap</span>
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-center text-xs text-[#5C5A78]">
            No skills cataloged for this role.
          </div>
        )}
      </div>
    </div>
  );
}
