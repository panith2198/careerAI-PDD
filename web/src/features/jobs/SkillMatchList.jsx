import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

export default function SkillMatchList({ requiredSkills = [], userSkills = [] }) {
  const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase().trim()));

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 relative overflow-hidden select-none">
      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-4 mb-4">
        Required Skills Check
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {requiredSkills.map((skill, index) => {
          const hasSkill = userSkillsSet.has(skill.toLowerCase().trim());
          return (
            <div
              key={index}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${
                hasSkill
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/5 border-rose-500/15 text-rose-400'
              }`}
            >
              <span className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-xs">
                {skill}
              </span>

              <div className="shrink-0 flex items-center gap-1.5">
                {hasSkill ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-wider">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-[#10B981]" />
                    <span>✓ Has Skill</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-wider">
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-rose-400" />
                    <span>✕ Missing</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
