import React, { useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Attachment01Icon } from '@hugeicons/core-free-icons';

export default function FileAttachButton({ onFileSelect, disabled }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset selection so the same file can be uploaded again
    e.target.value = '';
  };

  return (
    <div className="shrink-0 select-none">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl text-[#9D99B8] hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
        title="Attach career PDF/resume"
      >
        <HugeiconsIcon icon={Attachment01Icon} className="size-5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />
    </div>
  );
}
