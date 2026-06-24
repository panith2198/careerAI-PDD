import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link01Icon, ArrowDown01Icon, FileAttachmentIcon } from '@hugeicons/core-free-icons';

export default function SourceCitation({ sources = [], onPreviewSource }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full mt-3 border-t border-white/5 pt-2.5 select-none">
      {/* Accordion Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider font-mono text-[#5C5A78] hover:text-[#A78BFA] transition-colors duration-200 cursor-pointer"
      >
        <HugeiconsIcon icon={Link01Icon} className="size-3.5 text-[#22D3EE]" />
        <span>View sources ({sources.length})</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={`size-3 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              {sources.map((src, idx) => (
                <button
                  key={src.doc_id || idx}
                  onClick={() => onPreviewSource && onPreviewSource(src)}
                  className="bg-black/20 border border-white/5 hover:border-violet-500/15 hover:bg-white/[0.03] rounded-xl p-3 flex items-start gap-3 backdrop-blur-xl transition-all duration-300 cursor-pointer text-left w-full"
                >
                  <span className="p-2 bg-white/[0.02] border border-white/5 rounded-lg text-violet-400 mt-0.5 shrink-0">
                    <HugeiconsIcon icon={FileAttachmentIcon} className="size-3.5" />
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-[11px] font-bold text-white truncate leading-tight">
                      {src.title || `Source Chunk #${src.chunk_index || idx}`}
                    </h4>
                    <p className="text-[9px] font-mono text-[#5C5A78] truncate leading-none">
                      Type: {src.source_type || 'knowledge-base'}
                    </p>
                    {src.relevance && (
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono text-cyan-400">Match score:</span>
                        <span className="text-[9px] font-mono font-bold text-cyan-300">{src.relevance}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
