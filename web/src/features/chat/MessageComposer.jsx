import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';

export default function MessageComposer({ value, onChange, onSubmit, disabled }) {
  const textareaRef = useRef(null);

  // Auto grow height handler
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full relative bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-end gap-3 backdrop-blur-xl hover:border-white/20 transition-all select-none">
      
      {/* Autogrowing Input */}
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your career..."
        disabled={disabled}
        className="flex-1 max-h-[180px] min-h-[38px] bg-transparent outline-none border-none text-white text-xs md:text-sm leading-relaxed placeholder-[#5C5A78] resize-none no-scrollbar py-2 px-1 disabled:opacity-50 select-text"
        style={{ height: 'auto' }}
      />

      {/* Send Button */}
      <motion.button
        onClick={onSubmit}
        disabled={!value.trim() || disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2.5 rounded-xl text-white shrink-0 flex items-center justify-center transition-all cursor-pointer ${
          value.trim() && !disabled
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_12px_rgba(139,92,246,0.3)] hover:from-violet-500 hover:to-indigo-500'
            : 'bg-white/5 text-[#5C5A78] border border-white/5 cursor-not-allowed'
        }`}
      >
        <HugeiconsIcon icon={ArrowUp01Icon} className="size-4.5" strokeWidth={2.5} />
      </motion.button>

    </div>
  );
}
