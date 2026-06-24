import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';

export default function CodeBlock({ language, value, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="bg-[#0b0a15]/80 border border-white/10 rounded-xl overflow-hidden my-3 select-text shadow-xl">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 select-none">
        {/* Left: Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="size-2.5 rounded-full bg-rose-500/80" />
          <span className="size-2.5 rounded-full bg-amber-500/80" />
          <span className="size-2.5 rounded-full bg-emerald-500/80" />
        </div>

        {/* Center: Language Label */}
        <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider font-bold">
          {language || 'code'}
        </span>

        {/* Right: Copy Button */}
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-md text-white/40 hover:text-white/80 transition-all flex items-center gap-1 cursor-pointer text-[10px] font-semibold"
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
            className={`size-3.5 ${copied ? 'text-emerald-400' : ''}`}
          />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto no-scrollbar font-mono text-[11px] md:text-xs leading-relaxed text-[#E2E8F0]">
        <pre className="m-0">
          <code>{children || value}</code>
        </pre>
      </div>
    </div>
  );
}
