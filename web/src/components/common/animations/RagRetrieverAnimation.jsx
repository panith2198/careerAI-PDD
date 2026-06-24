import React from 'react';
import { motion } from 'framer-motion';

export default function RagRetrieverAnimation() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-[16/10] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30"></div>
      
      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 300 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection paths */}
        <path d="M70,90 H120" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M180,90 H230" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" strokeDasharray="3 3" />

        {/* User Prompt (Input Node) */}
        <g>
          <rect x="10" y="65" width="60" height="50" rx="6" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1.5" />
          <text x="40" y="82" textAnchor="middle" fill="#EEEAF8" fontSize="8" fontFamily="monospace">PROMPT</text>
          <line x1="20" y1="92" x2="60" y2="92" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.4" />
          <line x1="20" y1="102" x2="50" y2="102" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* Vector DB (Central Node) */}
        <g>
          <circle cx="150" cy="90" r="30" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="2" />
          <motion.circle
            cx="150"
            cy="90"
            r="38"
            stroke="#22D3EE"
            strokeWidth="1"
            strokeOpacity="0.4"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: '150px 90px' }}
          />
          <text x="150" y="88" textAnchor="middle" fill="#22D3EE" fontSize="8" fontFamily="monospace" fontWeight="bold">VECTOR</text>
          <text x="150" y="98" textAnchor="middle" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold">DB</text>
          
          {/* DB Internal dots representing search matches */}
          <motion.circle cx="140" cy="78" r="2" fill="#8B5CF6" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
          <motion.circle cx="160" cy="82" r="2" fill="#22D3EE" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} />
          <motion.circle cx="145" cy="100" r="2" fill="#8B5CF6" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} />
        </g>

        {/* AI Answer Card (Output Node) */}
        <g>
          <rect x="230" y="65" width="60" height="50" rx="6" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1.5" />
          <text x="260" y="82" textAnchor="middle" fill="#EEEAF8" fontSize="8" fontFamily="monospace">ADVICE</text>
          <line x1="240" y1="92" x2="280" y2="92" stroke="#22D3EE" strokeWidth="1" />
          <line x1="240" y1="102" x2="270" y2="102" stroke="#22D3EE" strokeWidth="1" />
        </g>

        {/* Prompt Data Packet traveling to Vector DB */}
        <motion.circle
          cx="70"
          cy="90"
          r="4"
          fill="#8B5CF6"
          animate={{
            cx: [70, 120, 120, 70],
            opacity: [1, 1, 0, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.45, 0.5, 1]
          }}
        />

        {/* Retrieved Data Packet traveling to Advice Output */}
        <motion.circle
          cx="180"
          cy="90"
          r="4"
          fill="#22D3EE"
          animate={{
            cx: [180, 230, 230, 180],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
            times: [0, 0.45, 0.9, 1]
          }}
        />
      </svg>
    </div>
  );
}
