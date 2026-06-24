import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

export default function ScoreChip({ score }) {
  if (score === undefined || score === null) return null;

  return (
    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.1)] w-fit select-none">
      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
      <span>Previous Score: {Math.round(score)}%</span>
    </div>
  );
}
