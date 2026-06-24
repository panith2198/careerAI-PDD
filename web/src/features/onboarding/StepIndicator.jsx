import React from 'react';
import { motion } from 'framer-motion';

export default function StepIndicator({ currentStep, totalSteps = 4 }) {
  const stepsData = [
    { id: 1, label: 'WELCOME' },
    { id: 2, label: 'EXPERIENCE' },
    { id: 3, label: 'GOALS' },
    { id: 4, label: 'SETUP' },
  ];

  // Width is 400, Height is 60. Margin left/right = 30
  const xStart = 30;
  const xEnd = 370;
  const yCenter = 24;
  const totalWidth = xEnd - xStart;
  const stepGap = totalWidth / (totalSteps - 1);

  // Position of active step
  const activeX = xStart + (currentStep - 1) * stepGap;

  return (
    <div className="w-full max-w-md mx-auto mb-6 relative select-none">
      <svg
        viewBox="0 0 400 60"
        width="100%"
        height="60"
        className="overflow-visible"
      >
        <defs>
          {/* Violet Glow Filter */}
          <filter id="glow-violet" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cyan Glow Filter */}
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Progress Path Gradient */}
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Background Track Path */}
        <line
          x1={xStart}
          y1={yCenter}
          x2={xEnd}
          y2={yCenter}
          stroke="#5C5A78"
          strokeWidth="2"
          strokeOpacity="0.15"
          strokeLinecap="round"
        />

        {/* Active Connector Progress Path */}
        <motion.path
          d={`M ${xStart} ${yCenter} L ${xEnd} ${yCenter}`}
          stroke="url(#progress-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: (currentStep - 1) / (totalSteps - 1) }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Floating Quantum Particle Indicator */}
        <motion.circle
          cx={activeX}
          cy={yCenter}
          r={3.5}
          fill="#22D3EE"
          filter="url(#glow-cyan)"
          animate={{ cx: activeX }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Stepper Nodes */}
        {stepsData.map((step, idx) => {
          const stepNum = idx + 1;
          const cx = xStart + idx * stepGap;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <g key={step.id}>
              {/* Active step rotating outer tech ring */}
              {isActive && (
                <motion.circle
                  cx={cx}
                  cy={yCenter}
                  r={15}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2.5"
                  style={{ originX: cx, originY: yCenter }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
                />
              )}

              {/* Outer stroke indicator circle */}
              {!isActive && isCompleted && (
                <circle
                  cx={cx}
                  cy={yCenter}
                  r={12}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                />
              )}

              {!isActive && !isCompleted && (
                <circle
                  cx={cx}
                  cy={yCenter}
                  r={12}
                  fill="none"
                  stroke="#5C5A78"
                  strokeWidth={1.5}
                  strokeOpacity={0.2}
                />
              )}

              {/* Main inner node circle */}
              {isActive && (
                <motion.circle
                  cx={cx}
                  cy={yCenter}
                  r={11}
                  fill="#8B5CF6"
                  fillOpacity={0.12}
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  filter="url(#glow-violet)"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              )}

              {isCompleted && (
                <circle
                  cx={cx}
                  cy={yCenter}
                  r={11}
                  fill="#22D3EE"
                  fillOpacity={0.08}
                  stroke="#22D3EE"
                  strokeWidth={2}
                  filter="url(#glow-cyan)"
                />
              )}

              {!isActive && !isCompleted && (
                <circle
                  cx={cx}
                  cy={yCenter}
                  r={11}
                  fill="#060608"
                  stroke="#5C5A78"
                  strokeWidth={1.5}
                  strokeOpacity={0.5}
                />
              )}

              {/* Text/Symbol inside the circle */}
              {isCompleted ? (
                <text
                  x={cx}
                  y={yCenter + 3.5}
                  textAnchor="middle"
                  fill="#22D3EE"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  ✓
                </text>
              ) : (
                <text
                  x={cx}
                  y={yCenter + 3}
                  textAnchor="middle"
                  fill={isActive ? '#EEEAF8' : '#5C5A78'}
                  fontSize="8.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {`0${stepNum}`}
                </text>
              )}

              {/* Step Sub-label Text */}
              <text
                x={cx}
                y={yCenter + 24}
                textAnchor="middle"
                fill={isActive ? '#EEEAF8' : isCompleted ? '#22D3EE' : '#5C5A78'}
                fillOpacity={isActive ? 1 : isCompleted ? 0.75 : 0.4}
                fontSize="8"
                fontWeight="700"
                letterSpacing="0.08em"
                fontFamily="Space Grotesk, system-ui, sans-serif"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {step.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
