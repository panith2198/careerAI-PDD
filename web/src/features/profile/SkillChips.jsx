import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Award01Icon } from '@hugeicons/core-free-icons';

export default function SkillChips({ skills = [] }) {
  const navigate = useNavigate();

  // Proficiency-based styling map
  const getProficiencyStyle = (level) => {
    const l = level?.toLowerCase() || 'beginner';
    if (l === 'expert') {
      return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
    }
    if (l === 'advanced') {
      return 'bg-violet-500/5 border-violet-500/20 text-[#A78BFA]';
    }
    if (l === 'intermediate') {
      return 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400';
    }
    // Beginner
    return 'bg-slate-500/5 border-slate-500/15 text-slate-400';
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 relative overflow-hidden select-none shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
            Professional Skills
          </h3>
          <span className="text-[10px] font-mono font-bold text-[#A2A0C2] bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {skills.length}
          </span>
        </div>

        <button
          onClick={() => navigate('/profile/skills')}
          className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer font-mono"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
          <span>Manage</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {skills.map((s, idx) => (
          <div
            key={s.user_skill_id || idx}
            className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${getProficiencyStyle(
              s.proficiency_level
            )}`}
          >
            <span>{s.skill_name}</span>
            <span className="size-1 rounded-full bg-current opacity-40" />
            <span className="text-[9px] font-bold font-mono uppercase tracking-wider opacity-80">
              {s.proficiency_level}
            </span>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="w-full py-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
            <span className="p-3 bg-white/[0.02] border border-white/5 rounded-full inline-block text-[#5C5A78] mb-2">
              <HugeiconsIcon icon={Award01Icon} className="size-6 text-cyan-400" />
            </span>
            <p className="text-xs text-[#5C5A78] font-mono leading-none">
              No skills added yet. Click Manage to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
