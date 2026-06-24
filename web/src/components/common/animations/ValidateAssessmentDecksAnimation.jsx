import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ValidateAssessmentDecksAnimation() {
  const [deckPhase, setDeckPhase] = useState('idle'); // idle, answering, sliding, validating, scored
  const [activeCardSelected, setActiveCardSelected] = useState(false);

  useEffect(() => {
    const runCycle = () => {
      setDeckPhase('idle');
      setActiveCardSelected(false);

      // 1. User checks option
      const t1 = setTimeout(() => {
        setDeckPhase('answering');
        setActiveCardSelected(true);
      }, 1200);

      // 2. Card slides right
      const t2 = setTimeout(() => {
        setDeckPhase('sliding');
      }, 2500);

      // 3. Validator scans card
      const t3 = setTimeout(() => {
        setDeckPhase('validating');
      }, 3500);

      // 4. Score is verified
      const t4 = setTimeout(() => {
        setDeckPhase('scored');
      }, 4800);

      return [t1, t2, t3, t4];
    };

    let timeouts = runCycle();
    const interval = setInterval(() => {
      timeouts.forEach(clearTimeout);
      timeouts = runCycle();
    }, 8500);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[420px] mx-auto aspect-[16/10] flex items-center justify-center p-4 bg-surface-2 border border-border rounded-xl shadow-2xl overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 bg-primary/5 rounded blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-cyan-brand/10 rounded blur-2xl opacity-20 pointer-events-none" />

      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 420 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Validator Scanning Gateway in the middle bridge */}
        <g>
          {/* Base path for sliding card */}
          <path d="M135,115 H285" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="3 3" />
          
          {/* Scanning Gateway Frame */}
          <rect x="180" y="35" width="20" height="180" rx="4" fill="#0F0F1C" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          
          {/* Gateway security pulse */}
          <motion.rect
            x="180"
            y="35"
            width="20"
            height="180"
            rx="4"
            fill="none"
            stroke={deckPhase === 'validating' ? '#10B981' : '#8B5CF6'}
            strokeWidth="1.5"
            animate={deckPhase === 'validating' ? { strokeOpacity: [0.3, 1, 0.3] } : { strokeOpacity: 0.15 }}
            transition={{ repeat: Infinity, duration: 1 }}
          />

          {/* Scanner Laser Beam Line */}
          {deckPhase === 'validating' && (
            <motion.line
              x1="181"
              y1="38"
              x2="199"
              y2="38"
              stroke="#10B981"
              strokeWidth="2.5"
              animate={{ y1: [38, 212, 38], y2: [38, 212, 38] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </g>

        {/* LEFT PANEL: ASSESSMENT DECK (STACKED CARDS) */}
        <g transform="translate(15, 15)">
          {/* Panel boundary */}
          <rect x="0" y="0" width="150" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">ASSESSMENT DECK</text>
          <line x1="15" y1="28" x2="135" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* CARD STACK BACKGROUNDS (Isometric Offset Effect) */}
          {/* Back Card */}
          {deckPhase !== 'sliding' && deckPhase !== 'validating' && (
            <rect x="35" y="45" width="90" height="135" rx="6" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1.5" />
          )}
          
          {/* Middle Card */}
          {deckPhase !== 'sliding' && deckPhase !== 'validating' && (
            <rect x="25" y="55" width="90" height="135" rx="6" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1.5" />
          )}

          {/* FRONT ACTIVE CARD (Slides right dynamically) */}
          <g>
            <motion.g
              animate={
                deckPhase === 'sliding'
                  ? { x: 175, opacity: [1, 1, 0] }
                  : deckPhase === 'validating'
                  ? { x: 175, opacity: 0 }
                  : { x: 0, opacity: 1 }
              }
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              {/* Active Card Body */}
              <rect x="15" y="65" width="90" height="135" rx="6" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1.5" />
              
              {/* Card content */}
              <text x="25" y="80" fill="#8B5CF6" fontSize="6.5" fontFamily="monospace" fontWeight="bold">DECK Q_04</text>
              <line x1="25" y1="86" x2="95" y2="86" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {/* Code mock query */}
              <rect x="25" y="94" width="70" height="24" rx="3" fill="rgba(255,255,255,0.02)" />
              <text x="30" y="103" fill="#9D99B8" fontSize="5" fontFamily="monospace">class NetworkModule &#123;</text>
              <text x="30" y="112" fill="#22D3EE" fontSize="5" fontFamily="monospace">  @Provides @Singleton</text>

              {/* Checklist Option 1 */}
              <g transform="translate(25, 126)">
                <circle cx="4" cy="4" r="3.5" fill="#0F0F1C" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x="12" y="7" fill="#9D99B8" fontSize="5.5" fontFamily="sans-serif">Retrofit Provider</text>
              </g>

              {/* Checklist Option 2 (Checked dynamically) */}
              <g transform="translate(25, 142)">
                <circle
                  cx="4"
                  cy="4"
                  r="3.5"
                  fill="#0F0F1C"
                  stroke={activeCardSelected ? '#10B981' : 'rgba(255,255,255,0.15)'}
                  strokeWidth="1"
                />
                {activeCardSelected && (
                  <circle cx="4" cy="4" r="2" fill="#10B981" />
                )}
                <text x="12" y="7" fill={activeCardSelected ? '#EEEAF8' : '#9D99B8'} fontSize="5.5" fontFamily="sans-serif" fontWeight={activeCardSelected ? 'bold' : 'normal'}>Hilt Dependency</text>
              </g>

              {/* Checklist Option 3 */}
              <g transform="translate(25, 158)">
                <circle cx="4" cy="4" r="3.5" fill="#0F0F1C" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <text x="12" y="7" fill="#9D99B8" fontSize="5.5" fontFamily="sans-serif">Context Mapper</text>
              </g>

              {/* Active timer slot */}
              <g transform="translate(25, 178)">
                <rect width="70" height="12" rx="3" fill="rgba(139,92,246,0.06)" />
                <text x="35" y="9" textAnchor="middle" fill="#8B5CF6" fontSize="5.5" fontFamily="monospace">LIMIT: 02:40 SEC</text>
              </g>
            </motion.g>
          </g>

          {/* Lower session stats */}
          <g transform="translate(15, 212)">
            <text x="0" y="5" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">STATUS: ACTIVE TEST</text>
          </g>
        </g>

        {/* RIGHT PANEL: EVALUATION REPORT */}
        <g transform="translate(255, 15)">
          {/* Panel base */}
          <rect x="0" y="0" width="150" height="230" rx="8" fill="#0F0F1C" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
          
          {/* Header */}
          <text x="15" y="22" fill="#EEEAF8" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">SCORE SUMMARY</text>
          <line x1="15" y1="28" x2="135" y2="28" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Skills verification progress bars */}
          <g transform="translate(15, 42)">
            {/* Skill 1: KOTLIN */}
            <g transform="translate(0, 0)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">KOTLIN / HILT</text>
              <rect x="60" y="2" width="60" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
              <motion.rect
                x="60"
                y="2"
                width={deckPhase === 'scored' ? 56 : deckPhase === 'validating' ? 30 : 0}
                height="6"
                rx="3"
                fill="#10B981"
                transition={{ duration: 0.8 }}
              />
              <text x="54" y="8" textAnchor="end" fill="#EEEAF8" fontSize="6" fontFamily="monospace">
                {deckPhase === 'scored' ? '92%' : deckPhase === 'validating' ? '50%' : '0%'}
              </text>
            </g>

            {/* Skill 2: REACT */}
            <g transform="translate(0, 20)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">REACT ROUTER</text>
              <rect x="60" y="2" width="60" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
              <motion.rect
                x="60"
                y="2"
                width={deckPhase === 'scored' ? 51 : deckPhase === 'validating' ? 25 : 0}
                height="6"
                rx="3"
                fill="#8B5CF6"
                transition={{ duration: 0.8, delay: 0.15 }}
              />
              <text x="54" y="8" textAnchor="end" fill="#EEEAF8" fontSize="6" fontFamily="monospace">
                {deckPhase === 'scored' ? '85%' : deckPhase === 'validating' ? '40%' : '0%'}
              </text>
            </g>

            {/* Skill 3: PYTHON RAG */}
            <g transform="translate(0, 40)">
              <text x="0" y="8" fill="#9D99B8" fontSize="6.5" fontFamily="monospace">PYTHON / RAG</text>
              <rect x="60" y="2" width="60" height="6" rx="3" fill="rgba(255,255,255,0.03)" />
              <motion.rect
                x="60"
                y="2"
                width={deckPhase === 'scored' ? 58 : deckPhase === 'validating' ? 28 : 0}
                height="6"
                rx="3"
                fill="#22D3EE"
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              <text x="54" y="8" textAnchor="end" fill="#EEEAF8" fontSize="6" fontFamily="monospace">
                {deckPhase === 'scored' ? '96%' : deckPhase === 'validating' ? '45%' : '0%'}
              </text>
            </g>
          </g>

          <line x1="15" y1="114" x2="135" y2="114" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Validation Metrics checklist */}
          <g transform="translate(15, 126)">
            {/* Checklist 1: Verification status */}
            <g transform="translate(0, 0)">
              <circle cx="5" cy="5" r="4.5" fill="#0F0F1C" stroke={deckPhase === 'scored' ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              {deckPhase === 'scored' && <path d="M2.5,5 L4.5,7 L7.5,3.5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />}
              <text x="16" y="8" fill={deckPhase === 'scored' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">Decks Evaluated: 4/4</text>
            </g>

            {/* Checklist 2: Format Rules status */}
            <g transform="translate(0, 20)">
              <circle cx="5" cy="5" r="4.5" fill="#0F0F1C" stroke={deckPhase === 'scored' ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              {deckPhase === 'scored' && <path d="M2.5,5 L4.5,7 L7.5,3.5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />}
              <text x="16" y="8" fill={deckPhase === 'scored' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">Schema Compliance</text>
            </g>

            {/* Checklist 3: Performance state */}
            <g transform="translate(0, 40)">
              <circle cx="5" cy="5" r="4.5" fill="#0F0F1C" stroke={deckPhase === 'scored' ? '#10B981' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />
              {deckPhase === 'scored' && <path d="M2.5,5 L4.5,7 L7.5,3.5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />}
              <text x="16" y="8" fill={deckPhase === 'scored' ? '#EEEAF8' : 'rgba(255,255,255,0.3)'} fontSize="6.5" fontFamily="sans-serif">Time Gaps Validated</text>
            </g>
          </g>

          {/* Secure Nominal Verification Indicator */}
          <g transform="translate(15, 202)">
            <rect width="120" height="16" rx="3.5" fill="rgba(16, 185, 129, 0.05)" stroke="#10B981" strokeWidth="0.5" />
            <text x="60" y="11" textAnchor="middle" fill="#10B981" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">
              {deckPhase === 'scored' ? '✓ ASSESSMENT PASS' : deckPhase === 'validating' ? 'SCANNIG DECK...' : 'STANDBY'}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
