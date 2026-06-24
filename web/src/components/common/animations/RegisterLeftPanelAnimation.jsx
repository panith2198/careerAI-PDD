import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, BrainIcon, RocketIcon } from '@hugeicons/core-free-icons';

export default function RegisterLeftPanelAnimation({ className = "" }) {
  return (
    <div className={`relative w-full h-full max-w-[260px] max-h-[260px] aspect-square flex items-center justify-center ${className}`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[#8B5CF6]/10 rounded-full blur-3xl opacity-45 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#22D3EE]/5 rounded-full blur-2xl pointer-events-none" />

      <svg
        className="w-full h-full text-foreground select-none pointer-events-none"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Core Definitions */}
        <defs>
          {/* Blueprint Grid Background Pattern */}
          <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(139, 92, 246, 0.03)" strokeWidth="0.8" />
          </pattern>

          {/* Glowing Drop-Shadow Filter */}
          <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core Brand Logo Gradients */}
          <linearGradient id="arrowShaftGrad" x1="24" y1="38" x2="24" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B2FBE" />
            <stop offset="100%" stopColor="#9D4EDD" />
          </linearGradient>

          <linearGradient id="arrowHeadGrad" x1="16" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9D4EDD" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>

          <linearGradient id="basePlatformGrad" x1="12" y1="38" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B2FBE" />
            <stop offset="50%" stopColor="#9D4EDD" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>

          {/* Node Gradients */}
          <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="centerCoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Line drawings gradients */}
          <linearGradient id="pathPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="pathCyan" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Blueprint Grid Overlay */}
        <rect width="300" height="300" fill="url(#blueprintGrid)" className="opacity-90" />

        {/* Constellation Outer Orbital Rings */}
        <motion.circle
          cx="150"
          cy="150"
          r="115"
          stroke="rgba(139, 92, 246, 0.05)"
          strokeWidth="1.2"
          strokeDasharray="6 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="150"
          cy="150"
          r="80"
          stroke="rgba(34, 211, 238, 0.08)"
          strokeWidth="1"
          strokeDasharray="4 6"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Geometric Network Connection Pathways */}
        {/* Sparkles Node (60, 110) -> Central Core (150, 150) */}
        <line x1="60" y1="110" x2="150" y2="150" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1.5" />
        <motion.path
          d="M60,110 L150,150"
          stroke="url(#pathPurple)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.35, 0.8, 1], ease: "easeInOut" }}
        />

        {/* Brain Node (220, 90) -> Central Core (150, 150) */}
        <line x1="220" y1="90" x2="150" y2="150" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1.5" />
        <motion.path
          d="M220,90 L150,150"
          stroke="url(#pathCyan)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.35, 0.8, 1], ease: "easeInOut", delay: 0.6 }}
        />

        {/* Rocket Node (150, 230) -> Central Core (150, 150) */}
        <line x1="150" y1="230" x2="150" y2="150" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1.5" />
        <motion.path
          d="M150,230 L150,150"
          stroke="url(#pathCyan)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.35, 0.8, 1], ease: "easeInOut", delay: 1.2 }}
        />

        {/* Passive Support Mesh lines */}
        {/* Passive 1 (75, 210) -> Sparkles (60, 110) */}
        <line x1="75" y1="210" x2="60" y2="110" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Passive 1 (75, 210) -> Rocket (150, 230) */}
        <line x1="75" y1="210" x2="150" y2="230" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Passive 2 (235, 200) -> Brain (220, 90) */}
        <line x1="235" y1="200" x2="220" y2="90" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Passive 2 (235, 200) -> Rocket (150, 230) */}
        <line x1="235" y1="200" x2="150" y2="230" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Dynamic Traveling Data Packet Particles */}
        <motion.circle
          cx="60" cy="110" r="3" fill="#8B5CF6" filter="url(#neonGlow)"
          animate={{ cx: [60, 150], cy: [110, 150], opacity: [0, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.35, 1], ease: "easeInOut" }}
        />
        <motion.circle
          cx="220" cy="90" r="3" fill="#22D3EE" filter="url(#neonGlow)"
          animate={{ cx: [220, 150], cy: [90, 150], opacity: [0, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.35, 1], ease: "easeInOut", delay: 0.6 }}
        />
        <motion.circle
          cx="150" cy="230" r="3" fill="#22D3EE" filter="url(#neonGlow)"
          animate={{ cx: [150, 150], cy: [230, 150], opacity: [0, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.35, 1], ease: "easeInOut", delay: 1.2 }}
        />

        {/* 5-POINT NETWORK CONSTELLATION GRAPH NODES */}
        
        {/* Node 1: SPARKLES (Left-Top) */}
        <g transform="translate(60, 110)">
          <motion.g
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="0" cy="0" r="18" fill="#0A0A16" stroke="url(#purpleGradient)" strokeWidth="1.5" filter="url(#neonGlow)" />
            <motion.circle cx="0" cy="0" r="22" stroke="#8B5CF6" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 3" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            <foreignObject x="-9" y="-9" width="18" height="18">
              <div className="text-[#8B5CF6] flex items-center justify-center w-full h-full">
                <HugeiconsIcon icon={SparklesIcon} className="size-3.5" strokeWidth={2.2} />
              </div>
            </foreignObject>
            <text x="-65" y="4" fill="#5C5A78" fontSize="7.5" fontFamily="monospace" fontWeight="600" letterSpacing="0.8">PATH.DEC</text>
          </motion.g>
        </g>

        {/* Node 2: BRAIN (Right-Top) */}
        <g transform="translate(220, 90)">
          <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            <circle cx="0" cy="0" r="18" fill="#0A0A16" stroke="url(#cyanGradient)" strokeWidth="1.5" filter="url(#neonGlow)" />
            <motion.circle cx="0" cy="0" r="22" stroke="#22D3EE" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 3" animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            <foreignObject x="-9" y="-9" width="18" height="18">
              <div className="text-[#22D3EE] flex items-center justify-center w-full h-full">
                <HugeiconsIcon icon={BrainIcon} className="size-3.5" strokeWidth={2.2} />
              </div>
            </foreignObject>
            <text x="24" y="4" fill="#5C5A78" fontSize="7.5" fontFamily="monospace" fontWeight="600" letterSpacing="0.8">AI.BRAIN</text>
          </motion.g>
        </g>

        {/* Node 3: ROCKET (Bottom-Center) */}
        <g transform="translate(150, 230)">
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            <circle cx="0" cy="0" r="18" fill="#0A0A16" stroke="url(#cyanGradient)" strokeWidth="1.5" filter="url(#neonGlow)" />
            <motion.circle cx="0" cy="0" r="22" stroke="#22D3EE" strokeWidth="0.8" strokeOpacity="0.3" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <foreignObject x="-9" y="-9" width="18" height="18">
              <div className="text-[#22D3EE] flex items-center justify-center w-full h-full">
                <HugeiconsIcon icon={RocketIcon} className="size-3.5" strokeWidth={2.2} />
              </div>
            </foreignObject>
            <text x="24" y="4" fill="#5C5A78" fontSize="7.5" fontFamily="monospace" fontWeight="600" letterSpacing="0.8">LAUNCH.SYS</text>
          </motion.g>
        </g>

        {/* Node 4: Passive crosshair node (75, 210) */}
        <g transform="translate(75, 210)">
          <motion.g
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* Small crosshair ticks */}
            <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
            <circle cx="0" cy="0" r="2.5" fill="#8B5CF6" />
            <text x="-48" y="3" fill="#5C5A78" fontSize="6.5" fontFamily="monospace" letterSpacing="0.5">DB.SYNC</text>
          </motion.g>
        </g>

        {/* Node 5: Passive crosshair node (235, 200) */}
        <g transform="translate(235, 200)">
          <motion.g
            animate={{ scale: [1.05, 0.95, 1.05] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1" />
            <circle cx="0" cy="0" r="2.5" fill="#22D3EE" />
            <text x="10" y="3" fill="#5C5A78" fontSize="6.5" fontFamily="monospace" letterSpacing="0.5">NET.LOG</text>
          </motion.g>
        </g>

        {/* CENTER NODE: AI CORE SYNERGY GATEWAY */}
        <g transform="translate(150, 150)">
          <circle cx="0" cy="0" r="26" fill="#0A0A16" stroke="url(#centerCoreGrad)" strokeWidth="2" filter="url(#neonGlow)" />
          <motion.circle
            cx="0"
            cy="0"
            r="31"
            stroke="url(#centerCoreGrad)"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          {/* Logo inner vectors centered and scaled down to fit r=26 */}
          <g transform="scale(0.85) translate(-24, -24)">
            {/* Arrow shaft (career growth) */}
            <path d="M24,8 L24,38" stroke="url(#arrowShaftGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

            {/* Arrow head */}
            <path d="M16,18 L24,8 L32,18" stroke="url(#arrowHeadGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* AI circuit branches */}
            <path d="M24,26 L14,20" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M24,26 L34,20" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M24,32 L12,29" stroke="#7B2FBE" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M24,32 L36,29" stroke="#7B2FBE" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Circuit nodes */}
            <path d="M24,8 m-3,0 a3,3 0,1 1,6 0 a3,3 0,1 1,-6 0" fill="#9D4EDD" />
            <path d="M24,26 m-2.5,0 a2.5,2.5 0,1 1,5 0 a2.5,2.5 0,1 1,-5 0" fill="#00D4FF" />
            <path d="M14,20 m-2,0 a2,2 0,1 1,4 0 a2,2 0,1 1,-4 0" fill="#00D4FF" />
            <path d="M34,20 m-2,0 a2,2 0,1 1,4 0 a2,2 0,1 1,-4 0" fill="#00D4FF" />
            <path d="M24,32 m-2,0 a2,2 0,1 1,4 0 a2,2 0,1 1,-4 0" fill="#9D4EDD" />
            <circle cx="12" cy="29" r="1.5" fill="#7B2FBE" />
            <circle cx="36" cy="29" r="1.5" fill="#7B2FBE" />

            {/* Base platform */}
            <path d="M12,38 L36,38" stroke="url(#basePlatformGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    </div>
  );
}
