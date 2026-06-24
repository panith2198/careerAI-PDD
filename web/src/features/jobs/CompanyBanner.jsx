import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Location01Icon, Clock01Icon, Briefcase01Icon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CompanyBanner({ job }) {
  const { title, company_name, company_url, company_logo_url, location_city, work_mode, job_type, salary_min, salary_max, currency, experience_min_months } = job;

  const formatSalary = (min, max) => {
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
    if (!min && !max) return `${sym}Not Disclosed`;
    const minL = min ? `${Math.round(min / 100000)}L` : '';
    const maxL = max ? `${Math.round(max / 100000)}L` : '';
    return `${sym}${minL}${maxL ? ` - ${sym}${maxL}` : ''}`;
  };

  const formatExp = (months) => {
    if (!months) return 'Fresher';
    const yrs = months / 12;
    return `${yrs} ${yrs === 1 ? 'Year' : 'Years'}`;
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.01] to-cyan-500/[0.01] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <div className="flex items-center gap-4 min-w-0 relative z-10">
        {/* Large company logo */}
        <Avatar className="size-16 rounded-2xl border border-white/10 bg-white/5 shadow-md shrink-0">
          <AvatarImage src={company_logo_url || `https://logo.clearbit.com/${company_name.toLowerCase().replace(/\s+/g, '')}.com`} />
          <AvatarFallback className="rounded-2xl text-sm font-black font-mono text-cyan-400 bg-white/5 uppercase select-none">
            {company_name.substring(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-1">
          {company_url ? (
            <a href={company_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors">
              {company_name}
            </a>
          ) : (
            <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest">
              {company_name}
            </span>
          )}
          <h2 className="text-xl md:text-3xl font-black text-white leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#A2A0C2] font-semibold mt-1">
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-cyan-400" />
              <span>{location_city || 'India'}</span>
            </div>
            <span className="text-[#5C5A78]">•</span>
            <span className="capitalize">{work_mode}</span>
          </div>
        </div>
      </div>

      {/* Stats details */}
      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5 shrink-0 relative z-10 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
          <span>{formatSalary(salary_min, salary_max)}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#A2A0C2] font-mono mt-1 font-bold">
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={Briefcase01Icon} className="size-3 text-violet-400" />
            <span>Exp: {formatExp(experience_min_months)}</span>
          </div>
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={Clock01Icon} className="size-3 text-cyan-400" />
            <span>{job_type ? job_type.replace('fulltime', 'Full-time').replace('parttime', 'Part-time').replace('internship', 'Internship').replace('contract', 'Contract') : 'Full-time'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
