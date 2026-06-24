import React from 'react';
import { motion } from 'framer-motion';

export default function LoginLeftPanelAnimation() {
  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl opacity-55 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-brand/5 rounded-full blur-2xl pointer-events-none" />

      <svg
        className="w-full h-full text-foreground select-none pointer-events-none"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient orbital rings */}
        <motion.circle
          cx="150"
          cy="150"
          r="110"
          stroke="rgba(139, 92, 246, 0.08)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        />

        <motion.circle
          cx="150"
          cy="150"
          r="75"
          stroke="rgba(34, 211, 238, 0.1)"
          strokeWidth="1"
          strokeDasharray="12 6"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Network connection lines */}
        {/* Left branch line (User -> Core) */}
        <line x1="60" y1="150" x2="118" y2="150" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1.5" />
        <motion.path
          d="M60,150 H118"
          stroke="url(#purpleDrawGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 0.8, 1], ease: "easeInOut" }}
        />

        {/* Right branch line (Skills -> Core) */}
        <line x1="240" y1="150" x2="182" y2="150" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1.5" />
        <motion.path
          d="M240,150 H182"
          stroke="url(#cyanDrawGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 0.8, 1], ease: "easeInOut", delay: 0.5 }}
        />

        {/* Top branch line (Core -> Target Career) */}
        <line x1="150" y1="118" x2="150" y2="60" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1.5" />
        <motion.path
          d="M150,118 V60"
          stroke="url(#emeraldDrawGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.85, 1], ease: "easeInOut" }}
        />

        {/* Traveling data signal particles */}
        {/* Left signal */}
        <motion.circle
          cx="60"
          cy="150"
          r="3"
          fill="#8B5CF6"
          animate={{ cx: [60, 118, 118], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 1], ease: "easeInOut" }}
        />

        {/* Right signal */}
        <motion.circle
          cx="240"
          cy="150"
          r="3"
          fill="#22D3EE"
          animate={{ cx: [240, 182, 182], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 1], ease: "easeInOut", delay: 0.5 }}
        />

        {/* Upward launch signal (triggered once particles meet) */}
        <motion.circle
          cx="150"
          cy="118"
          r="4"
          fill="#10B981"
          animate={{ cy: [118, 60, 60], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 1], ease: "easeOut" }}
        />

        {/* LEFT NODE: USER PROFILE */}
        <g transform="translate(42, 132)">
          <circle cx="18" cy="18" r="18" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1.5" />
          <motion.circle cx="18" cy="18" r="23" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.4" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} />
          {/* User head outline */}
          <path d="M10,26 C10,21 26,21 26,26" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="18" cy="17" r="4.5" fill="#8B5CF6" />
        </g>

        {/* RIGHT NODE: ASSESSMENT SKILLS */}
        <g transform="translate(222, 132)">
          <circle cx="18" cy="18" r="18" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="1.5" />
          <motion.circle cx="18" cy="18" r="23" stroke="#22D3EE" strokeWidth="1" strokeOpacity="0.4" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.6 }} />
          {/* Document checklist symbol */}
          <rect x="12" y="10" width="12" height="15" rx="1.5" stroke="#22D3EE" strokeWidth="1.2" />
          <line x1="15" y1="14" x2="21" y2="14" stroke="#22D3EE" strokeWidth="1" strokeLinecap="round" />
          <line x1="15" y1="18" x2="21" y2="18" stroke="#22D3EE" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* TOP NODE: TARGET JOBS (EMERALD) */}
        <g transform="translate(132, 42)">
          <circle cx="18" cy="18" r="18" fill="#0F0F1C" stroke="#10B981" strokeWidth="1.5" />
          <motion.circle cx="18" cy="18" r="23" stroke="#10B981" strokeWidth="1" strokeOpacity="0.4" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2.5, delay: 1.2 }} />
          {/* Briefcase symbol */}
          <rect x="11" y="13" width="14" height="10" rx="1.5" stroke="#10B981" strokeWidth="1.2" />
          <path d="M14,13 V11 C14,10.2 14.8,9.5 15.6,9.5 H20.4 C21.2,9.5 22,10.2 22,11 V13" stroke="#10B981" strokeWidth="1.2" />
        </g>

        {/* CENTER NODE: AI CORE SYNERGY GATEWAY */}
        <g transform="translate(118, 118)">
          <circle cx="32" cy="32" r="32" fill="#0F0F1C" stroke="url(#coreGatewayGrad)" strokeWidth="2" />
          <motion.circle cx="32" cy="32" r="37" stroke="url(#coreGatewayGrad)" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
          
          {/* Embedding Navigator brand symbol inside the core */}
          <g transform="translate(8, 8)">
            {/* Shaft */}
            <path d="M24,8 L24,38" stroke="url(#shaftCoreGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* Head */}
            <path d="M16,18 L24,8 L32,18" stroke="url(#headCoreGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            {/* AI branches */}
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
          </g>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="coreGatewayGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="shaftCoreGrad" x1="24" y1="38" x2="24" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>
          <linearGradient id="headCoreGrad" x1="16" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="purpleDrawGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="cyanDrawGrad" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="emeraldDrawGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
