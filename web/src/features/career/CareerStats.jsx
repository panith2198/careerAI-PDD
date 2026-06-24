import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnalyticsUpIcon, SparklesIcon, RouteIcon, Briefcase01Icon } from '@hugeicons/core-free-icons';

export default function CareerStats({ career }) {
  const stats = [
    {
      title: 'Growth Potential',
      value: `${career.growth_rate_pct || 12}% p.a.`,
      desc: 'Projected annual job demand growth rate',
      icon: AnalyticsUpIcon,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20'
    },
    {
      title: 'Industry Demand',
      value: `${career.demand_score || 75}/100`,
      desc: 'Current market hiring index score',
      icon: SparklesIcon,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Required Experience',
      value: career.difficulty_level ? career.difficulty_level.toUpperCase() : 'MEDIUM',
      desc: 'Entry barrier difficulty for newcomers',
      icon: RouteIcon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Time to Job Ready',
      value: `${career.time_to_ready_months || 6} Months`,
      desc: 'Average preparation duration to enter field',
      icon: Briefcase01Icon,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-[#161525] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-[140px] hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9D99B8]">
              {stat.title}
            </span>
            <span className={`p-1.5 rounded-lg border ${stat.bg} ${stat.color}`}>
              <HugeiconsIcon icon={stat.icon} className="size-4" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-white font-mono leading-none">
              {stat.value}
            </div>
            <div className="text-[10px] text-[#5C5A78] leading-tight">
              {stat.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
