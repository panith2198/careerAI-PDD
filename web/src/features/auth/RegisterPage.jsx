import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import Logo from '@/components/common/Logo';
import RegisterForm from './RegisterForm';
import RegisterLeftPanelAnimation from '@/components/common/animations/RegisterLeftPanelAnimation';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon } from '@hugeicons/core-free-icons';

// Drifting background particles (Cyan and Violet)
const FloatingParticles = ({ count = 20 }) => {
  const particles = Array.from({ length: count });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => {
        const size = Math.random() * 4 + 2;
        const color = Math.random() > 0.5 ? '#8B5CF6' : '#22D3EE';
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [0, -120],
              x: [0, (Math.random() - 0.5) * 60],
              opacity: [0, Math.random() * 0.4 + 0.2, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

export default function RegisterPage() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        className="h-screen w-full bg-[#060608] flex flex-col md:flex-row relative overflow-hidden font-sans select-none text-foreground"
      >
        {/* Violet Orb Glow - top-right backdrop blur */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* Slow drifting particles background */}
        <FloatingParticles count={25} />

        {/* Left Side: Brand Panel */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
          className="hidden md:flex md:w-[45%] h-full bg-[#060608] border-r border-white/5 flex-col justify-between p-8 lg:p-12 relative overflow-hidden z-10"
        >
          {/* Central grid background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Logo / Navigator Header */}
          <div className="flex items-center gap-3">
            <Logo className="size-9" />
            <span className="font-heading text-sm font-bold tracking-widest text-[#A78BFA]">
              CareerAi
            </span>
          </div>

          {/* Connected orbiting visual illustration */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 max-h-[300px]">
            <RegisterLeftPanelAnimation />
          </div>

          {/* Brand copy copydeck */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono tracking-widest text-[#5C5A78] uppercase">
              AI Career Intelligence
            </span>
            <h1 
              className="font-heading text-3xl lg:text-4xl font-bold leading-[1.15] tracking-tight bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] bg-clip-text text-transparent"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Build your future<br />with AI intelligence
            </h1>
            <p className="text-xs text-[#9D99B8] max-w-sm leading-relaxed">
              Create your profile and let AI discover the right career path for you. Analyze skill gaps, unlock specialized advisor chats, and accelerate onboarding.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Registration Card Centerer */}
        <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-8 lg:p-12 z-10 h-full overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            className="w-full max-w-[460px] bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)] flex flex-col gap-5 my-auto"
          >
            {/* Header Section */}
            <div className="flex flex-col items-center text-center">
              {/* Animated User Add Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="size-10 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-3"
              >
                <HugeiconsIcon icon={UserAdd01Icon} className="size-5 text-white" strokeWidth={2} />
              </motion.div>

              {/* Title */}
              <h2 className="font-heading text-xl lg:text-2xl font-bold tracking-tight text-[#EEEAF8] mb-1">
                Create your account
              </h2>

              {/* Subtitle */}
              <p className="text-[11px] lg:text-xs text-[#9D99B8] px-2 leading-relaxed">
                Start your AI-powered career journey
              </p>
            </div>

            {/* Render dynamic registration step form */}
            <RegisterForm />

            {/* Back to sign in footer */}
            <div className="text-center text-xs text-[#9D99B8] select-none mt-1">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#A78BFA] hover:text-[#C4B5FD] transition-colors font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
