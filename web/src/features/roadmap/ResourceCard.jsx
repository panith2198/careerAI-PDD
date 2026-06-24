import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Book02Icon, Video01Icon, CodeIcon, ExternalLinkIcon } from '@hugeicons/core-free-icons';

export default function ResourceCard({ resource }) {
  const { title, type, author, countText, url } = resource;

  // Resolve dynamic type icon based on title or type labels
  const getIcon = () => {
    const t = (type || '').toLowerCase();
    if (t.includes('video') || t.includes('course')) return Video01Icon;
    if (t.includes('code') || t.includes('tutorial') || t.includes('practice') || t.includes('lab')) return CodeIcon;
    return Book02Icon; // default for article, documentation, reference
  };

  const IconComponent = getIcon();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-200 select-none">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Dynamic type icon circle container */}
        <div className="size-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
          <HugeiconsIcon icon={IconComponent} className="size-4.5 text-[#22D3EE]" />
        </div>

        {/* Text descriptions */}
        <div className="min-w-0">
          <h4 className="text-xs md:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-[#A2A0C2] font-semibold">
            <span className="truncate">{author || 'Open Docs'}</span>
            <span className="text-[#5C5A78]">•</span>
            <span className="font-mono text-[#A78BFA]">{countText || 'FREE ACCESS'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {/* FREE glass badge */}
        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 rounded-md text-[9px] font-bold font-mono tracking-wider uppercase">
          FREE
        </span>

        {/* Open tab button */}
        <a
          href={url || 'https://github.com'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Open Resource</span>
          <HugeiconsIcon icon={ExternalLinkIcon} className="size-3.5 text-white/70" />
        </a>
      </div>
    </div>
  );
}
