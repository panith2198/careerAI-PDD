import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon, Loading01Icon, Remove01Icon, FileAttachmentIcon } from '@hugeicons/core-free-icons';
import SuggestedQuestions from './SuggestedQuestions';
import FileAttachButton from './FileAttachButton';

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isStreaming,
  showSuggestions,
  onSelectSuggested,
  onAttachFile,
  attachedFile,
  onRemoveAttachedFile
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${nextHeight}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && (value.trim() || attachedFile)) {
        onSubmit();
      }
    }
  };

  const canSend = !isStreaming && (value.trim() || attachedFile);

  return (
    <div className="w-full flex flex-col gap-3 relative select-none">
      {/* Suggested Questions */}
      {showSuggestions && !value && (
        <SuggestedQuestions onSelectQuestion={onSelectSuggested} />
      )}

      {/* Composer */}
      <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-2.5 relative transition-all focus-within:border-white/[0.15] focus-within:bg-white/[0.05]">
        {/* Attached file chip */}
        {attachedFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 bg-white/[0.04] border border-white/[0.08] rounded-lg w-fit">
            <HugeiconsIcon icon={FileAttachmentIcon} className="size-3.5 text-violet-400" />
            <span className="text-[11px] font-medium text-white/60 truncate max-w-[200px]">
              {attachedFile.name}
            </span>
            <button
              type="button"
              onClick={onRemoveAttachedFile}
              className="p-0.5 hover:bg-white/10 rounded text-white/30 hover:text-rose-400 cursor-pointer flex items-center justify-center"
            >
              <HugeiconsIcon icon={Remove01Icon} className="size-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File attachment */}
          <FileAttachButton
            onFileSelect={onAttachFile}
            disabled={isStreaming}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Message AI Career Advisor..."
            className="flex-1 resize-none bg-transparent border-0 outline-none focus:ring-0 text-white/90 text-sm py-2.5 px-1.5 placeholder-white/25 no-scrollbar min-h-[42px] max-h-[200px] leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            className={`size-9 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              canSend
                ? 'bg-white text-black hover:bg-white/90 shadow-sm'
                : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
            }`}
          >
            {isStreaming ? (
              <HugeiconsIcon icon={Loading01Icon} className="size-4 animate-spin" />
            ) : (
              <HugeiconsIcon icon={ArrowUp01Icon} className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
