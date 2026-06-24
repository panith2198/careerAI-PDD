import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon, 
  Copy01Icon, 
  CheckmarkCircle02Icon 
} from '@hugeicons/core-free-icons';
import MarkdownRenderer from './MarkdownRenderer';
import SourceCitation from './SourceCitation';
import Logo from '@/components/common/Logo';

export default function StreamingMessage({ message, isStreaming = false, sources = [], onPreviewSource }) {
  const [copied, setCopied] = useState(false);

  const isUser = typeof message === 'object' ? !!message.is_user : false;
  const text = typeof message === 'object' ? message.message_text : message;
  const createdAt = typeof message === 'object' ? message.created_at : null;
  const citationSources = sources.length > 0 ? sources : (typeof message === 'object' ? (message.sources || message.sources_json || []) : []);

  const handleCopy = async () => {
    if (isStreaming || !text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  if (!text && !isStreaming) {
    return (
      <div className="flex gap-3 py-4 items-start">
        <div className="w-7 h-7 rounded-lg bg-violet-600/15 flex items-center justify-center shrink-0 mt-0.5">
          <Logo className="size-4" />
        </div>
        <span className="text-sm text-white/40 italic pt-0.5">Thinking...</span>
      </div>
    );
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end py-3"
      >
        <div className="max-w-[85%] lg:max-w-[70%]">
          <div className="bg-white/[0.07] border border-white/[0.08] rounded-2xl rounded-br-md px-4 py-3 text-sm text-white/90 leading-relaxed whitespace-pre-wrap select-text">
            {text}
          </div>
          {createdAt && (
            <p className="text-[10px] text-white/20 mt-1 text-right pr-1 select-none">
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // AI message — Claude-like: logo icon, clean text, action bar on hover
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex gap-3 py-4 items-start"
    >
      {/* AI Avatar */}
      <motion.div
        animate={isStreaming ? { 
          borderColor: ['rgba(139, 92, 246, 0.2)', 'rgba(34, 211, 238, 0.3)', 'rgba(139, 92, 246, 0.2)'] 
        } : {}}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/15 to-cyan-600/10 border border-violet-500/15 flex items-center justify-center shrink-0 mt-0.5"
      >
        <Logo className="size-4" />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/85 leading-relaxed select-text">
          <MarkdownRenderer content={text} />
          
          {/* Streaming cursor */}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
              className="inline-block w-0.5 h-4 ml-0.5 bg-violet-400 rounded-full align-middle"
            />
          )}
        </div>

        {/* Citations */}
        {!isStreaming && citationSources.length > 0 && (
          <div className="mt-3">
            <SourceCitation sources={citationSources} onPreviewSource={onPreviewSource} />
          </div>
        )}

        {/* Action bar — appears on hover */}
        {!isStreaming && text && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} className={`size-3.5 ${copied ? 'text-emerald-400' : ''}`} />
              <span className="text-[11px] font-medium">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Timestamp */}
        {createdAt && !isStreaming && (
          <p className="text-[10px] text-white/15 mt-1 select-none">
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
