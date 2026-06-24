import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import Logo from '@/components/common/Logo';
import AuthCard from './AuthCard';
import LoginForm from './LoginForm';
import LoginLeftPanelAnimation from '@/components/common/animations/LoginLeftPanelAnimation';

// Particle animation helper
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



export default function LoginPage() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen w-full bg-[#060608] flex flex-col md:flex-row relative overflow-hidden font-sans select-none text-foreground"
      >
        {/* Violet Orb Glow - top-right background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none z-0" />
        
        {/* Background slow drifting particles */}
        <FloatingParticles count={20} />

        {/* Left Section (Brand Experience / Illustration) */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="hidden md:flex md:w-[45%] bg-[#060608] border-r border-white/5 flex-col justify-between p-12 lg:p-16 relative overflow-hidden z-10"
        >
          {/* Subtle glow behind networks */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Logo / Header */}
          <div className="flex items-center gap-3">
            <Logo className="size-9" />
            <span className="font-heading text-sm font-bold tracking-widest text-[#A78BFA]">
              CareerAi
            </span>
          </div>

          {/* Core Network Constellation Illustration */}
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <LoginLeftPanelAnimation />
          </div>

          {/* Bottom brand tagline */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-mono tracking-widest text-[#5C5A78] uppercase">
              AI Career Intelligence
            </span>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold leading-tight tracking-tight bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] bg-clip-text text-transparent">
              Discover your path.<br />Build your future with AI.
            </h1>
            <p className="text-xs text-[#9D99B8] max-w-sm leading-relaxed">
              Your AI-powered career command center is waiting. Analyze skill gaps, get expert advising, and match with global positions in real-time.
            </p>
          </div>
        </motion.div>

        {/* Right Section (Form card wrapper) */}
        <div className="flex-1 flex items-center justify-center p-5 md:p-12 lg:p-16 z-10">
          <AuthCard>
            <LoginForm />



            {/* Create account section footer */}
            <div className="text-center text-xs text-[#9D99B8] mt-2 select-none">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#A78BFA] hover:text-[#C4B5FD] transition-colors font-semibold hover:underline cursor-pointer"
              >
                Create account
              </Link>
            </div>
          </AuthCard>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
