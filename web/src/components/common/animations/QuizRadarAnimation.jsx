import React from 'react';
import { motion } from 'framer-motion';

export default function QuizRadarAnimation() {
  const finalPath = "M100,40.5 L154,68.5 L142,124.5 L100,156 L55,126.25 L52,72 Z";
  const startPath = "M100,100 L100,100 L100,100 L100,100 L100,100 L100,100 Z";

  return (
    <div className="relative w-full max-w-[340px] mx-auto aspect-square flex items-center justify-center p-4 bg-surface-2 border border-border rounded-2xl shadow-xl">
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30"></div>
      
      <svg
        className="w-full h-full text-text-secondary"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagon Outer Grid */}
        <polygon points="100,30 160,65 160,135 100,170 40,135 40,65" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <polygon points="100,50 142,75 142,125 100,150 58,125 58,75" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <polygon points="100,70 125,85 125,115 100,130 75,115 75,85" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        
        {/* Axis lines */}
        <line x1="100" y1="30" x2="100" y2="170" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="40" y1="65" x2="160" y2="135" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <line x1="40" y1="135" x2="160" y2="65" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

        {/* Labels */}
        <text x="100" y="24" textAnchor="middle" fill="#EEEAF8" fontSize="8" fontFamily="monospace">KOTLIN</text>
        <text x="172" y="66" textAnchor="start" fill="#22D3EE" fontSize="8" fontFamily="monospace">REACT</text>
        <text x="172" y="140" textAnchor="start" fill="#EEEAF8" fontSize="8" fontFamily="monospace">PYTHON</text>
        <text x="100" y="180" textAnchor="middle" fill="#8B5CF6" fontSize="8" fontFamily="monospace">RAG</text>
        <text x="28" y="140" textAnchor="end" fill="#EEEAF8" fontSize="8" fontFamily="monospace">HILT</text>
        <text x="28" y="66" textAnchor="end" fill="#22D3EE" fontSize="8" fontFamily="monospace">GIT</text>

        {/* Animated Skill Radar Area */}
        <motion.path
          d={startPath}
          animate={{ d: finalPath }}
          transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          fill="url(#radarGrad)"
          stroke="#8B5CF6"
          strokeWidth="1.5"
        />

        {/* Pulsing score nodes */}
        <motion.circle cx="100" cy="40.5" r="3" fill="#8B5CF6" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
        <motion.circle cx="154" cy="68.5" r="3" fill="#22D3EE" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3 }} />
        <motion.circle cx="142" cy="124.5" r="3" fill="#EEEAF8" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.6 }} />
        <motion.circle cx="100" cy="156" r="3" fill="#8B5CF6" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.9 }} />
        <motion.circle cx="55" cy="126.25" r="3" fill="#EEEAF8" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1.2 }} />
        <motion.circle cx="52" cy="72" r="3" fill="#22D3EE" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }} />

        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#22D3EE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
