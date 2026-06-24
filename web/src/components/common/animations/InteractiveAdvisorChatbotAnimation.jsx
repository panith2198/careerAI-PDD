import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function InteractiveAdvisorChatbotAnimation() {
  const [chatPhase, setChatPhase] = useState('idle'); // idle, typing, retrieving, responding, resolved

  useEffect(() => {
    const runCycle = () => {
      setChatPhase('idle');

      // 1. User starts typing / query displays
      const t1 = setTimeout(() => {
        setChatPhase('typing');
      }, 1000);

      // 2. Data packet travels to vector db
      const t2 = setTimeout(() => {
        setChatPhase('retrieving');
      }, 2500);

      // 3. AI responds / processing starts
      const t3 = setTimeout(() => {
        setChatPhase('responding');
      }, 4200);

      // 4. Response displays
      const t4 = setTimeout(() => {
        setChatPhase('resolved');
      }, 5500);

      return [t1, t2, t3, t4];
    };

    let timeouts = runCycle();
    const interval = setInterval(() => {
      timeouts.forEach(clearTimeout);
      timeouts = runCycle();
    }, 9500);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-[16/10] flex items-center justify-center p-4 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Background ambient radial glows */}
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-brand/10 rounded blur-2xl opacity-20 pointer-events-none" />

      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 420 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Semantic retrieval pathways in the middle bridge */}
        <g>
          <path d="M150,130 Q205,90 260,130" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M150,130 Q205,170 260,130" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M150,130 H260" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />

          {/* Traveling RAG prompt vectors */}
          {chatPhase === 'retrieving' && (
            <>
              <motion.circle
                cx="150"
                cy="130"
                r="3"
                fill="#8B5CF6"
                animate={{ cx: [150, 260], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.circle
                cx="150"
                cy="130"
                r="3"
                fill="#22D3EE"
                animate={{ cx: [150, 205, 260], cy: [130, 97, 130], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}

          {/* Traveling AI response vectors back to UI */}
          {chatPhase === 'responding' && (
            <motion.circle
              cx="260"
              cy="130"
              r="3.5"
              fill="#10B981"
              animate={{ cx: [260, 150] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* Central Vector Database Node */}
        <g transform="translate(205, 130)">
          <motion.circle
            r="16"
            stroke="url(#dbHaloGrad)"
            strokeWidth="1"
            strokeDasharray="4 2"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <circle r="11" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
          
          {/* Pulsing indicator core */}
          <motion.circle
            r="6"
            fill={chatPhase === 'retrieving' ? '#8B5CF6' : chatPhase === 'responding' ? '#10B981' : 'rgba(255,255,255,0.15)'}
            animate={chatPhase === 'retrieving' || chatPhase === 'responding' ? { scale: [0.8, 1.2, 0.8] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </g>

        {/* LEFT PANEL: USER CLIENT CONSOLE */}
        <g transform="translate(15, 15)">
          {/* Card Base */}
          <rect x="0" y="0" width="135" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">USER SESSION</text>
          <line x1="15" y1="28" x2="120" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* User Avatar & Name */}
          <g transform="translate(15, 38)">
            <circle cx="8" cy="8" r="8" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1" />
            <path d="M4,13 C4,10 12,10 12,13" stroke="#8B5CF6" strokeWidth="1" />
            <circle cx="8" cy="6" r="2.5" fill="#8B5CF6" />
            <text x="22" y="11" fill="#EEEAF8" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">Explorer Client</text>
          </g>

          {/* User Chat bubble (Types in) */}
          {(chatPhase === 'typing' || chatPhase === 'retrieving' || chatPhase === 'responding' || chatPhase === 'resolved') && (
            <g transform="translate(12, 68)">
              <motion.g
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Chat Speech Area using Rect */}
                <rect width="111" height="42" rx="4" fill="rgba(139, 92, 246, 0.08)" stroke="#8B5CF6" strokeWidth="0.8" />
                
                {/* Query Texts */}
                <text x="8" y="18" fill="#EEEAF8" fontSize="6.5" fontFamily="monospace">&gt; career roadmap</text>
                <text x="8" y="30" fill="#EEEAF8" fontSize="6.5" fontFamily="monospace">  for AI Architect?</text>
              </motion.g>
            </g>
          )}

          {/* Terminal Input Box Mockup */}
          <g transform="translate(12, 185)">
            <rect width="111" height="30" rx="4" fill="#0F0F1C" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            
            {/* Blinking cursor */}
            {chatPhase === 'idle' && (
              <>
                <text x="8" y="18" fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="sans-serif">Type your query...</text>
                <motion.rect x="92" y="10" width="2" height="10" fill="#8B5CF6" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} />
              </>
            )}

            {chatPhase !== 'idle' && (
              <>
                <text x="8" y="18" fill="#10B981" fontSize="6" fontFamily="sans-serif" fontWeight="bold">QUERY TRANSMITTED</text>
                <circle cx="98" cy="15" r="3" fill="#10B981" />
              </>
            )}
          </g>
        </g>

        {/* RIGHT PANEL: AI COUNSELOR CHATBOT */}
        <g transform="translate(270, 15)">
          {/* Card Base */}
          <rect x="0" y="0" width="135" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">RAG COUNSELOR</text>
          <line x1="15" y1="28" x2="120" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Chatbot Avatar */}
          <g transform="translate(15, 38)">
            <circle cx="8" cy="8" r="8" fill="#22D3EE" fillOpacity="0.2" stroke="#22D3EE" strokeWidth="1" />
            <path d="M4,13 C4,11 12,11 12,13" stroke="#22D3EE" strokeWidth="1" />
            {/* Robo Eyes */}
            <circle cx="6" cy="6" r="1" fill="#22D3EE" />
            <circle cx="10" cy="6" r="1" fill="#22D3EE" />
            <text x="22" y="11" fill="#EEEAF8" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">AI Advisor v3.5</text>
          </g>

          {/* Bot response dialogue (typing and concluding phases) */}
          {(chatPhase === 'responding' || chatPhase === 'resolved') && (
            <g transform="translate(12, 68)">
              <motion.g
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Bot bubble body rect */}
                <rect width="111" height="76" rx="4" fill="rgba(34, 211, 238, 0.05)" stroke="#22D3EE" strokeWidth="0.8" />
                
                {chatPhase === 'responding' && (
                  <>
                    <text x="8" y="18" fill="#22D3EE" fontSize="6.5" fontFamily="monospace">Querying vector DB...</text>
                    <text x="8" y="32" fill="#EEEAF8" fontSize="6" fontFamily="sans-serif">Matching curriculum...</text>
                    <motion.rect x="8" y="44" width="80" height="2" fill="#8B5CF6" animate={{ scaleX: [0, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ transformOrigin: 'left' }} />
                  </>
                )}

                {chatPhase === 'resolved' && (
                  <g>
                    {/* Title */}
                    <text x="8" y="15" fill="#10B981" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">✓ AI ROADMAP MAPS:</text>
                    
                    {/* Items */}
                    <text x="8" y="27" fill="#EEEAF8" fontSize="6" fontFamily="monospace">1. Intro: Python/RAG</text>
                    <text x="8" y="37" fill="#EEEAF8" fontSize="6" fontFamily="monospace">2. Core: Vector Embeds</text>
                    <text x="8" y="47" fill="#EEEAF8" fontSize="6" fontFamily="monospace">3. Mastery: Custom LLMs</text>
                    
                    {/* Status checklist */}
                    <g transform="translate(8, 54)">
                      <circle cx="3" cy="6" r="2.5" fill="#10B981" />
                      <text x="10" y="9" fill="#10B981" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">SYNCHRONIZED (RAG)</text>
                    </g>
                  </g>
                )}
              </motion.g>
            </g>
          )}

          {/* Lower DB Sync panel */}
          <g transform="translate(12, 185)">
            <rect width="111" height="30" rx="4" fill="rgba(16, 185, 129, 0.04)" stroke="#10B981" strokeWidth="1" />
            <motion.circle cx="15" cy="15" r="3.5" fill="#10B981" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <text x="25" y="14" fill="#EEEAF8" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">SECURE KNOWLEDGE</text>
            <text x="25" y="23" fill="#9D99B8" fontSize="5.5" fontFamily="monospace">COSINE SIMILARITY: 0.98</text>
          </g>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="dbHaloGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
