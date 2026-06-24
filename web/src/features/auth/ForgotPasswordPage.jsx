import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  SecurityIcon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';

import Logo from '@/components/common/Logo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import useAuthStore from '@/stores/authStore';
import api from '@/api/api';

import OtpInput from './OtpInput';
import CountdownTimer from './CountdownTimer';

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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI helpers
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errors, setErrors] = useState({});

  // Mutations
  const forgotPasswordMutation = useMutation({
    mutationFn: async (targetEmail) => {
      const response = await api.post('/auth/forgot-password', { email: targetEmail });
      return response;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Verification OTP code sent to your email.');
      setStep('otp');
    },
    onError: (error) => {
      const errMsg = error.message || 'Forgot password request failed';
      toast.error(errMsg);
      setHasError(true);
      setTimeout(() => setHasError(false), 800);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ targetEmail, code, password }) => {
      const response = await api.post('/auth/reset-password', {
        email: targetEmail,
        code,
        new_password: password
      });
      return response;
    },
    onSuccess: (data) => {
      toast.success('Your password has been successfully reset.');
      
      const user = {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        role: 'student'
      };
      const token = data.access_token || data.token;
      
      login(user, token);
      navigate('/dashboard');
    },
    onError: (error) => {
      const errMsg = error.message || 'Password reset failed';
      toast.error(errMsg);
      setHasError(true);
      setTimeout(() => setHasError(false), 800);
    }
  });

  // Action handlers
  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const parsedEmail = z.string().email('Please enter a valid email address').parse(email);
      forgotPasswordMutation.mutate(parsedEmail);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ email: err.errors[0].message });
        setHasError(true);
        setTimeout(() => setHasError(false), 800);
      }
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code.');
      setHasError(true);
      setTimeout(() => setHasError(false), 800);
      return;
    }
    setStep('password');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const passwordSchema = z.object({
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        confirmPassword: z.string()
      }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
      });

      const parsed = passwordSchema.parse({
        password: newPassword,
        confirmPassword
      });

      resetPasswordMutation.mutate({
        targetEmail: email,
        code: otp,
        password: parsed.password
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((zodErr) => {
          if (zodErr.path.length > 0) {
            fieldErrors[zodErr.path[0]] = zodErr.message;
          }
        });
        setErrors(fieldErrors);
        setHasError(true);
        setTimeout(() => setHasError(false), 800);
      }
    }
  };

  const handleResendOtp = async () => {
    await forgotPasswordMutation.mutateAsync(email);
  };

  // Framer Motion Animation Variants
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

  return (
    <div className="min-h-screen w-full bg-[#060608] flex items-center justify-center relative overflow-hidden font-sans select-none text-foreground">
      {/* Grid background overlay */}
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

      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#8B5CF6]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Floating particles background */}
      <FloatingParticles count={15} />

      <div className="z-10 p-5 w-full max-w-[420px]">
        {/* Logo at the top of the card */}
        <div className="flex items-center gap-3 justify-center mb-6 select-none">
          <Logo className="size-8" />
          <span 
            className="font-heading text-xs font-extrabold tracking-widest text-[#A78BFA]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            CareerAi
          </span>
        </div>

        <motion.div
          animate={hasError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(139,92,246,0.15)] flex flex-col gap-6"
        >
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email-slide"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-4">
                    <HugeiconsIcon icon={LockIcon} className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <h2 
                    className="text-2xl font-bold text-[#EEEAF8] tracking-tight mb-1"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Forgot Password?
                  </h2>
                  <p className="text-xs text-[#9D99B8] px-2 leading-relaxed">
                    Enter your email address and we'll dispatch a 6-digit OTP code to verify your identity.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="email" className="text-[#EEEAF8] text-xs font-semibold">
                      Email Address
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
                        <HugeiconsIcon icon={Mail01Icon} className="size-5" />
                      </span>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={forgotPasswordMutation.isPending}
                        className={`w-full h-11 pl-12 pr-4 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
                          errors.email
                            ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                            : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-[#F43F5E] font-medium mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="w-full h-11 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(109,40,217,0.3)] border-0 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {forgotPasswordMutation.isPending ? (
                      <>
                        <Spinner className="size-4 text-white animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Code</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-xs text-[#9D99B8] mt-2">
                  <Link
                    to="/login"
                    className="text-[#A78BFA] hover:text-[#C4B5FD] transition-colors font-semibold hover:underline flex items-center justify-center gap-1.5"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2.5} />
                    <span>Back to login</span>
                  </Link>
                </div>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp-slide"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-[#0284C7] to-[#22D3EE] flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] mb-4">
                    <HugeiconsIcon icon={SecurityIcon} className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <h2 
                    className="text-2xl font-bold text-[#EEEAF8] tracking-tight mb-1"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Verify Identity
                  </h2>
                  <p className="text-xs text-[#9D99B8] px-2 leading-relaxed">
                    Please key in the 6-digit reset code dispatched to <span className="text-[#EEEAF8] font-bold">{email}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 mt-2">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    hasError={hasError}
                  />

                  <CountdownTimer
                    onResend={handleResendOtp}
                    isResending={forgotPasswordMutation.isPending}
                  />

                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={() => setStep('email')}
                      className="flex-1 h-11 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#EEEAF8] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
                      <span>Back</span>
                    </Button>

                    <Button
                      type="submit"
                      disabled={otp.length !== 6}
                      className="flex-1 h-11 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(109,40,217,0.3)] border-0 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div
                key="password-slide"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-[#A78BFA] flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-4">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6 text-white" strokeWidth={2} />
                  </div>
                  <h2 
                    className="text-2xl font-bold text-[#EEEAF8] tracking-tight mb-1"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Choose New Password
                  </h2>
                  <p className="text-xs text-[#9D99B8] px-2 leading-relaxed">
                    Set a secure, strong password to regain access to your career dashboard.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="flex flex-col gap-4 mt-2">
                  {/* New Password input */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="newPassword" className="text-[#EEEAF8] text-xs font-semibold">
                      New Password
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
                        <HugeiconsIcon icon={LockIcon} className="size-5" />
                      </span>
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={resetPasswordMutation.isPending}
                        className={`w-full h-11 pl-12 pr-12 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
                          errors.password
                            ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                            : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C5A78] hover:text-[#EEEAF8] transition-colors cursor-pointer select-none bg-transparent border-0 outline-none"
                      >
                        <HugeiconsIcon icon={showNewPassword ? EyeOffIcon : EyeIcon} className="size-5" />
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-[#F43F5E] font-medium mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password input */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="confirmPassword" className="text-[#EEEAF8] text-xs font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
                        <HugeiconsIcon icon={LockIcon} className="size-5" />
                      </span>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={resetPasswordMutation.isPending}
                        className={`w-full h-11 pl-12 pr-12 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
                          errors.confirmPassword
                            ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                            : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C5A78] hover:text-[#EEEAF8] transition-colors cursor-pointer select-none bg-transparent border-0 outline-none"
                      >
                        <HugeiconsIcon icon={showConfirmPassword ? EyeOffIcon : EyeIcon} className="size-5" />
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-[#F43F5E] font-medium mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      onClick={() => setStep('otp')}
                      disabled={resetPasswordMutation.isPending}
                      className="flex-1 h-11 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#EEEAF8] text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
                      <span>Back</span>
                    </Button>

                    <Button
                      type="submit"
                      disabled={resetPasswordMutation.isPending}
                      className="flex-1 h-11 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 transition-all shadow-[0_4px_20px_rgba(109,40,217,0.3)] border-0 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {resetPasswordMutation.isPending ? (
                        <>
                          <Spinner className="size-4 text-white animate-spin" />
                          <span>Resetting...</span>
                        </>
                      ) : (
                        <span>Reset Password</span>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
