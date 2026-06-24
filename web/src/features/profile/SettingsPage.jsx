import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  Settings02Icon, 
  Alert01Icon, 
  Logout01Icon, 
  LockKeyIcon,
  Tick02Icon,
  UserIcon,
  Notification01Icon
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import api from '@/api/api';
import useAuthStore from '@/stores/authStore';
import useNotificationStore from '@/stores/notificationStore';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Password update validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const navigate = useNavigate();
  
  // Stores
  const { logout, user } = useAuthStore();
  const { jobAlerts, aiRecommendations, emailUpdates, toggleSetting } = useNotificationStore();

  // Query User Profile to keep data synced dynamically
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/users/me'),
  });

  const [shouldShake, setShouldShake] = useState(false);

  // React Hook Form for Password Change
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Mutations
  const changePasswordMutation = useMutation({
    mutationFn: (payload) => api.post('/users/me/password', payload),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      reset();
    },
    onError: (err) => {
      setShouldShake(true);
      toast.error(err.message || 'Incorrect current password or change failure.');
      setTimeout(() => setShouldShake(false), 500);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      // Simulate account deletion call
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      toast.success('Account permanently deleted. Re-routing...');
      logout();
      navigate('/login');
    },
    onError: () => {
      toast.error('Failed to process deletion request.');
    },
  });

  const handlePasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      current_password: data.currentPassword,
      new_password: data.newPassword,
    });
  };

  const handleLogout = () => {
    toast.success('Logged out successfully.');
    logout();
    navigate('/login');
  };

  const handleToggleNotification = (key) => {
    toggleSetting(key);
    toast.success('Preferences synced with AI cloud.');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  const shakeVariants = {
    shake: {
      x: [0, -8, 8, -8, 8, -4, 4, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/[0.04] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 select-none">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-xs font-mono text-[#A2A0C2] hover:text-white transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Back to Profile</span>
        </button>
      </nav>

      {/* Page Header */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 flex items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest">
            Profile Settings
          </span>
          <h1 
            className="text-xl md:text-2xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Account Settings & Preferences
          </h1>
        </div>
        <div className="shrink-0 p-2.5 bg-white/5 border border-white/5 text-[#22D3EE] rounded-xl">
          <HugeiconsIcon icon={Settings02Icon} className="size-6 text-[#22D3EE] animate-spin-slow" />
        </div>
      </header>

      {/* Settings Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10"
      >
        {/* Left Column: Account Identity & Notifications (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Account Identity Card */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-1.5">
              <HugeiconsIcon icon={UserIcon} className="size-4.5 text-violet-400" />
              <span>Account Identity</span>
            </h4>

            <div className="flex flex-col items-center text-center space-y-4 py-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center text-violet-300 text-xl font-bold uppercase shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                {(userProfile?.full_name || user?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <h5 className="text-sm font-extrabold text-white">
                  {userProfile?.full_name || user?.name || 'Career Explorer'}
                </h5>
                <p className="text-[10px] text-[#A2A0C2] font-mono leading-none">
                  {userProfile?.email || user?.email || 'user@careerai.com'}
                </p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-mono font-bold text-violet-400 uppercase tracking-wider">
                  {userProfile?.role || user?.role || 'User Profile'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold font-mono animate-fade-in"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4 text-rose-400" />
              <span>Logout Session</span>
            </Button>
          </motion.div>

          {/* Notification preferences */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-1.5">
              <HugeiconsIcon icon={Notification01Icon} className="size-4.5 text-cyan-400" />
              <span>Notification Settings</span>
            </h4>

            <div className="space-y-4">
              {/* Job Alerts */}
              <div className="flex items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <h5 className="font-bold text-white">Job Alerts</h5>
                  <p className="text-[10px] text-[#5C5A78]">Receive new career matches</p>
                </div>
                <Switch
                  checked={jobAlerts}
                  onCheckedChange={() => handleToggleNotification('jobAlerts')}
                  className="cursor-pointer"
                />
              </div>

              {/* AI Recommendations */}
              <div className="flex items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <h5 className="font-bold text-white">Roadmap Triggers</h5>
                  <p className="text-[10px] text-[#5C5A78]">Triggers on skill updates</p>
                </div>
                <Switch
                  checked={aiRecommendations}
                  onCheckedChange={() => handleToggleNotification('aiRecommendations')}
                  className="cursor-pointer"
                />
              </div>

              {/* Email updates */}
              <div className="flex items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <h5 className="font-bold text-white">Email Digest</h5>
                  <p className="text-[10px] text-[#5C5A78]">Weekly hiring summaries</p>
                </div>
                <Switch
                  checked={emailUpdates}
                  onCheckedChange={() => handleToggleNotification('emailUpdates')}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Security (Password) and Danger Zone (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Security Credentials */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-1.5">
              <HugeiconsIcon icon={LockKeyIcon} className="size-4.5 text-violet-400" />
              <span>Modify Password Credentials</span>
            </h4>

            <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4 font-mono text-xs">
              {/* Current Password */}
              <div className="flex flex-col">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  Current Password
                </label>
                <input
                  type="password"
                  {...register('currentPassword')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 outline-none focus:border-violet-500 text-xs h-[44px]"
                  placeholder="••••••••"
                />
                {errors.currentPassword && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="flex flex-col">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  New Password
                </label>
                <input
                  type="password"
                  {...register('newPassword')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 outline-none focus:border-violet-500 text-xs h-[44px]"
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col">
                <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 outline-none focus:border-violet-500 text-xs h-[44px]"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-rose-400 text-[10px] mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full h-[44px] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] flex items-center justify-center gap-1.5 cursor-pointer font-mono"
              >
                <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                <span>{changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          </motion.div>

          {/* Danger zone */}
          <motion.div
            variants={itemVariants}
            animate={shouldShake ? 'shake' : 'default'}
            variants={shakeVariants}
            className="w-full bg-[#1c0b0f]/10 border border-rose-500/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5 animate-pulse-subtle"
          >
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono border-b border-rose-500/10 pb-3 flex items-center gap-1.5">
              <HugeiconsIcon icon={Alert01Icon} className="size-4 animate-pulse text-rose-500" />
              <span>Danger Operations Zone</span>
            </h4>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="space-y-1 font-mono text-xs">
                <h5 className="font-bold text-white">Permanent Account Deletion</h5>
                <p className="text-[10px] text-rose-400/60 leading-relaxed max-w-md">Erase user records, parsed resume telemetry, roadmaps, and vectors permanently from nodes.</p>
              </div>

              {/* AlertDialog Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-rose-600/15 border border-rose-500/30 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl py-3 px-5 flex items-center gap-1.5 cursor-pointer text-xs font-bold font-mono"
                  >
                    <span>Delete Account</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0a0a0f] border border-white/10 text-white rounded-3xl p-6 max-w-sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-sm font-extrabold text-white flex items-center gap-2">
                      <HugeiconsIcon icon={Alert01Icon} className="size-5 text-rose-500 animate-bounce" />
                      Confirm Permanent Deletion?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-[#A2A0C2] leading-relaxed font-mono">
                      This action is irreversible. All of your parsed resume telemetry, skill validations, and calculated roadmap phases will be erased permanently from the index nodes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-2">
                    <AlertDialogCancel className="border-white/5 text-[#A2A0C2] hover:text-white rounded-xl cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

        </div>

      </motion.div>
    </div>
  );
}
