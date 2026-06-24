import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { HugeiconsIcon } from '@hugeicons/react';
import { ChatBotIcon, UserIcon, SparklesIcon } from '@hugeicons/core-free-icons';

export default function ChatMessage({ message }) {
  const isUser = message.is_user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`w-full flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar (AI) */}
      {!isUser && (
        <span className="p-2 bg-gradient-to-br from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-violet-500/20 text-[#22D3EE] rounded-xl shrink-0 mt-1 select-none">
          <HugeiconsIcon icon={ChatBotIcon} className="size-4.5" />
        </span>
      )}

      {/* Bubble Content */}
      <div className={`max-w-[85%] md:max-w-[70%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Model Badge / Metadata */}
        {!isUser && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] font-bold text-[#A78BFA] font-mono select-none">
            <HugeiconsIcon icon={SparklesIcon} className="size-2.5 animate-pulse text-[#22D3EE]" />
            <span>{message.model_used || 'mistral-large-latest'}</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-5 py-3.5 text-xs md:text-sm leading-relaxed border select-text ${
            isUser
              ? 'bg-violet-600/10 border-violet-500/20 text-white rounded-tr-sm shadow-[0_0_20px_rgba(139,92,246,0.05)]'
              : 'bg-white/[0.03] border-white/10 text-[#EEEAF8] rounded-tl-sm backdrop-blur-xl'
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.message_text}</span>
          ) : (
            <div className="markdown-content space-y-3">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-base font-extrabold text-white mt-4 mb-2 first:mt-0 font-sans tracking-tight">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold text-white mt-3.5 mb-1.5 first:mt-0 font-sans tracking-tight">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-bold text-[#EEEAF8] mt-3 mb-1 first:mt-0 font-sans">{children}</h3>,
                  p: ({ children }) => <p className="text-[#EEEAF8] leading-relaxed mb-3 last:mb-0 font-sans">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-[#22D3EE]">{children}</strong>,
                  em: ({ children }) => <em className="italic text-[#A78BFA]">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 font-sans text-[#EEEAF8]">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 font-sans text-[#EEEAF8]">{children}</ol>,
                  li: ({ children }) => <li className="pl-0.5 leading-relaxed">{children}</li>,
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#22D3EE] hover:text-[#A78BFA] underline transition-colors font-semibold"
                    >
                      {children}
                    </a>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-black/40 border border-white/10 rounded-xl p-4 my-3 overflow-x-auto no-scrollbar font-mono text-[11px] leading-relaxed text-[#EEEAF8]">
                      {children}
                    </pre>
                  ),
                  code: ({ children }) => (
                    <code className="bg-white/5 border border-white/5 rounded px-1.5 py-0.5 font-mono text-[11px] text-[#A78BFA]">
                      {children}
                    </code>
                  )
                }}
              >
                {message.message_text}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {message.created_at && (
          <span className="text-[9px] text-[#5C5A78] font-mono mt-0.5 select-none px-1">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        
      </div>

      {/* Avatar (User) */}
      {isUser && (
        <span className="p-2 bg-violet-600/20 border border-violet-500/20 text-[#A78BFA] rounded-xl shrink-0 mt-1 select-none">
          <HugeiconsIcon icon={UserIcon} className="size-4.5" />
        </span>
      )}
    </motion.div>
  );
}
