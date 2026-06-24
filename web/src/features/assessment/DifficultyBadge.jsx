import React from 'react';

export default function DifficultyBadge({ difficulty }) {
  const diff = (difficulty || 'easy').toLowerCase();

  let styles = '';
  let label = '';

  if (diff === 'easy') {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.12)]';
    label = 'Easy';
  } else if (diff === 'medium') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]';
    label = 'Medium';
  } else {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.12)]';
    label = 'Hard';
  }

  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wider border rounded-full uppercase shrink-0 select-none ${styles}`}>
      {label}
    </span>
  );
}
