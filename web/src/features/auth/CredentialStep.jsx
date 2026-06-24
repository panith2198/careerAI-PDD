import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  UserIcon, 
  Mail01Icon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon 
} from '@hugeicons/core-free-icons';

export default function CredentialStep({ register, errors, showPassword, setShowPassword, isPending }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Name Input Field */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="name" className="text-[#EEEAF8] text-xs font-semibold">
          Full Name
        </Label>
        <motion.div
          animate={errors.name ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
            <HugeiconsIcon icon={UserIcon} className="size-5" />
          </span>
          <Input
            id="name"
            type="text"
            placeholder="Full name"
            disabled={isPending}
            className={`w-full h-11 pl-12 pr-4 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
              errors.name
                ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
            }`}
            {...register('name')}
          />
        </motion.div>
        <AnimatePresence>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.name.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Email Input Field */}
      <div className="flex flex-col gap-1">
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
            placeholder="Email address"
            disabled={isPending}
            className={`w-full h-11 pl-12 pr-4 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
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
      <div className="flex flex-col gap-1">
        <Label htmlFor="password" className="text-[#EEEAF8] text-xs font-semibold">
          Password
        </Label>
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
            placeholder="Password"
            disabled={isPending}
            className={`w-full h-11 pl-12 pr-12 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
              errors.password
                ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
            }`}
            {...register('password')}
          />
          <button
            type="button"
            disabled={isPending}
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

      {/* Confirm Password Input Field */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="confirmPassword" className="text-[#EEEAF8] text-xs font-semibold">
          Confirm Password
        </Label>
        <motion.div
          animate={errors.confirmPassword ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C5A78] flex items-center justify-center pointer-events-none">
            <HugeiconsIcon icon={LockIcon} className="size-5" />
          </span>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            disabled={isPending}
            className={`w-full h-11 pl-12 pr-4 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
              errors.confirmPassword
                ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
            }`}
            {...register('confirmPassword')}
          />
        </motion.div>
        <AnimatePresence>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
