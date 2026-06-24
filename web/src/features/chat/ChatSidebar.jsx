import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ChatBotIcon, 
  Briefcase01Icon, 
  Task01Icon, 
  RouteIcon, 
  AnalyticsUpIcon, 
  Add01Icon, 
  Remove01Icon,
  SparklesIcon,
  Note01Icon
} from '@hugeicons/core-free-icons';

export default function ChatSidebar({ 
  sessions = [], 
  activeSessionId, 
  onSelectSession, 
  onCreateSession, 
  onDeleteSession, 
  onSelectTopic,
  isCreatingSession
}) {

  const suggestedTopics = [
    { text: 'Find careers for me', prompt: 'Which future-ready AI careers best match my profile?', icon: Briefcase01Icon },
    { text: 'Improve my resume', prompt: 'How can I optimize my resume for ATS filters and semantic checks?', icon: Note01Icon },
    { text: 'Learn AI skills', prompt: 'What are the most critical machine learning and data engineering skills to learn today?', icon: RouteIcon },
    { text: 'Prepare interview', prompt: 'Can you help me prepare for a technical interview as an AI architect?', icon: ChatBotIcon },
    { text: 'Build roadmap', prompt: 'Guide me on how to build a week-by-week transition roadmap into DevOps.', icon: Task01Icon },
    { text: 'Salary advice', prompt: 'What are the current salary benchmarks and growth rates for data engineers?', icon: AnalyticsUpIcon },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <div className="w-full lg:w-[320px] h-full shrink-0 flex flex-col gap-6 select-none bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl max-h-[calc(100vh-140px)] overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4.5">
        <span className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-2xl">
          <HugeiconsIcon icon={ChatBotIcon} className="size-5" />
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-white tracking-tight leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ask AI
          </h2>
          <p className="text-[10px] text-[#9D99B8] leading-none">
            Career intelligence assistant
          </p>
        </div>
      </div>

      {/* Action Button: Create Session */}
      <button
        onClick={onCreateSession}
        disabled={isCreatingSession}
        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
        <span>New Chat Session</span>
      </button>

      {/* History List */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
        <h3 className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
          Chat History
        </h3>
        
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-1.5 min-h-[120px]">
          {sessions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-[#5C5A78] leading-relaxed">
                No active chat sessions. Click above to start.
              </span>
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.session_id === activeSessionId;
              return (
                <div
                  key={sess.session_id}
                  className={`w-full group rounded-xl border p-3 flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-violet-500/10 border-violet-500/20 text-[#A78BFA]'
                      : 'bg-white/[0.01] border-white/5 text-[#9D99B8] hover:bg-white/[0.03] hover:text-white'
                  }`}
                  onClick={() => onSelectSession(sess.session_id)}
                >
                  <span className="text-xs font-semibold truncate flex-grow">
                    {sess.title}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.session_id);
                    }}
                    className="p-1 hover:bg-white/10 rounded-md text-[#5C5A78] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete Chat"
                  >
                    <HugeiconsIcon icon={Remove01Icon} className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Suggested Topics Section */}
      <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
          <HugeiconsIcon icon={SparklesIcon} className="size-3 text-violet-400" />
          <span>Suggested Topics</span>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[160px] lg:max-h-none overflow-y-auto no-scrollbar"
        >
          {suggestedTopics.map((topic, i) => (
            <motion.button
              key={i}
              variants={itemVariants}
              onClick={() => onSelectTopic(topic.prompt)}
              className="py-2.5 px-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 text-[#EEEAF8] rounded-xl text-left text-[11px] font-semibold transition-all duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <HugeiconsIcon icon={topic.icon} className="size-3.5 text-[#A78BFA] group-hover:scale-110 transition-transform" />
              <span className="truncate">{topic.text}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
