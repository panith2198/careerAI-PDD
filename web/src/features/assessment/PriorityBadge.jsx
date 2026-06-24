import React from 'react';

export default function PriorityBadge({ priority }) {
  const p = (priority || 'low').toLowerCase();

  let styles = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  let label = 'Low Priority';

  if (p === 'high') {
    styles = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    label = 'High Priority';
  } else if (p === 'medium') {
    styles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    label = 'Medium Priority';
  }

  return (
    <span className={`px-2.5 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded-full uppercase shrink-0 select-none ${styles}`}>
      {label}
    </span>
  );
}
