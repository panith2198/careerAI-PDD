import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AiJobMatchingAnimation() {
  const [matchState, setMatchState] = useState('scanning'); // scanning, processing, calculated
  const [score, setScore] = useState(45);

  useEffect(() => {
    let interval;
    const runCycle = () => {
      setMatchState('scanning');
      setScore(45);

      // Count up score simulation during scan
      const t1 = setTimeout(() => {
        setMatchState('processing');
        let currentScore = 45;
        interval = setInterval(() => {
          if (currentScore < 97) {
            currentScore += 2;
            setScore(currentScore);
          } else {
            clearInterval(interval);
          }
        }, 30);
      }, 1200);

      // Conclude calculation
      const t2 = setTimeout(() => {
        setMatchState('calculated');
      }, 3500);

      return [t1, t2];
    };

    let timeouts = runCycle();
    const cycleInterval = setInterval(() => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
      timeouts = runCycle();
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(cycleInterval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Perimeter for circle progress R=32 (2 * PI * 32 = ~201)
  const strokeDashoffset = 201 - (201 * score) / 100;

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-[16/10] flex items-center justify-center p-4 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-brand/10 rounded blur-2xl opacity-20 pointer-events-none" />

      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 420 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamic connection paths from candidate attributes to job requirements */}
        <g>
          <path d="M150,80 Q205,50 260,80" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M150,180 Q205,210 260,180" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M150,130 H260" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />

          {/* Traveling match indicators */}
          {matchState === 'processing' && (
            <>
              <motion.circle
                cx="150"
                cy="80"
                r="3"
                fill="#22D3EE"
                animate={{ cx: [150, 260], cy: [80, 130, 80], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.circle
                cx="150"
                cy="180"
                r="3"
                fill="#8B5CF6"
                animate={{ cx: [150, 260], cy: [180, 130, 180], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </>
          )}
        </g>

        {/* Central Match Aggregator Matrix */}
        <g transform="translate(205, 130)">
          <motion.circle
            r="20"
            stroke="url(#matchAggGrad)"
            strokeWidth="1.2"
            strokeDasharray="6 3"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <circle r="14" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
          <motion.circle
            r="8"
            fill={matchState === 'calculated' ? '#10B981' : '#8B5CF6'}
            animate={{ scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* LEFT PANEL: CANDIDATE PROFILE */}
        <g transform="translate(15, 15)">
          {/* Panel Base */}
          <rect x="0" y="0" width="135" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">TALENT PROFILE</text>
          <line x1="15" y1="28" x2="120" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Profile Card Mockup */}
          <g transform="translate(15, 38)">
            {/* Header placeholder */}
            <rect width="105" height="40" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <circle cx="20" cy="20" r="11" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1" />
            {/* Small avatar shape */}
            <path d="M14,26 C14,22 26,22 26,26" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="20" cy="18" r="3" fill="#8B5CF6" />
            <text x="38" y="18" fill="#EEEAF8" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">Alex Mercer</text>
            <text x="38" y="27" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">ML ENGINEER</text>
          </g>

          {/* Candidate Core Skill Badges */}
          <g transform="translate(15, 90)">
            <text x="0" y="10" fill="#9D99B8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">EXTRACTED SKILLS:</text>
            
            {/* Skill 1 */}
            <g transform="translate(0, 18)">
              <rect width="48" height="13" rx="3.5" fill="#0F0F1C" stroke="#22D3EE" strokeWidth="1" />
              <text x="24" y="9.5" textAnchor="middle" fill="#22D3EE" fontSize="6" fontFamily="monospace" fontWeight="bold">PYTHON</text>
            </g>

            {/* Skill 2 */}
            <g transform="translate(54, 18)">
              <rect width="51" height="13" rx="3.5" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1" />
              <text x="25.5" y="9.5" textAnchor="middle" fill="#8B5CF6" fontSize="6" fontFamily="monospace" fontWeight="bold">PYTORCH</text>
            </g>

            {/* Skill 3 */}
            <g transform="translate(0, 36)">
              <rect width="48" height="13" rx="3.5" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1" />
              <text x="24" y="9.5" textAnchor="middle" fill="#8B5CF6" fontSize="6" fontFamily="monospace" fontWeight="bold">TENSORFLOW</text>
            </g>

            {/* Skill 4 */}
            <g transform="translate(54, 36)">
              <rect width="51" height="13" rx="3.5" fill="#0F0F1C" stroke="#10B981" strokeWidth="1" />
              <text x="25.5" y="9.5" textAnchor="middle" fill="#10B981" fontSize="6" fontFamily="monospace" fontWeight="bold">DOCKER</text>
            </g>
          </g>

          <line x1="15" y1="165" x2="120" y2="165" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* User profile scan bar */}
          {matchState === 'scanning' && (
            <motion.rect
              x="10"
              y="34"
              width="115"
              height="125"
              rx="4"
              fill="none"
              stroke="rgba(34, 211, 238, 0.15)"
              strokeWidth="2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Status badge */}
          <g transform="translate(15, 178)">
            <circle cx="5" cy="12" r="3.5" fill="#10B981" />
            <text x="16" y="15" fill="#EEEAF8" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">PROFILE READY</text>
            <text x="16" y="24" fill="#9D99B8" fontSize="6" fontFamily="monospace">ROLES MAPPED: 14</text>
          </g>
        </g>

        {/* RIGHT PANEL: JOB MATCH DISCOVERY */}
        <g transform="translate(270, 15)">
          {/* Panel Base */}
          <rect x="0" y="0" width="135" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">MATCH INDEX</text>
          <line x1="15" y1="28" x2="120" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Circular progress fit meter */}
          <g transform="translate(67.5, 75)">
            <circle cx="0" cy="0" r="32" stroke="rgba(255,255,255,0.03)" strokeWidth="3.5" />
            <motion.circle
              cx="0"
              cy="0"
              r="32"
              stroke="url(#radialMatchGrad)"
              strokeWidth="4"
              strokeDasharray="201"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transformOrigin: '0px 0px', transform: 'rotate(-90deg)' }}
            />
            {/* Dynamic matching percentage */}
            <motion.text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#EEEAF8"
              fontSize="12.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {score}%
            </motion.text>
            <text x="0" y="15" textAnchor="middle" fill="#9D99B8" fontSize="4.5" fontFamily="sans-serif" letterSpacing="0.5">FIT SCORE</text>
          </g>

          <line x1="15" y1="130" x2="120" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Match constraints */}
          <g transform="translate(15, 140)">
            {/* Constraint 1: Experience */}
            <g transform="translate(0, 0)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">EXPERIENCE</text>
              <rect x="54" y="2" width="50" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
              <motion.rect
                x="54"
                y="2"
                width={matchState === 'calculated' ? 45 : 0}
                height="6"
                rx="3"
                fill="#10B981"
                transition={{ duration: 1 }}
              />
              <text x="109" y="8" textAnchor="end" fill="#EEEAF8" fontSize="6" fontFamily="monospace">90%</text>
            </g>

            {/* Constraint 2: Skills */}
            <g transform="translate(0, 18)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">SKILLS FIT</text>
              <rect x="54" y="2" width="50" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
              <motion.rect
                x="54"
                y="2"
                width={matchState === 'calculated' ? 48 : 0}
                height="6"
                rx="3"
                fill="#10B981"
                transition={{ duration: 1, delay: 0.2 }}
              />
              <text x="109" y="8" textAnchor="end" fill="#EEEAF8" fontSize="6" fontFamily="monospace">96%</text>
            </g>

            {/* Constraint 3: Location */}
            <g transform="translate(0, 36)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">LOCATION</text>
              <rect x="54" y="2" width="50" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
              <motion.rect
                x="54"
                y="2"
                width={matchState === 'calculated' ? 50 : 0}
                height="6"
                rx="3"
                fill="#10B981"
                transition={{ duration: 1, delay: 0.4 }}
              />
              <text x="109" y="8" textAnchor="end" fill="#EEEAF8" fontSize="6" fontFamily="monospace">100%</text>
            </g>
          </g>

          {/* Secure Verified Sync State */}
          <g transform="translate(15, 202)">
            <rect width="105" height="15" rx="3" fill="rgba(16,185,129,0.05)" stroke="#10B981" strokeWidth="0.5" />
            <text x="52.5" y="10" textAnchor="middle" fill="#10B981" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">
              {matchState === 'calculated' ? '✓ MATCH COMPLETED' : 'CALCULATING...'}
            </text>
          </g>
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="matchAggGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="radialMatchGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
