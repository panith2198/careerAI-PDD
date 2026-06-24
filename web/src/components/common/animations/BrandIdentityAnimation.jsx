import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BrandIdentityAnimation() {
  const [pulseState, setPulseState] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseState(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
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
        {/* Connecting circuit lines in middle layer */}
        <g>
          <path d="M125,130 H295" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
          <path d="M125,90 L170,130 L125,170" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M295,90 L250,130 L295,170" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Traveling energy pulses converging on logo */}
          <motion.circle
            cx="125"
            cy="130"
            r="3"
            fill="#22D3EE"
            animate={{ cx: [125, 210], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />

          <motion.circle
            cx="295"
            cy="130"
            r="3"
            fill="#8B5CF6"
            animate={{ cx: [295, 210], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </g>

        {/* LEFT PANEL: BLUEPRINT SCHEMATIC */}
        <g transform="translate(15, 15)">
          <rect width="115" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">SCHEMATICS</text>
          <line x1="15" y1="28" x2="100" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Circuit grids blueprint */}
          <g transform="translate(15, 42)">
            <rect width="85" height="130" rx="4" fill="none" stroke="rgba(139, 92, 246, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Grid line traces */}
            <line x1="20" y1="0" x2="20" y2="130" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="42" y1="0" x2="42" y2="130" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="64" y1="0" x2="64" y2="130" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            
            <line x1="0" y1="30" x2="85" y2="30" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="0" y1="65" x2="85" y2="65" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            <line x1="0" y1="100" x2="85" y2="100" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

            {/* Glowing trace pathways */}
            <motion.path
              d="M10,20 L30,40 L60,40 L80,60"
              stroke="#8B5CF6"
              strokeWidth="1.2"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.path
              d="M75,10 L45,40 L20,40 L5,55"
              stroke="#22D3EE"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </g>

          {/* Blueprint index status */}
          <g transform="translate(15, 192)">
            <text x="0" y="5" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">GRID_TRACE: ACTIVE</text>
            <rect x="0" y="12" width="85" height="12" rx="3" fill="rgba(139,92,246,0.05)" />
            <text x="8" y="20" fill="#8B5CF6" fontSize="6.5" fontFamily="monospace" fontWeight="bold">CONVERGENT</text>
          </g>
        </g>

        {/* CENTER PANEL: ROTATING CORE LOGO */}
        <g transform="translate(145, 15)">
          <rect width="130" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="65" y="22" textAnchor="middle" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">CORE BRAND</text>
          <line x1="15" y1="28" x2="115" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Giant logo element container */}
          <g transform="translate(65, 115)">
            {/* Ambient logo orbits */}
            <motion.circle
              r="48"
              stroke="rgba(139, 92, 246, 0.15)"
              strokeWidth="1"
              strokeDasharray="6 3"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />

            <motion.circle
              r="40"
              stroke="rgba(34, 211, 238, 0.15)"
              strokeWidth="1"
              strokeDasharray="4 2"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
          </g>

          {/* Embedded Logo centering frame */}
          <g transform="translate(41, 91)">
            <motion.g
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: '24px 24px' }}
            >
              {/* Logo Path geometries copied directly from Logo.jsx */}
              {/* Arrow shaft */}
              <motion.path
                d="M24,8 L24,38"
                stroke="url(#shaftGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5 }}
              />

              {/* Arrow head */}
              <motion.path
                d="M16,18 L24,8 L32,18"
                stroke="url(#headGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 0.5 }}
              />

              {/* AI circuit branches */}
              <path d="M24,26 L14,20" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M24,26 L34,20" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M24,32 L12,29" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M24,32 L36,29" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />

              {/* Circuit nodes */}
              <circle cx="24" cy="8" r="3" fill="#8B5CF6" />
              <circle cx="24" cy="26" r="2.5" fill="#22D3EE" />
              <circle cx="14" cy="20" r="2" fill="#22D3EE" />
              <circle cx="34" cy="20" r="2" fill="#22D3EE" />
              <circle cx="24" cy="32" r="2" fill="#8B5CF6" />
              <circle cx="12" cy="29" r="1.5" fill="#8B5CF6" />
              <circle cx="36" cy="29" r="1.5" fill="#8B5CF6" />

              {/* Base platform */}
              <path d="M12,38 L36,38" stroke="url(#platformGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </motion.g>
          </g>

          {/* Lower identity label */}
          <g transform="translate(15, 192)">
            <text x="50" y="16" textAnchor="middle" fill="#22D3EE" fontSize="7.5" fontFamily="monospace" fontWeight="bold">CAREERAI SYMBOL</text>
          </g>
        </g>

        {/* RIGHT PANEL: BRAND METRICS */}
        <g transform="translate(290, 15)">
          <rect width="115" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">IDENTITY SPEC</text>
          <line x1="15" y1="28" x2="100" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Metric Specifications list */}
          <g transform="translate(15, 42)">
            {/* Spec 1 */}
            <g transform="translate(0, 0)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">ARROW ANGLE</text>
              <text x="0" y="18" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold">90° DIRECT UP</text>
            </g>

            {/* Spec 2 */}
            <g transform="translate(0, 32)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">CIRCUIT NODES</text>
              <text x="0" y="18" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold">7 ACTIVE SYNC</text>
            </g>

            {/* Spec 3 */}
            <g transform="translate(0, 64)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">COLOR PHILOSOPHY</text>
              <text x="0" y="18" fill="#10B981" fontSize="8" fontFamily="monospace" fontWeight="bold">STRICT MONO</text>
            </g>
          </g>

          <line x1="15" y1="150" x2="100" y2="150" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Success checklist indicator */}
          <g transform="translate(15, 160)">
            <circle cx="5" cy="12" r="4.5" fill="#0F0F1C" stroke="#10B981" strokeWidth="1" />
            <path d="M2.5,12 L4.5,14 L7.5,10.5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
            <text x="16" y="15" fill="#10B981" fontSize="7" fontFamily="sans-serif" fontWeight="bold">BRAND VERIFIED</text>
            <text x="16" y="24" fill="#9D99B8" fontSize="5.5" fontFamily="monospace">SYNAPSE NOMINAL</text>
          </g>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="shaftGrad" x1="24" y1="38" x2="24" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
          <linearGradient id="headGrad" x1="16" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="platformGrad" x1="12" y1="38" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
