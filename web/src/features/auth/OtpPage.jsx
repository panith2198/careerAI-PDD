import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { HugeiconsIcon } from '@hugeicons/react';
import { SecurityIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

import useAuthStore from '@/stores/authStore';
import api from '@/api/api';
import { verifyOtpApi, resendOtpApi } from './otp.api';

import OtpInput from './OtpInput';
import CountdownTimer from './CountdownTimer';
import VerifyButton from './VerifyButton';

// Drifting cyan/violet background particles
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
              opacity: Math.random() * 0.25 + 0.05,
            }}
            animate={{
              y: [0, -120],
              x: [0, (Math.random() - 0.5) * 60],
              opacity: [0, Math.random() * 0.3 + 0.1, 0],
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

export default function OtpPage() {
  const navigate = useNavigate();
  const { login, setToken } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const email = localStorage.getItem('temp_register_email') || '';

  // API verification mutation
  const verifyMutation = useMutation({
    mutationFn: async (code) => {
      return await verifyOtpApi(email, code);
    },
    onSuccess: async (data) => {
      setIsSuccess(true);
      const activeToken = data.token || data.access_token;
      
      // Update store states
      setToken(activeToken);
      const user = {
        id: data.user_id || 1,
        name: data.name || email.split('@')[0],
        email: data.email || email,
        role: 'student',
      };

      // Perform background profile database synchronization if temporary profile is found
      const tempProfile = localStorage.getItem('temp_profile');
      if (tempProfile) {
        try {
          const profile = JSON.parse(tempProfile);
          await api.put('/users/me', {
            bio: profile.bio,
            preferred_work_mode: 'remote',
            education_level: 'btech',
            field_of_study: profile.careerInterest,
          });
        } catch (err) {
          console.error('Failed to sync profile properties to backend db:', err);
        }
        localStorage.removeItem('temp_profile');
      }

      login(user, activeToken);
      localStorage.removeItem('temp_register_email');

      // Hold briefly to showcase the visual success animation
      setTimeout(() => {
        toast.success(`Welcome back, ${user.name}! Let's personalize your CareerAi experience.`);
        navigate('/onboarding');
      }, 1600);
    },
    onError: (error) => {
      setHasError(true);
      toast.error(error.message || 'Invalid verification code');
      
      // Clear error flag after keyframes shake plays out
      setTimeout(() => {
        setHasError(false);
      }, 800);
    },
  });

  // API resend mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      return await resendOtpApi(email);
    },
    onSuccess: () => {
      toast.success('A new 6-digit OTP verification code has been sent to your email.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to dispatch code. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code.');
      return;
    }
    verifyMutation.mutate(otp);
  };

  // Stagger layout animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45 }}
        className="h-screen w-full bg-[#060608] flex items-center justify-center relative overflow-hidden font-sans select-none text-foreground"
      >
        {/* Subtle AI Grid Overlay (linear gradient structure at 5% opacity) */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Violet background glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#8B5CF6]/10 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Drifting background particles */}
        <FloatingParticles count={15} />

        <div className="z-10 p-5 w-full max-w-[420px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-[0_0_60px_rgba(139,92,246,0.15)] flex flex-col gap-6"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="otp-form"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col gap-6"
                >
                  {/* Header Section */}
                  <div className="flex flex-col items-center text-center">
                    {/* Animated Circular Glass Icon Container */}
                    <motion.div
                      variants={itemVariants}
                      className="size-12 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.2)] mb-4"
                    >
                      <HugeiconsIcon icon={SecurityIcon} className="size-6 text-[#A78BFA]" strokeWidth={2} />
                    </motion.div>

                    {/* Title */}
                    <motion.h2 
                      variants={itemVariants}
                      className="font-heading font-bold tracking-tight text-[#EEEAF8] mb-1.5"
                      style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', lineHeight: '40px' }}
                    >
                      Verify your account
                    </motion.h2>

                    {/* Description */}
                    <motion.p 
                      variants={itemVariants}
                      className="text-xs text-[#9D99B8] px-4 leading-relaxed"
                    >
                      Enter the 6-digit verification code sent to your email.
                    </motion.p>
                  </div>

                  {/* Controlled Input fields */}
                  <motion.form 
                    variants={itemVariants}
                    onSubmit={handleSubmit} 
                    className="flex flex-col gap-6"
                  >
                    <motion.div
                      animate={hasError ? { x: [0, -12, 12, -12, 12, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      className="w-full flex justify-center py-2"
                    >
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        hasError={hasError}
                      />
                    </motion.div>

                    {/* Resend countdown timer */}
                    <CountdownTimer
                      onResend={() => resendMutation.mutateAsync()}
                      isResending={resendMutation.isPending}
                    />

                    {/* Primary Submit Button */}
                    <VerifyButton
                      isPending={verifyMutation.isPending}
                      disabled={otp.length !== 6}
                    />
                  </motion.form>

                  {/* Back Navigation Link */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center text-xs mt-1"
                  >
                    <Link
                      to="/register"
                      className="text-[#5C5A78] hover:text-[#9D99B8] transition-colors flex items-center gap-1 hover:underline cursor-pointer select-none"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2.5} />
                      <span>Back to signup</span>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                /* Glowing Success check overlay */
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.12, 1],
                      boxShadow: [
                        '0 0 20px rgba(34, 211, 238, 0.4)',
                        '0 0 40px rgba(139, 92, 246, 0.5)',
                        '0 0 20px rgba(34, 211, 238, 0.4)',
                      ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="size-16 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center mb-6"
                  >
                    <svg
                      className="size-8 text-white stroke-[3]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                  <h3 
                    className="text-xl font-bold text-[#EEEAF8] mb-2 font-heading"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Verification Successful
                  </h3>
                  <p className="text-xs text-[#9D99B8]">
                    Securing your AI profile and redirecting...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
