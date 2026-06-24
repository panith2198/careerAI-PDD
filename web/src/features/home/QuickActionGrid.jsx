import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Briefcase01Icon,
  Task01Icon,
  ChatBotIcon,
  SearchIcon,
  Note01Icon,
  AnalyticsUpIcon,
} from '@hugeicons/core-free-icons';

export default function QuickActionGrid({ jobsCount = 8 }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'careers',
      label: 'Career Paths',
      icon: Briefcase01Icon,
      path: '/careers',
      color: 'from-violet-500/20 to-fuchsia-500/20',
      textColor: 'text-violet-400',
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: Task01Icon,
      path: '/assessments',
      color: 'from-cyan-500/20 to-blue-500/20',
      textColor: 'text-cyan-400',
    },
    {
      id: 'chat',
      label: 'AI Advisor Chat',
      icon: ChatBotIcon,
      path: '/chat',
      color: 'from-emerald-500/20 to-teal-500/20',
      textColor: 'text-emerald-400',
      special: true,
    },
    {
      id: 'jobs',
      label: 'Job Postings',
      icon: SearchIcon,
      path: '/jobs',
      color: 'from-sky-500/20 to-indigo-500/20',
      textColor: 'text-sky-400',
      badge: `${jobsCount} Matches`,
    },
    {
      id: 'resume',
      label: 'Resume Analysis',
      icon: Note01Icon,
      path: '/resume/upload',
      color: 'from-amber-500/20 to-orange-500/20',
      textColor: 'text-amber-400',
    },
    {
      id: 'analytics',
      label: 'Profile Status',
      icon: AnalyticsUpIcon,
      path: '/profile',
      color: 'from-pink-500/20 to-rose-500/20',
      textColor: 'text-pink-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full select-none">
      {actions.map((act) => (
        <motion.div
          key={act.id}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(act.path)}
          className="h-[130px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between items-start cursor-pointer hover:border-white/20 hover:bg-white/[0.05] transition-colors duration-200 group"
        >
          {/* Top Row: Icon Container and Optional Badge */}
          <div className="w-full flex items-start justify-between">
            <div className={`size-10 rounded-xl bg-gradient-to-br ${act.color} border border-white/5 flex items-center justify-center ${act.textColor} group-hover:scale-110 transition-transform duration-200`}>
              <HugeiconsIcon icon={act.icon} className="size-5" strokeWidth={2.5} />
            </div>
            {act.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE] rounded-md shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                {act.badge}
              </span>
            )}
          </div>

          {/* Label */}
          <div className="flex flex-col gap-0.5 mt-2">
            <span className="text-sm font-bold text-[#EEEAF8] tracking-tight group-hover:text-white">
              {act.label}
            </span>
            <span className="text-[9px] text-[#5C5A78] uppercase font-mono tracking-wider">
              {act.special ? 'Active Agent' : 'Module Launcher'}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
