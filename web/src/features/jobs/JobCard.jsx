import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, Briefcase01Icon, Location01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function JobCard({ job, matchScore = 75, isSaved = false, onSaveToggle }) {
  const navigate = useNavigate();
  const { job_id, title, company_name, company_logo_url, location_city, work_mode, job_type, salary_min, salary_max, required_skills_json = [], job_url } = job;

  // Local state to play click animations instantly
  const [localSaved, setLocalSaved] = useState(isSaved);

  const handleSaveClick = (e) => {
    e.stopPropagation();
    const nextState = !localSaved;
    setLocalSaved(nextState);
    if (onSaveToggle) {
      onSaveToggle(job_id, nextState);
    }
  };

  const handleCardClick = () => {
    navigate(`/jobs/${job_id}`);
  };

  // Convert salary numbers to Lakhs format (e.g., 1800000 -> 18L)
  const formatSalary = (min, max) => {
    if (!min && !max) return '₹Not Disclosed';
    const minL = min ? `${Math.round(min / 100000)}L` : '';
    const maxL = max ? `${Math.round(max / 100000)}L` : '';
    return `₹${minL}${maxL ? ` - ₹${maxL}` : ''}`;
  };

  // Match score ring setup
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - matchScore / 100);

  return (
    <motion.div
      layout
      whileHover={{ y: -6, border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 12px 30px rgba(139, 92, 246, 0.15)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="w-full h-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-5 md:p-6 flex flex-col justify-between gap-6 cursor-pointer select-none group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.01] to-cyan-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top row: Avatar, Info, Match Score, Save toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <Avatar className="size-12 rounded-xl border border-white/5 bg-white/5 shadow-inner shrink-0">
            <AvatarImage src={company_logo_url || `https://logo.clearbit.com/${company_name.toLowerCase().replace(/\s+/g, '')}.com`} />
            <AvatarFallback className="rounded-xl text-[10px] font-black font-mono text-cyan-400 bg-white/5 uppercase select-none">
              {company_name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-extrabold text-white leading-tight truncate">
              {title}
            </h3>
            <span className="text-xs font-bold text-violet-400/90 mt-0.5 block truncate">
              {company_name}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-[#A2A0C2] font-semibold mt-1">
              <HugeiconsIcon icon={Location01Icon} className="size-3 text-cyan-400" />
              <span>{location_city || 'India'}</span>
              <span className="text-[#5C5A78]">•</span>
              <span className="capitalize">{work_mode}</span>
            </div>
          </div>
        </div>

        {/* Right side widgets: Match circle, bookmark */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Match Score Indicator */}
          <div className="relative size-12 flex items-center justify-center">
            <svg className="size-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="#22D3EE"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="shadow-[0_0_10px_rgba(34,211,238,0.2)]"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black font-mono text-white leading-none">
                {Math.round(matchScore)}%
              </span>
              <span className="text-[6px] font-mono text-cyan-400 font-bold uppercase scale-90">
                Fit
              </span>
            </div>
          </div>

          {/* Saved Heart Bookmark Button */}
          <motion.button
            type="button"
            onClick={handleSaveClick}
            whileTap={{ scale: 0.8 }}
            animate={{ scale: localSaved ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              localSaved 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                : 'bg-white/5 border-white/5 text-[#5C5A78] hover:text-rose-400 hover:border-rose-500/20'
            }`}
          >
            <HugeiconsIcon 
              icon={FavouriteIcon} 
              className={`size-4 shrink-0 ${localSaved ? 'fill-rose-500' : ''}`} 
            />
          </motion.button>
        </div>
      </div>

      {/* Middle row: Badges and Required Skills */}
      <div className="space-y-4">
        {/* Badge chips */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold font-mono">
          <span className="px-2.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] uppercase">
            {formatSalary(salary_min, salary_max)}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] uppercase">
            {work_mode}
          </span>
          {job_type && (
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
              {job_type}
            </span>
          )}
        </div>

        {/* Skill preview chips */}
        <div className="flex flex-wrap gap-1.5">
          {required_skills_json.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-medium text-[#A2A0C2] select-none">
              {skill}
            </span>
          ))}
          {required_skills_json.length > 4 && (
            <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold font-mono text-[#5C5A78]">
              +{required_skills_json.length - 4} More
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: Divider and CTA */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5 text-[10px] text-[#5C5A78] font-bold font-mono uppercase">
          <HugeiconsIcon icon={Briefcase01Icon} className="size-3.5 text-violet-400" />
          <span>AI Matched</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>View Details</span>
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
}
