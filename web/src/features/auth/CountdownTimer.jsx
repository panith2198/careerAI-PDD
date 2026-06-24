import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function CountdownTimer({ onResend, isResending }) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResendClick = async () => {
    if (timeLeft > 0 || isResending) return;
    try {
      await onResend();
      setTimeLeft(60); // Reset timer to 60 seconds on successful dispatch
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="w-full flex items-center justify-center min-h-12 mt-2">
      {timeLeft > 0 ? (
        <span 
          className="text-xs font-mono text-[#9D99B8] select-none"
          style={{ textShadow: '0 0 10px rgba(157, 153, 184, 0.15)' }}
        >
          Resend code available in{' '}
          <span className="text-[#A78BFA] font-bold">{formatTime(timeLeft)}</span>
        </span>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Button
            type="button"
            disabled={isResending}
            onClick={handleResendClick}
            className="px-5 py-2.5 bg-white/5 border border-violet-400/30 text-xs font-semibold rounded-xl text-[#EEEAF8] hover:bg-violet-500/10 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {isResending ? 'Resending OTP...' : 'Resend OTP'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
