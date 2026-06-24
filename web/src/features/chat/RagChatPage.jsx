import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ChatBotIcon, SparklesIcon, Remove01Icon, Add01Icon, 
  ArrowDown01Icon, Note01Icon
} from '@hugeicons/core-free-icons';

import useAuthStore from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import Logo from '@/components/common/Logo';

import StreamingMessage from './StreamingMessage';
import ChatInput from './ChatInput';
import AIStreamingIndicator from './AIStreamingIndicator';
import useSSEStream from './useSSEStream';
import SourcePreviewSheet from './SourcePreviewSheet';
import {
  getChatSessions,
  getSessionMessages,
  createChatSession,
  deleteChatSession,
  clearAllSessions,
  sendChatWithFile
} from './chat.api';

export default function RagChatPage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [composerInput, setComposerInput] = useState('');
  const [liveMessages, setLiveMessages] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [activePreviewSource, setActivePreviewSource] = useState(null);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const handleAttachFile = (file) => {
    setAttachedFile(file);
    toast.success(`Attached: ${file.name}`);
  };

  const handleRemoveAttachedFile = () => {
    setAttachedFile(null);
  };

  // SSE Stream hook
  const {
    isStreaming,
    error: streamError,
    accumulatedText,
    startStream,
    clearStream
  } = useSSEStream();

  const [isProcessing, setIsProcessing] = useState(false);
  const isThinking = isStreaming || isProcessing;

  // Fetch sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['chatSessions'],
    queryFn: getChatSessions
  });

  // Fetch messages for active session
  const { data: dbMessages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['sessionMessages', activeSessionId],
    queryFn: () => getSessionMessages(activeSessionId),
    enabled: !!activeSessionId
  });

  // Auto-select first session
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].session_id);
    }
  }, [sessions, activeSessionId]);

  // Sync live messages
  useEffect(() => {
    if (dbMessages) setLiveMessages(dbMessages);
  }, [dbMessages]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [liveMessages, accumulatedText, isThinking]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  useEffect(() => {
    if (streamError) toast.error(streamError);
  }, [streamError]);

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: createChatSession,
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      setActiveSessionId(newSession.session_id);
    },
    onError: () => toast.error('Failed to create session.')
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteChatSession,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      if (activeSessionId === deletedId) {
        const remaining = sessions.filter((s) => s.session_id !== deletedId);
        setActiveSessionId(remaining.length > 0 ? remaining[0].session_id : null);
        if (remaining.length === 0) setLiveMessages([]);
      }
      toast.success('Session deleted.');
    },
    onError: () => toast.error('Failed to delete session.')
  });

  const clearAllMutation = useMutation({
    mutationFn: clearAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      setActiveSessionId(null);
      setLiveMessages([]);
      toast.success('All conversations cleared.');
    },
    onError: () => toast.error('Failed to clear sessions.')
  });

  const handleSelectTopic = (prompt) => {
    setComposerInput(prompt);
  };

  // Send message
  const handleSendMessage = async () => {
    if ((!composerInput.trim() && !attachedFile) || isThinking) return;

    let targetSessionId = activeSessionId;

    if (!targetSessionId) {
      try {
        const fallbackTitle = attachedFile ? `Ingested: ${attachedFile.name}` : (composerInput.substring(0, 30) + '...');
        const newSession = await createSessionMutation.mutateAsync(fallbackTitle);
        targetSessionId = newSession.session_id;
      } catch (err) { return; }
    }

    const fileToUpload = attachedFile;
    let promptText = composerInput;
    if (fileToUpload) {
      promptText = `${promptText}\n[Uploaded Document: ${fileToUpload.name}]`.trim();
    }

    setComposerInput('');
    setAttachedFile(null);

    const userMsg = {
      message_id: Date.now(),
      is_user: true,
      message_text: promptText,
      created_at: new Date().toISOString()
    };
    setLiveMessages((prev) => [...prev, userMsg]);

    if (fileToUpload) {
      setIsProcessing(true);
      try {
        await sendChatWithFile(promptText, targetSessionId, fileToUpload);
        queryClient.invalidateQueries({ queryKey: ['sessionMessages', targetSessionId] });
      } catch (err) {
        toast.error(err.message || 'Failed to send file.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      startStream(
        promptText,
        targetSessionId,
        token,
        null,
        () => {
          queryClient.invalidateQueries({ queryKey: ['sessionMessages', targetSessionId] });
          clearStream();
        }
      );
    }
  };

  const hasMessages = liveMessages.length > 0 || isThinking;

  // Suggested prompts for empty state
  const suggestedPrompts = [
    { label: 'Find careers that match my skills', prompt: 'Which future-ready AI careers best match my profile and skills?', icon: SparklesIcon },
    { label: 'Optimize my resume for ATS', prompt: 'How can I optimize my resume for ATS filters and semantic checks?', icon: Note01Icon },
    { label: 'Build a learning roadmap', prompt: 'Guide me on how to build a week-by-week transition roadmap into DevOps.', icon: SparklesIcon },
    { label: 'Prepare for interviews', prompt: 'Can you help me prepare for a technical interview as an AI architect?', icon: ChatBotIcon },
  ];

  return (
    <div className="relative w-full flex flex-row overflow-hidden flex-1 pb-16 md:pb-0">
      {/* Left Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
      {/* Chat Session Tabs — Compact horizontal strip */}
      {sessions.length > 0 && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-transparent overflow-x-auto no-scrollbar">
          {sessions.map((sess) => {
            const isActive = sess.session_id === activeSessionId;
            return (
              <button
                key={sess.session_id}
                onClick={() => setActiveSessionId(sess.session_id)}
                className={`group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <span className="truncate max-w-[120px]">{sess.title || 'New Chat'}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); deleteSessionMutation.mutate(sess.session_id); }}
                  className="p-0.5 rounded text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <HugeiconsIcon icon={Remove01Icon} className="size-3" />
                </span>
              </button>
            );
          })}
          <button
            onClick={() => createSessionMutation.mutate(null)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer border border-transparent hover:border-white/[0.08]"
            title="New Chat"
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={1.8} className="size-4" />
          </button>

          {sessions.length > 1 && (
            <button
              onClick={() => clearAllMutation.mutate()}
              className="shrink-0 ml-auto text-[10px] text-white/25 hover:text-rose-400/70 font-medium uppercase tracking-wider transition-all cursor-pointer px-2"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Messages Wrapper Container */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* Messages Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto no-scrollbar"
        >
          {isMessagesLoading ? (
            /* Loading Skeletons */
            <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
              <div className="flex gap-3 items-start">
                <Skeleton className="size-8 rounded-full bg-white/[0.04]" />
                <Skeleton className="w-[60%] h-16 rounded-2xl bg-white/[0.04]" />
              </div>
              <div className="flex gap-3 items-start justify-end">
                <Skeleton className="w-[45%] h-12 rounded-2xl bg-white/[0.04]" />
              </div>
              <div className="flex gap-3 items-start">
                <Skeleton className="size-8 rounded-full bg-white/[0.04]" />
                <Skeleton className="w-[70%] h-24 rounded-2xl bg-white/[0.04]" />
              </div>
            </div>
          ) : !hasMessages ? (
            /* Empty Welcome State — Claude-like centered */
            <div className="h-full flex flex-col items-center justify-center px-6 select-none">
              <div className="max-w-2xl w-full flex flex-col items-center text-center gap-6 pb-16">
                {/* Logo mark */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-white/[0.08] flex items-center justify-center">
                    <Logo className="size-9" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="space-y-2"
                >
                  <h1 className="text-2xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. How can I help?
                  </h1>
                  <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
                    Ask about career paths, skill assessments, resume optimization, learning roadmaps, or job matching.
                  </p>
                </motion.div>

                {/* Suggestion Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg mt-2"
                >
                  {suggestedPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectTopic(item.prompt)}
                      className="group text-left px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-[13px] text-white/60 group-hover:text-white/80 transition-colors leading-snug">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-1">
              {liveMessages.map((msg) => (
                <StreamingMessage 
                  key={msg.message_id} 
                  message={msg} 
                  onPreviewSource={setActivePreviewSource} 
                />
              ))}
              
              {/* Streaming response */}
              {isStreaming && accumulatedText && (
                <StreamingMessage
                  message={{
                    message_id: 'live-stream',
                    is_user: false,
                    message_text: accumulatedText,
                    model_used: 'mistral-large-latest',
                    created_at: null
                  }}
                  isStreaming={true}
                  onPreviewSource={setActivePreviewSource}
                />
              )}

              {/* Thinking indicator */}
              {isThinking && !accumulatedText && (
                <AIStreamingIndicator />
              )}

              <div ref={messagesEndRef} className="h-4 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom FAB */}
        <AnimatePresence>
          {showScrollBtn && hasMessages && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full bg-white/10 backdrop-blur-lg border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all shadow-xl cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input Composer — pinned bottom, centered */}
      <div className="shrink-0 w-full border-t border-white/[0.04] bg-transparent">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput
            value={composerInput}
            onChange={setComposerInput}
            onSubmit={handleSendMessage}
            isStreaming={isThinking}
            showSuggestions={false}
            onSelectSuggested={handleSelectTopic}
            onAttachFile={handleAttachFile}
            attachedFile={attachedFile}
            onRemoveAttachedFile={handleRemoveAttachedFile}
          />
          <p className="text-center text-[10px] text-white/20 mt-2.5 select-none">
            AI can make mistakes. Verify important career decisions.
          </p>
        </div>
      </div>
      </div>

      {/* Right Preview Panel (Sheet type UI like Claude AI) */}
      <AnimatePresence>
        {activePreviewSource && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full md:w-[450px] lg:w-[500px] h-full shrink-0 z-30"
          >
            <SourcePreviewSheet
              source={activePreviewSource}
              onClose={() => setActivePreviewSource(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
