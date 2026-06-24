import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ExternalLinkIcon } from '@hugeicons/core-free-icons';

export default function CourseRecommendation({ course }) {
  const { title, provider, url } = course;

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200 select-none">
      <div className="min-w-0 flex-1">
        <h5 className="text-xs font-bold text-white truncate">
          {title}
        </h5>
        <p className="text-[9px] font-bold font-mono text-[#A78BFA] uppercase tracking-wider mt-0.5">
          {provider}
        </p>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
      >
        <span>Open Course</span>
        <HugeiconsIcon icon={ExternalLinkIcon} className="size-3.5 text-white/70" />
      </a>
    </div>
  );
}
