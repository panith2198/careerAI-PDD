import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Task01Icon, RouteIcon, Briefcase01Icon, SearchIcon } from '@hugeicons/core-free-icons';

export default function CareerCTA({ slug, careerId }) {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Generate Roadmap',
      desc: 'Let AI build a week-by-week study plan to master this career path.',
      icon: RouteIcon,
      path: careerId ? `/roadmap?careerId=${careerId}` : '/roadmap',
      isPrimary: true
    },
    {
      title: 'Explore Career Path',
      desc: 'Visualize dynamic paths and transitions to reach this role.',
      icon: RouteIcon,
      path: `/careers/${slug}/path`,
      isPrimary: true
    },
    {
      title: 'Take Skill Assessment',
      desc: 'Quiz yourself and prove proficiency in required skills.',
      icon: Task01Icon,
      path: careerId ? `/assessments?careerId=${careerId}` : '/assessments',
      isPrimary: false
    },
    {
      title: 'Find Semantic Jobs',
      desc: 'Scan job listings looking for candidates with this skill profile.',
      icon: SearchIcon,
      path: `/jobs?career=${slug}`,
      isPrimary: false
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        AI Career Action Center
      </h3>
      <div className="grid grid-cols-4 gap-6 w-full">
        {actions.map((act) => (
          <div
            key={act.title}
            className="bg-[#161525] border border-white/10 rounded-2xl p-6 flex flex-col justify-between items-start gap-4 hover:border-violet-500/20 transition-all duration-300 min-h-[170px]"
          >
            <div className="flex items-start gap-4.5">
              <span className={`p-3 rounded-2xl border shrink-0 ${
                act.isPrimary
                  ? 'bg-violet-500/10 border-violet-500/20 text-[#A78BFA]'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-[#22D3EE]'
              }`}>
                <HugeiconsIcon icon={act.icon} className="size-6" />
              </span>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white leading-none">
                  {act.title}
                </h4>
                <p className="text-xs text-[#9D99B8] leading-relaxed">
                  {act.desc}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (act.path.includes('undefined')) return;
                navigate(act.path);
              }}
              disabled={act.path.includes('undefined')}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center ${
                act.path.includes('undefined')
                  ? 'opacity-40 cursor-not-allowed bg-[#1f1e2e] border border-white/5 text-[#5c5a78]'
                  : act.isPrimary
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
              }`}
            >
              Launch Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
