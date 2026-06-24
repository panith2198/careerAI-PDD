import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RoadmapFlowAnimation() {
  const [activeSegment, setActiveSegment] = useState(0); // 0: Foundations, 1: Specialist, 2: Mastery

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSegment(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-[16/10] flex items-center justify-center p-4 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-brand/10 rounded blur-2xl opacity-20 pointer-events-none" />

      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 420 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection tracks between left card nodes and right card checklist items */}
        <g>
          {/* Track 1: Foundations (Absolute Y = 120) */}
          <path d="M125,120 H290" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" strokeDasharray="3 3" />
          <motion.path
            d="M125,120 H290"
            stroke={activeSegment >= 1 ? '#10B981' : '#8B5CF6'}
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
            key={`track1_${activeSegment}`}
          />
          {activeSegment === 0 && (
            <motion.circle
              cx="125"
              cy="120"
              r="3.5"
              fill="#8B5CF6"
              animate={{ cx: [125, 290] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Track 2: Specialist (Absolute Y = 170) */}
          <path d="M125,170 H290" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" strokeDasharray="3 3" />
          {activeSegment >= 1 && (
            <motion.path
              d="M125,170 H290"
              stroke={activeSegment === 2 ? '#10B981' : '#8B5CF6'}
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5 }}
              key={`track2_${activeSegment}`}
            />
          )}
          {activeSegment === 1 && (
            <motion.circle
              cx="125"
              cy="170"
              r="3.5"
              fill="#8B5CF6"
              animate={{ cx: [125, 290] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Track 3: Mastery (Absolute Y = 220) */}
          <path d="M125,220 H290" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" strokeDasharray="3 3" />
          {activeSegment === 2 && (
            <motion.path
              d="M125,220 H290"
              stroke="#8B5CF6"
              strokeWidth="1.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5 }}
            />
          )}
          {activeSegment === 2 && (
            <motion.circle
              cx="125"
              cy="220"
              r="3.5"
              fill="#8B5CF6"
              animate={{ cx: [125, 290] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* LEFT PANEL: ROADMAP OVERVIEW */}
        <g transform="translate(15, 15)">
          <rect width="110" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">CURRICULUM</text>
          <line x1="15" y1="28" x2="95" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Top metadata stats area */}
          <g transform="translate(15, 38)">
            <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">ACTIVE ROADMAP</text>
            <text x="0" y="20" fill="#22D3EE" fontSize="8.5" fontFamily="monospace" fontWeight="bold">AI_ARCHITECT</text>
          </g>

          {/* Phase 1 Node (Foundations) - Relative Center Y = 105 */}
          <g transform="translate(15, 85)">
            <circle cx="20" cy="20" r="14" fill="#0F0F1C" stroke={activeSegment === 0 ? '#8B5CF6' : '#10B981'} strokeWidth="2" />
            {activeSegment === 0 && (
              <motion.circle cx="20" cy="20" r="19" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.5" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            )}
            {activeSegment !== 0 && (
              <path d="M16,20 L19,23 L25,17" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
            )}
            {activeSegment === 0 && <text x="20" y="23.5" textAnchor="middle" fill="#EEEAF8" fontSize="9.5" fontFamily="monospace" fontWeight="bold">01</text>}
            <text x="42" y="22" fill={activeSegment === 0 ? '#8B5CF6' : '#EEEAF8'} fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">Foundations</text>
            <text x="42" y="32" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">PYTHON / RAG</text>
          </g>

          {/* Phase 2 Node (Specialist) - Relative Center Y = 155 */}
          <g transform="translate(15, 135)">
            <circle cx="20" cy="20" r="14" fill="#0F0F1C" stroke={activeSegment === 1 ? '#8B5CF6' : activeSegment === 2 ? '#10B981' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
            {activeSegment === 1 && (
              <motion.circle cx="20" cy="20" r="19" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.5" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            )}
            {activeSegment === 2 && (
              <path d="M16,20 L19,23 L25,17" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
            )}
            {activeSegment !== 2 && <text x="20" y="23.5" textAnchor="middle" fill={activeSegment === 1 ? '#EEEAF8' : 'rgba(255,255,255,0.2)'} fontSize="9.5" fontFamily="monospace" fontWeight="bold">02</text>}
            <text x="42" y="22" fill={activeSegment === 1 ? '#8B5CF6' : activeSegment === 2 ? '#EEEAF8' : 'rgba(255,255,255,0.2)'} fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">Specialist</text>
            <text x="42" y="32" fill="#9D99B8" fillOpacity={activeSegment >= 1 ? 1 : 0.2} fontSize="6.5" fontFamily="monospace">VECTOR DB</text>
          </g>

          {/* Phase 3 Node (Mastery) - Relative Center Y = 205 */}
          <g transform="translate(15, 185)">
            <circle cx="20" cy="20" r="14" fill="#0F0F1C" stroke={activeSegment === 2 ? '#8B5CF6' : 'rgba(255,255,255,0.15)'} strokeWidth="2" />
            {activeSegment === 2 && (
              <motion.circle cx="20" cy="20" r="19" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.5" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} />
            )}
            <text x="20" y="23.5" textAnchor="middle" fill={activeSegment === 2 ? '#EEEAF8' : 'rgba(255,255,255,0.2)'} fontSize="9.5" fontFamily="monospace" fontWeight="bold">03</text>
            <text x="42" y="22" fill={activeSegment === 2 ? '#8B5CF6' : 'rgba(255,255,255,0.2)'} fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">Mastery</text>
            <text x="42" y="32" fill="#9D99B8" fillOpacity={activeSegment === 2 ? 1 : 0.2} fontSize="6.5" fontFamily="monospace">CUSTOM LLMS</text>
          </g>
        </g>

        {/* RIGHT PANEL: ROADMAP ANALYTICS */}
        <g transform="translate(290, 15)">
          <rect width="115" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ROADMAP STATS</text>
          <line x1="15" y1="28" x2="100" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Active progress summary */}
          <g transform="translate(15, 38)">
            <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">TOTAL PROGRESS</text>
            <text x="0" y="22" fill="#EEEAF8" fontSize="12" fontFamily="monospace" fontWeight="bold">
              {activeSegment === 0 ? '33%' : activeSegment === 1 ? '66%' : '100%'}
            </text>

            <rect x="0" y="30" width="85" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
            <motion.rect
              x="0"
              y="30"
              width={activeSegment === 0 ? 28 : activeSegment === 1 ? 56 : 85}
              height="6"
              rx="3"
              fill="#10B981"
              transition={{ duration: 0.5 }}
              key={`progress_${activeSegment}`}
            />
          </g>

          {/* Curriculum Checklist - Aligned vertically to match Y centers 120, 170, 220 absolute */}
          {/* Checklist Item 1 (Foundations Pass) - Relative Center Y = 105 */}
          <g transform="translate(15, 101)">
            <circle cx="4" cy="4" r="3.5" fill="#0F0F1C" stroke={activeSegment >= 1 ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
            {activeSegment >= 1 && <path d="M2,4 L3.5,5.5 L6,2.5" stroke="#10B981" strokeWidth="1" />}
            <text x="14" y="7" fill={activeSegment >= 1 ? '#EEEAF8' : 'rgba(255,255,255,0.2)'} fontSize="6" fontFamily="sans-serif">Foundations Pass</text>
          </g>

          {/* Checklist Item 2 (Specialist Pass) - Relative Center Y = 155 */}
          <g transform="translate(15, 151)">
            <circle cx="4" cy="4" r="3.5" fill="#0F0F1C" stroke={activeSegment === 2 ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
            {activeSegment === 2 && <path d="M2,4 L3.5,5.5 L6,2.5" stroke="#10B981" strokeWidth="1" />}
            <text x="14" y="7" fill={activeSegment === 2 ? '#EEEAF8' : 'rgba(255,255,255,0.2)'} fontSize="6" fontFamily="sans-serif">Specialist Pass</text>
          </g>

          {/* Checklist Item 3 (Mastery Secured) - Relative Center Y = 205 */}
          <g transform="translate(15, 201)">
            <circle cx="4" cy="4" r="3.5" fill="#0F0F1C" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="14" y="7" fill="rgba(255,255,255,0.2)" fontSize="6" fontFamily="sans-serif">Mastery Secured</text>
          </g>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="roadmapLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="roadmapCyanLineGrad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
