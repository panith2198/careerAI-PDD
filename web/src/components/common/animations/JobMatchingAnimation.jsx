import React from 'react';
import { motion } from 'framer-motion';

export default function JobMatchingAnimation() {
  return (
    <div className="relative w-full max-w-[340px] mx-auto aspect-square flex items-center justify-center p-4 bg-surface-2 border border-border rounded-2xl shadow-xl text-left">
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30"></div>
      
      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient background grids */}
        <path d="M40,100 H160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="2 2" />
        <path d="M100,40 V160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Dynamic connecting lines from User profile to Core */}
        <motion.path
          d="M45,70 Q70,70 100,100"
          stroke="url(#purpleMatchGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="80"
          initial={{ strokeDashoffset: 80 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M45,130 Q70,130 100,100"
          stroke="url(#purpleMatchGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="80"
          initial={{ strokeDashoffset: 80 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
        />

        {/* Dynamic connecting lines from Job to Core */}
        <motion.path
          d="M155,70 Q130,70 100,100"
          stroke="url(#cyanMatchGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="80"
          initial={{ strokeDashoffset: -80 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M155,130 Q130,130 100,100"
          stroke="url(#cyanMatchGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="80"
          initial={{ strokeDashoffset: -80 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
        />

        {/* User Skills Node Group */}
        <g transform="translate(15, 60)">
          <rect x="0" y="0" width="30" height="80" rx="4" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1.5" />
          <text x="15" y="12" textAnchor="middle" fill="#C4B5FD" fontSize="6" fontFamily="monospace">USER</text>
          
          <circle cx="15" cy="32" r="4" fill="#8B5CF6" />
          <circle cx="15" cy="50" r="4" fill="#A78BFA" />
          <circle cx="15" cy="68" r="4" fill="#8B5CF6" />

          {/* User profile signals */}
          <motion.circle cx="15" cy="32" r="7" stroke="#8B5CF6" strokeWidth="0.5" strokeOpacity="0.5" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
          <motion.circle cx="15" cy="50" r="7" stroke="#A78BFA" strokeWidth="0.5" strokeOpacity="0.5" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
        </g>

        {/* Job Requirements Node Group */}
        <g transform="translate(155, 60)">
          <rect x="0" y="0" width="30" height="80" rx="4" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="1.5" />
          <text x="15" y="12" textAnchor="middle" fill="#22D3EE" fontSize="6" fontFamily="monospace">JOB</text>

          <circle cx="15" cy="32" r="4" fill="#22D3EE" />
          <circle cx="15" cy="50" r="4" fill="#00D4FF" />
          <circle cx="15" cy="68" r="4" fill="#22D3EE" />

          {/* Job signals */}
          <motion.circle cx="15" cy="32" r="7" stroke="#22D3EE" strokeWidth="0.5" strokeOpacity="0.5" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }} />
          <motion.circle cx="15" cy="50" r="7" stroke="#00D4FF" strokeWidth="0.5" strokeOpacity="0.5" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.7 }} />
        </g>

        {/* Core Match Indexer */}
        <g transform="translate(100, 100)">
          {/* External rotating dial */}
          <motion.circle
            cx="0"
            cy="0"
            r="32"
            stroke="url(#radialIndicator)"
            strokeWidth="2.5"
            strokeDasharray="201"
            initial={{ strokeDashoffset: 201 }}
            animate={{ strokeDashoffset: 30 }} // 85% match fit arc
            transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1.5 }}
            style={{ transformOrigin: '0px 0px', transform: 'rotate(-90deg)' }}
          />

          {/* Core glow and display */}
          <circle cx="0" cy="0" r="26" fill="#0F0F1C" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <motion.text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#EEEAF8"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            95%
          </motion.text>
          <text x="0" y="14" textAnchor="middle" fill="#22D3EE" fontSize="5" fontFamily="monospace">MATCH</text>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="purpleMatchGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="cyanMatchGrad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          <linearGradient id="radialIndicator" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
