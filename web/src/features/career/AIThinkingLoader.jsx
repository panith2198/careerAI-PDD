import React from 'react';
import { motion } from 'framer-motion';

export default function AIThinkingLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 select-none">
      <div className="relative size-36 flex items-center justify-center">
        {/* Glowing rotating particle orbits */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          className="absolute inset-0 border border-dashed border-violet-500/30 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
          className="absolute inset-2 border border-dashed border-cyan-500/20 rounded-full"
        />

        {/* Pulsing glow filter */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute size-24 bg-violet-600/10 rounded-full blur-2xl"
        />

        {/* High-fidelity brain mesh vector */}
        <svg viewBox="0 0 100 100" className="size-20 relative z-10 text-violet-400">
          <defs>
            <linearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>

          {/* Left Hemisphere Outline */}
          <motion.path
            d="M 50 20 C 35 20, 20 30, 20 50 C 20 65, 30 75, 45 78 C 47 78, 50 75, 50 72 Z"
            fill="none"
            stroke="url(#brainGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ strokeDashoffset: [0, -100] }}
            strokeDasharray="4 4"
            transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
          />

          {/* Right Hemisphere Outline */}
          <motion.path
            d="M 50 20 C 65 20, 80 30, 80 50 C 80 65, 70 75, 55 78 C 53 78, 50 75, 50 72 Z"
            fill="none"
            stroke="url(#brainGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ strokeDashoffset: [0, 100] }}
            strokeDasharray="4 4"
            transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
          />

          {/* Synapses (pulsing connection dots) */}
          <motion.circle cx="35" cy="40" r="3" fill="#8B5CF6" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
          <motion.circle cx="65" cy="40" r="3" fill="#22D3EE" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }} />
          <motion.circle cx="30" cy="55" r="3.5" fill="#22D3EE" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} />
          <motion.circle cx="70" cy="55" r="3.5" fill="#8B5CF6" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.8 }} />
          <motion.circle cx="45" cy="68" r="2.5" fill="#8B5CF6" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.1 }} />
          <motion.circle cx="55" cy="68" r="2.5" fill="#22D3EE" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.5 }} />

          {/* Connecting internal circuit lines */}
          <line x1="35" y1="40" x2="45" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="65" y1="40" x2="55" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="30" y1="55" x2="45" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="70" y1="55" x2="55" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        </svg>
      </div>

      <div className="text-center space-y-1.5 z-10">
        <h3 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Analyzing your career profile...
        </h3>
        <p className="text-xs text-[#9D99B8] max-w-sm">
          Finding opportunities aligned with your skills and goals.
        </p>
      </div>
    </div>
  );
}
