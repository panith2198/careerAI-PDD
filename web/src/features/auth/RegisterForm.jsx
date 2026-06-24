import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

import { registerSchema } from './register.schema';
import useAuthStore from '@/stores/authStore';
import api from '@/api/api';
import StepIndicator from './StepIndicator';
import CredentialStep from './CredentialStep';
import ProfileStep from './ProfileStep';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit',
    shouldUnregister: false,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      careerInterest: '',
      experienceLevel: 'Beginner',
      skills: [],
      bio: '',
    },
  });

  // POST /auth/register mutation to FastAPI backend
  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.name,
        role: 'student',
      });
      return { response, data };
    },
    onSuccess: ({ response, data }) => {
      // Temporarily store user profile details in localStorage to persist after OTP verification succeeds
      localStorage.setItem('temp_profile', JSON.stringify({
        careerInterest: data.careerInterest,
        experienceLevel: data.experienceLevel,
        skills: data.skills,
        bio: data.bio
      }));
      localStorage.setItem('temp_register_email', data.email);

      toast.success('Registration successful! Verification OTP sent to your email.');
      navigate('/register/otp');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });

  const onSubmit = async (data) => {
    if (step === 1) {
      // Validate step 1 fields
      const isStep1Valid = await trigger(['name', 'email', 'password', 'confirmPassword']);
      if (isStep1Valid) {
        setStep(2);
      }
    } else {
      // Submit registration data
      registerMutation.mutate(data);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleContinueClick = async (e) => {
    if (step === 1) {
      e.preventDefault();
      const isStep1Valid = await trigger(['name', 'email', 'password', 'confirmPassword']);
      if (isStep1Valid) {
        setStep(2);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Dynamic Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Inputs step views with exit animation */}
      <div className="relative overflow-hidden min-h-[290px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <CredentialStep
                register={register}
                errors={errors}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isPending={registerMutation.isPending}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProfileStep
                control={control}
                errors={errors}
                isPending={registerMutation.isPending}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form Navigation Buttons */}
      <div className="flex items-center gap-3 mt-2">
        {step === 2 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="flex-1"
          >
            <Button
              type="button"
              onClick={handleBack}
              disabled={registerMutation.isPending}
              className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#EEEAF8] transition-all text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2.5} />
              <span>Back</span>
            </Button>
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="flex-2 grow"
        >
          <Button
            type="submit"
            onClick={step === 1 ? handleContinueClick : undefined}
            disabled={registerMutation.isPending}
            className="w-full h-11 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 transition-all shadow-[0_4px_25px_rgba(109,40,217,0.3)] border-0 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {registerMutation.isPending ? (
              <>
                <Spinner className="size-5 text-white" />
                <span>Creating profile...</span>
              </>
            ) : step === 1 ? (
              <>
                <span>Continue</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
