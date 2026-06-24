import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon } from '@hugeicons/core-free-icons';

export default function QuizTimer({ durationSeconds, onTimeout, isPaused }) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Synchronize timer if duration changes from load values
  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeoutRef.current) {
            onTimeoutRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCritical = timeLeft < 20;
  const isWarning = timeLeft >= 20 && timeLeft < 60;

  let timerColor = 'text-emerald-400';
  let glowColor = 'shadow-[0_0_15px_rgba(16,185,129,0.12)]';
  let borderColor = 'border-emerald-500/20';

  if (isCritical) {
    timerColor = 'text-rose-400';
    glowColor = 'shadow-[0_0_20px_rgba(244,63,94,0.25)]';
    borderColor = 'border-rose-500/30';
  } else if (isWarning) {
    timerColor = 'text-amber-400';
    glowColor = 'shadow-[0_0_15px_rgba(245,158,11,0.18)]';
    borderColor = 'border-amber-500/20';
  }

  const pulseVariants = {
    pulse: {
      scale: [1, 1.08, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    normal: {
      scale: 1,
    },
  };

  return (
    <motion.div
      variants={pulseVariants}
      animate={isCritical ? 'pulse' : 'normal'}
      className={`px-4 py-2 bg-white/[0.02] border ${borderColor} rounded-xl flex items-center gap-2.5 font-mono select-none ${glowColor} backdrop-blur-md`}
    >
      <HugeiconsIcon icon={Clock01Icon} className={`size-4 ${timerColor}`} />
      <span className={`text-sm font-bold tracking-wider ${timerColor}`}>
        {formatTime(timeLeft)}
      </span>
    </motion.div>
  );
}
