import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Mail01Icon, 
  LockIcon, 
  ArrowRight01Icon, 
  EyeIcon, 
  EyeOffIcon 
} from '@hugeicons/core-free-icons';

import { loginSchema } from './auth.schema';
import useAuthStore from '@/stores/authStore';
import api from '@/api/api';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, setToken } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Login mutation hitting real FastAPI backend
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await api.post('/auth/login', { email, password });
      return response;
    },
    onSuccess: (data) => {
      const token = data.access_token || data.token;
      const user = {
        id: data.user_id || 1,
        name: data.name || data.email?.split('@')[0] || 'User',
        email: data.email,
        role: data.role || 'student',
      };
      setToken(token);
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Email Input Field */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-[#EEEAF8] text-xs font-semibold">
          Email Address
        </Label>
        <motion.div
          animate={errors.email ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
            <HugeiconsIcon icon={Mail01Icon} className="size-5" />
          </span>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            disabled={loginMutation.isPending}
            className={`w-full h-13 pl-12 pr-4 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
              errors.email
                ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
            }`}
            {...register('email')}
          />
        </motion.div>
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.email.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password Input Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-[#EEEAF8] text-xs font-semibold">
            Password
          </Label>
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#A78BFA] hover:text-[#C4B5FD] transition-all hover:underline cursor-pointer select-none"
            style={{ textShadow: '0 0 10px rgba(167, 139, 250, 0.2)' }}
          >
            Forgot Password?
          </Link>
        </div>
        <motion.div
          animate={errors.password ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
            <HugeiconsIcon icon={LockIcon} className="size-5" />
          </span>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            disabled={loginMutation.isPending}
            className={`w-full h-13 pl-12 pr-12 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
              errors.password
                ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
            }`}
            {...register('password')}
          />
          <button
            type="button"
            disabled={loginMutation.isPending}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C5A78] hover:text-[#EEEAF8] transition-colors cursor-pointer select-none"
          >
            <motion.div
              key={showPassword ? 'eye-off' : 'eye-on'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <HugeiconsIcon 
                icon={showPassword ? EyeOffIcon : EyeIcon} 
                className="size-5" 
              />
            </motion.div>
          </button>
        </motion.div>
        <AnimatePresence>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="mt-2"
      >
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-13 bg-gradient-to-r from-[#6D28D9] to-[#A78BFA] text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(109,40,217,0.3)] border-0 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {loginMutation.isPending ? (
            <>
              <Spinner className="size-5 text-white" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2.5} />
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}
