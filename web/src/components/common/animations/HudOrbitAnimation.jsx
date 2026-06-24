import React from 'react';
import { motion } from 'framer-motion';

export default function HudOrbitAnimation() {
  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-primary/10 rounded blur-3xl opacity-60"></div>
      
      <svg
        className="w-full h-full text-primary"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Orbit Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.15"
          strokeDasharray="6 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />

        {/* Outer Orbit Node */}
        <motion.circle
          cx="100"
          cy="20"
          r="4"
          fill="#22D3EE"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Middle Orbit Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="60"
          stroke="url(#purpleGlowGrad)"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="40 10 10 10"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />

        {/* Floating Node 1 */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="40" r="3" fill="#8B5CF6" />
          <line x1="100" y1="40" x2="100" y2="100" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
        </motion.g>

        {/* Floating Node 2 */}
        <motion.g
          animate={{ rotate: -180 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="40" cy="100" r="3.5" fill="#22D3EE" />
          <line x1="40" y1="100" x2="100" y2="100" stroke="#22D3EE" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.4" />
        </motion.g>

        {/* Inner Radar Sweeper */}
        <motion.circle
          cx="100"
          cy="100"
          r="40"
          stroke="#8B5CF6"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '100px 100px' }}
        />

        {/* Tech crosshairs */}
        <path d="M100 85 V75 M100 115 V125 M85 100 H75 M115 100 H125" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.5" />

        {/* Core Glowing Orb */}
        <circle cx="100" cy="100" r="20" fill="url(#coreGlow)" />
        <motion.circle
          cx="100"
          cy="100"
          r="25"
          stroke="#A78BFA"
          strokeWidth="1"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Gradients */}
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#060608" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="purpleGlowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>

      {/* Futuristic floating stats */}
      <div className="absolute top-1/4 left-2 bg-surface-2/80 backdrop-blur-md border border-border p-2 rounded-lg text-[10px] font-mono leading-none flex flex-col gap-1 shadow-lg pointer-events-none">
        <span className="text-primary-glow font-bold">RADAR ACTIVE</span>
        <span className="text-text-tertiary">LAT: 47.902</span>
        <span className="text-text-tertiary">LNG: -122.33</span>
      </div>

      <div className="absolute bottom-1/4 right-2 bg-surface-2/80 backdrop-blur-md border border-border p-2 rounded-lg text-[10px] font-mono leading-none flex flex-col gap-1 shadow-lg pointer-events-none">
        <span className="text-cyan-brand font-bold">RAG RESPONSE</span>
        <span className="text-text-tertiary">FIT: 98.4%</span>
        <span className="text-text-tertiary">LATENCY: 120ms</span>
      </div>
    </div>
  );
}
