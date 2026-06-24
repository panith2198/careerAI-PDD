import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AtsFeedbackAnimation() {
  const [scanState, setScanState] = useState('idle'); // idle, scanning, parsing, completed
  const [score, setScore] = useState(0);

  useEffect(() => {
    let interval;
    const runAnimationCycle = () => {
      setScanState('idle');
      setScore(0);

      // 1. Idle phase
      const t1 = setTimeout(() => {
        setScanState('scanning');
        
        // Count up score simulation during scan
        let currentScore = 0;
        interval = setInterval(() => {
          if (currentScore < 94) {
            currentScore += 2;
            setScore(currentScore);
          } else {
            clearInterval(interval);
          }
        }, 30);
      }, 800);

      // 2. Parsing phase
      const t2 = setTimeout(() => {
        setScanState('parsing');
      }, 2500);

      // 3. Completed phase
      const t3 = setTimeout(() => {
        setScanState('completed');
      }, 4200);

      return [t1, t2, t3];
    };

    let timeouts = runAnimationCycle();
    const cycleInterval = setInterval(() => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      timeouts = runAnimationCycle();
    }, 8500);

    return () => {
      clearInterval(interval);
      clearInterval(cycleInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Circle perimeter calculation for R=32 (2 * PI * 32 = ~201)
  const strokeDashoffset = 201 - (201 * score) / 100;

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-[16/10] flex items-center justify-center p-4 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-brand/10 rounded blur-2xl opacity-20 pointer-events-none" />
      
      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 420 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamic connection paths (bridge) between Resume & ATS Dashboard */}
        <g>
          {/* Main flow line */}
          <path d="M145,130 Q200,80 255,130" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M145,130 Q200,180 255,130" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M145,130 H255" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" strokeDasharray="3 3" />

          {/* Traveling particles */}
          {scanState === 'scanning' && (
            <>
              <motion.circle
                cx="145"
                cy="130"
                r="3"
                fill="#22D3EE"
                animate={{
                  cx: [145, 200, 255],
                  cy: [130, 93, 130],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx="145"
                cy="130"
                r="3"
                fill="#8B5CF6"
                animate={{
                  cx: [145, 200, 255],
                  cy: [130, 167, 130],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <motion.circle
                cx="145"
                cy="130"
                r="2"
                fill="#10B981"
                animate={{
                  cx: [145, 255],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.2 }}
              />
            </>
          )}
        </g>

        {/* Central Parser AI Engine Node */}
        <g transform="translate(200, 130)">
          {/* Outer rotating gear/orbit */}
          <motion.circle
            r="20"
            stroke="url(#aiNodeGrad)"
            strokeWidth="1.5"
            strokeDasharray="8 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner core */}
          <circle r="14" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
          <motion.circle
            r="8"
            fill={scanState === 'scanning' ? '#22D3EE' : scanState === 'parsing' ? '#A78BFA' : '#10B981'}
            animate={{ scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* LEFT PANEL: RESUME DOCUMENT */}
        <g transform="translate(15, 15)">
          {/* Panel Base */}
          <rect x="0" y="0" width="130" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header metadata */}
          <rect x="15" y="15" width="40" height="6" rx="3" fill="rgba(255, 255, 255, 0.2)" />
          <circle cx="115" cy="18" r="4" fill="url(#purpleMatchGrad)" />

          {/* Lines representing resume layout */}
          {/* Section 1: Summary */}
          <rect x="15" y="32" width="25" height="4" rx="2" fill="#8B5CF6" fillOpacity="0.8" />
          <line x1="15" y1="44" x2="115" y2="44" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="52" x2="100" y2="52" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="60" x2="110" y2="60" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Section 2: Experience with highlighting tokens */}
          <rect x="15" y="76" width="35" height="4" rx="2" fill="#8B5CF6" fillOpacity="0.8" />
          
          {/* Job line 1 */}
          <line x1="15" y1="88" x2="115" y2="88" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Target keywords highlighted on scan */}
          <rect x="15" y="94" width="40" height="6" rx="3" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="1" />
          <text x="35" y="99" textAnchor="middle" fill="#22D3EE" fontSize="5" fontFamily="monospace">REACT</text>
          
          <rect x="60" y="94" width="55" height="6" rx="3" fill="#0F0F1C" stroke="#A78BFA" strokeWidth="1" />
          <text x="87" y="99" textAnchor="middle" fill="#A78BFA" fontSize="5" fontFamily="monospace">PYTHON API</text>

          {/* Job line 2 */}
          <line x1="15" y1="110" x2="115" y2="110" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
          
          <rect x="15" y="116" width="48" height="6" rx="3" fill="#0F0F1C" stroke="#10B981" strokeWidth="1" />
          <text x="39" y="121" textAnchor="middle" fill="#10B981" fontSize="5" fontFamily="monospace">POSTGRES</text>

          <rect x="68" y="116" width="47" height="6" rx="3" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="1" />
          <text x="91" y="121" textAnchor="middle" fill="#22D3EE" fontSize="5" fontFamily="monospace">DOCKER</text>

          {/* Section 3: Skills */}
          <rect x="15" y="136" width="30" height="4" rx="2" fill="#8B5CF6" fillOpacity="0.8" />
          <line x1="15" y1="148" x2="115" y2="148" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Extra keyword badges */}
          <g transform="translate(0, 4)">
            <rect x="15" y="152" width="35" height="6" rx="3" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
            <text x="32.5" y="157" textAnchor="middle" fill="rgba(255, 255, 255, 0.5)" fontSize="5" fontFamily="monospace">CSS3</text>
            
            <rect x="55" y="152" width="32" height="6" rx="3" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="1" />
            <text x="71" y="157" textAnchor="middle" fill="#22D3EE" fontSize="5" fontFamily="monospace">GIT</text>
            
            <rect x="92" y="152" width="23" height="6" rx="3" fill="#0F0F1C" stroke="#F59E0B" strokeWidth="1" />
            <text x="103.5" y="157" textAnchor="middle" fill="#F59E0B" fontSize="5" fontFamily="monospace">RAG</text>
          </g>

          <line x1="15" y1="172" x2="80" y2="172" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="180" x2="105" y2="180" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Animated Laser Scan Bar */}
          {scanState === 'scanning' && (
            <motion.g
              animate={{ y: [15, 205, 15] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Laser Core */}
              <line x1="5" y1="0" x2="125" y2="0" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
              {/* Laser Light Flare */}
              <line x1="5" y1="0" x2="125" y2="0" stroke="#22D3EE" strokeWidth="8" strokeOpacity="0.25" strokeLinecap="round" />
              {/* Small horizontal laser tracking nodes */}
              <circle cx="10" cy="0" r="1.5" fill="#22D3EE" />
              <circle cx="120" cy="0" r="1.5" fill="#22D3EE" />
            </motion.g>
          )}
        </g>

        {/* RIGHT PANEL: ATS ANALYSIS REPORT */}
        <g transform="translate(255, 15)">
          {/* Panel Base */}
          <rect x="0" y="0" width="150" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="20" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold">ATS FEEDBACK</text>
          
          {/* Status Indicator Badge */}
          <g transform="translate(90, 11)">
            <rect
              width="45"
              height="11"
              rx="3"
              fill={scanState === 'idle' ? 'rgba(255,255,255,0.05)' : scanState === 'scanning' ? 'rgba(34,211,238,0.1)' : 'rgba(16,185,129,0.1)'}
              stroke={scanState === 'idle' ? 'rgba(255,255,255,0.1)' : scanState === 'scanning' ? '#22D3EE' : '#10B981'}
              strokeWidth="0.5"
            />
            <text x="22.5" y="8" textAnchor="middle" fill={scanState === 'idle' ? '#9D99B8' : scanState === 'scanning' ? '#22D3EE' : '#10B981'} fontSize="5" fontFamily="sans-serif" fontWeight="bold">
              {scanState === 'idle' ? 'STANDBY' : scanState === 'scanning' ? 'ANALYZING' : 'OPTIMIZED'}
            </text>
          </g>

          {/* Radial score progress ring */}
          <g transform="translate(75, 75)">
            {/* Background circle track */}
            <circle cx="0" cy="0" r="32" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="3" />
            
            {/* Animated progress circle */}
            <motion.circle
              cx="0"
              cy="0"
              r="32"
              stroke="url(#radialIndicatorGrad)"
              strokeWidth="3.5"
              strokeDasharray="201"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transformOrigin: '0px 0px', transform: 'rotate(-90deg)' }}
            />
            
            {/* Central Score Text */}
            <motion.text
              x="0"
              y="3"
              textAnchor="middle"
              fill="#EEEAF8"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {score}%
            </motion.text>
            <text x="0" y="14" textAnchor="middle" fill="#9D99B8" fontSize="4.5" fontFamily="monospace" letterSpacing="0.5">FIT INDEX</text>
          </g>

          {/* Validation Checklist Group */}
          <g transform="translate(15, 130)">
            {/* Checklist Item 1: Keyword Check */}
            <g transform="translate(0, 0)">
              {/* Status circle */}
              <circle cx="6" cy="6" r="4.5" fill="#0F0F1C" stroke={scanState === 'completed' || scanState === 'parsing' ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              
              {/* Checkmark path */}
              <motion.path
                d="M3.5,6 L5,7.5 L8.5,4.5"
                stroke="#10B981"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: scanState === 'completed' || scanState === 'parsing' ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />

              <text x="18" y="9" fill={scanState === 'completed' || scanState === 'parsing' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">
                Keywords Match (+12 found)
              </text>
            </g>

            {/* Checklist Item 2: Format Rules */}
            <g transform="translate(0, 20)">
              <circle cx="6" cy="6" r="4.5" fill="#0F0F1C" stroke={scanState === 'completed' || scanState === 'parsing' ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              <motion.path
                d="M3.5,6 L5,7.5 L8.5,4.5"
                stroke="#10B981"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: scanState === 'completed' || scanState === 'parsing' ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
              <text x="18" y="9" fill={scanState === 'completed' || scanState === 'parsing' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">
                Formatting Validation (Passed)
              </text>
            </g>

            {/* Checklist Item 3: Section Headers */}
            <g transform="translate(0, 40)">
              <circle cx="6" cy="6" r="4.5" fill="#0F0F1C" stroke={scanState === 'completed' || scanState === 'parsing' ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              <motion.path
                d="M3.5,6 L5,7.5 L8.5,4.5"
                stroke="#10B981"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: scanState === 'completed' || scanState === 'parsing' ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              />
              <text x="18" y="9" fill={scanState === 'completed' || scanState === 'parsing' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">
                Layout Structure (Clean)
              </text>
            </g>

            {/* Checklist Item 4: Experience Gaps */}
            <g transform="translate(0, 60)">
              {/* Alert / Warning status */}
              <circle cx="6" cy="6" r="4.5" fill="#0F0F1C" stroke={scanState === 'completed' ? '#F59E0B' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              
              {/* Warning exclamation point */}
              <motion.path
                d="M6,3.5 L6,6 M6,8.5 L6,8.5"
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: scanState === 'completed' ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              />
              
              <text x="18" y="9" fill={scanState === 'completed' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">
                Action Verbs Impact (Weak)
              </text>
            </g>
          </g>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="aiNodeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="purpleMatchGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="radialIndicatorGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
