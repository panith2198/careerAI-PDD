import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon, ArrowUp01Icon, SparklesIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

export default function SkillsAnalytics({ data }) {
  const skillsList = useMemo(() => {
    const progress = data?.skill_progress || [];
    return progress.map((skill, index) => {
      // Generate deterministic growth rate and target score for visuals
      const score = Math.round(skill.proficiency_score) || 45;
      const growthRate = Math.round(((skill.skill_id * 7) % 15) + 6); // e.g. +6% to +20%
      
      return {
        ...skill,
        proficiency_score: score,
        growth: growthRate
      };
    });
  }, [data?.skill_progress]);

  // Target requirement mapping based on level
  const getRequiredScore = (level) => {
    const l = level?.toLowerCase() || 'beginner';
    if (l === 'expert') return 90;
    if (l === 'advanced') return 75;
    if (l === 'intermediate') return 60;
    return 45;
  };

  // Sparkline data generator
  const getSparklineData = (score) => {
    return [
      { val: Math.max(10, score - 15) },
      { val: Math.max(15, score - 8) },
      { val: Math.max(20, score - 12) },
      { val: Math.max(10, score - 3) },
      { val: score }
    ];
  };

  const getProficiencyColor = (level) => {
    const l = level?.toLowerCase() || 'beginner';
    if (l === 'expert') return 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20';
    if (l === 'advanced') return 'text-[#A78BFA] border-violet-500/20 bg-violet-950/20';
    if (l === 'intermediate') return 'text-cyan-400 border-cyan-500/20 bg-cyan-950/20';
    return 'text-slate-400 border-slate-500/10 bg-slate-950/10';
  };

  if (skillsList.length === 0) {
    return (
      <div className="col-span-2 text-center py-12 bg-white/[0.01] border border-white/5 rounded-3xl select-none relative z-10">
        <p className="text-xs font-mono text-[#5C5A78] uppercase tracking-wider">No technical skills recorded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none relative z-10">
      {skillsList.map((skill) => {
        const requiredScore = getRequiredScore(skill.proficiency_level);
        const currentScore = skill.proficiency_score;
        const sparkData = getSparklineData(currentScore);

        return (
          <motion.div
            key={skill.skill_id}
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 }
            }}
            className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300"
          >
            {/* Ambient card background glow */}
            <div className="absolute -right-20 -bottom-20 w-36 h-36 rounded-full bg-violet-600/[0.04] group-hover:bg-violet-600/[0.06] blur-[30px] transition-all duration-500" />

            {/* Header info row */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white leading-snug group-hover:text-violet-400 transition-colors">
                  {skill.skill_name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold font-mono border uppercase tracking-wider ${getProficiencyColor(skill.proficiency_level)}`}>
                    {skill.proficiency_level}
                  </span>
                  {skill.is_verified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-500/10 uppercase">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-2 text-cyan-400" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Sparkline & Growth indicators */}
              <div className="flex items-center gap-3">
                {/* Mini Recharts Sparkline */}
                <div className="w-16 h-8 opacity-65 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke="#8B5CF6"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Positive Growth rate badge */}
                <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-500/10">
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3 text-emerald-400" />
                  <span>+{skill.growth}%</span>
                </span>
              </div>
            </div>

            {/* Comparisons current vs required bars */}
            <div className="space-y-3 font-mono text-[9px] text-[#A2A0C2] mt-1">
              {/* Labels */}
              <div className="flex justify-between items-center uppercase tracking-wider text-[8px] text-[#5C5A78]">
                <span>Progress Standing</span>
                <div className="flex gap-3">
                  <span>Current: <strong className="text-white">{currentScore}%</strong></span>
                  <span>Required: <strong className="text-violet-400">{requiredScore}%</strong></span>
                </div>
              </div>

              {/* Bar track container */}
              <div className="space-y-1.5">
                {/* Current level bar track */}
                <div className="space-y-0.5">
                  <span className="text-[7px] text-[#5C5A78] uppercase">Current Level</span>
                  <div className="h-2 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500"
                    />
                  </div>
                </div>

                {/* Required level bar track */}
                <div className="space-y-0.5">
                  <span className="text-[7px] text-[#5C5A78] uppercase">Target Competency Bound</span>
                  <div className="h-2 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${requiredScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-[#3F3F46]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
