import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon, 
  Book02Icon, 
  Briefcase01Icon, 
  Calendar02Icon, 
  Location01Icon,
  Award01Icon,
  ExternalLinkIcon
} from '@hugeicons/core-free-icons';

import api from '@/api/api';
import ProfileHeader from './ProfileHeader';
import SkillChips from './SkillChips';
import ResumeHistory from './ResumeHistory';
import CareerCTA from './CareerCTA';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  // 1. Query User Profile
  const { data: user, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/users/me'),
  });

  // 2. Query Resume history
  const { data: resumeData, isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumeHistory'],
    queryFn: () => api.get('/resume/history'),
  });

  // Mutation: Avatar Upload
  const avatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      toast.success('Avatar photo updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload photo.');
    },
  });

  // Calculate profile completeness score
  const completeness = React.useMemo(() => {
    if (!user) return 0;
    let score = 20; // Default baseline (verified email)
    if (user.full_name) score += 20;
    if (user.profile?.city) score += 20;
    if (user.skills?.length > 0) score += 20;
    if (resumeData?.items?.length > 0) score += 20;
    return score;
  }, [user, resumeData]);

  const mapEducation = (val) => {
    if (!val) return 'Not specified';
    const u = val.toUpperCase();
    if (u === 'BTECH') return 'B.Tech / Bachelor of Technology';
    if (u === 'MTECH') return 'M.Tech / Master of Technology';
    if (u === 'MBA') return 'M.B.A / Master of Business Admin';
    if (u === 'PHD') return 'Ph.D / Doctor of Philosophy';
    if (u === '12TH') return 'High School (12th Grade)';
    if (u === 'DIPLOMA') return 'Diploma / Associate Degree';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  if (isLoadingProfile || isLoadingResumes) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
        <Skeleton className="h-44 w-full bg-white/5 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full bg-white/5 rounded-3xl animate-pulse" />
            <Skeleton className="h-64 w-full bg-white/5 rounded-3xl animate-pulse" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full bg-white/5 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[45%] h-[45%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Profile Header (Static & High Performance) */}
      <ProfileHeader
        user={user}
        onAvatarUpload={(file) => avatarMutation.mutate(file)}
        isUploadingAvatar={avatarMutation.isPending}
      />

      {/* Responsive Cards Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10"
      >
        {/* Main Columns (Left & Center) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Academic Background Card */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <HugeiconsIcon icon={Book02Icon} className="size-4.5 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                Academic Background
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-[#A2A0C2]">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Degree / Education Level</span>
                <p className="text-white font-semibold font-sans">{mapEducation(user?.profile?.education_level)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Field of Study</span>
                <p className="text-white font-semibold font-sans">{user?.profile?.field_of_study || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Institution / University</span>
                <p className="text-white font-semibold font-sans">{user?.profile?.institution_name || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Graduation Year</span>
                <p className="text-white font-semibold font-sans flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar02Icon} className="size-3.5 text-violet-400" />
                  <span>{user?.profile?.graduation_year || 'Not specified'}</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Career Preferences Card */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <HugeiconsIcon icon={Briefcase01Icon} className="size-4.5 text-violet-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                Career Preferences
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs text-[#A2A0C2]">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Preferred Work Mode</span>
                <p className="text-white font-semibold capitalize font-sans">{user?.profile?.preferred_work_mode || 'Not specified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Target Salary (CTC)</span>
                <p className="text-white font-semibold font-sans">
                  {user?.profile?.expected_salary_min 
                    ? `₹${Math.round(user.profile.expected_salary_min / 100000)}L / annum` 
                    : 'Not specified'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">Preferred City</span>
                <p className="text-white font-semibold font-sans flex items-center gap-1">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-cyan-400" />
                  <span>{user?.profile?.city || 'Not specified'}</span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-[#5C5A78] font-bold">State / Region</span>
                <p className="text-white font-semibold font-sans">{user?.profile?.state || 'Not specified'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SkillChips skills={user?.skills} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ResumeHistory resumes={resumeData?.items} />
          </motion.div>
        </div>

        {/* Sidebar Column (Right) */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Completeness Card */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-5"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Profile Completeness
              </h4>
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                {completeness}%
              </span>
            </div>

            <div className="space-y-3">
              <Progress value={completeness} className="h-2 bg-white/5 rounded-full overflow-hidden" />
              
              <div className="space-y-2 pt-2 border-t border-white/5 text-[9px] font-mono text-[#A2A0C2]">
                <div className="flex items-center justify-between">
                  <span>Name and Details</span>
                  <span className={user?.full_name ? 'text-emerald-400' : 'text-[#5C5A78]'}>
                    {user?.full_name ? '✓ Linked' : '✕ Missing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Professional Skills</span>
                  <span className={user?.skills?.length > 0 ? 'text-emerald-400' : 'text-[#5C5A78]'}>
                    {user?.skills?.length > 0 ? '✓ Configured' : '✕ Missing'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ATS Resume Audit</span>
                  <span className={resumeData?.items?.length > 0 ? 'text-emerald-400' : 'text-[#5C5A78]'}>
                    {resumeData?.items?.length > 0 ? '✓ Parsed' : '✕ Missing'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Links Card */}
          <motion.div
            variants={itemVariants}
            className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-4"
          >
            <div className="border-b border-white/5 pb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Professional Links
              </h4>
            </div>

            <div className="space-y-3">
              {/* LinkedIn Link */}
              {user?.profile?.linkedin_url ? (
                <a
                  href={user.profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-[#0077B5]/10 hover:border-[#0077B5]/30 text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {/* Inline SVG for LinkedIn Logo */}
                    <svg className="size-4.5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="text-xs font-semibold font-sans">LinkedIn</span>
                  </div>
                  <HugeiconsIcon icon={ExternalLinkIcon} className="size-3.5 text-[#5C5A78] group-hover:text-white transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/5 text-[#5C5A78] text-xs font-mono">
                  <svg className="size-4.5 text-[#5C5A78]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn Not Linked</span>
                </div>
              )}

              {/* GitHub Link */}
              {user?.profile?.github_url ? (
                <a
                  href={user.profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/20 text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {/* Inline SVG for GitHub Logo */}
                    <svg className="size-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-xs font-semibold font-sans">GitHub</span>
                  </div>
                  <HugeiconsIcon icon={ExternalLinkIcon} className="size-3.5 text-[#5C5A78] group-hover:text-white transition-colors" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/5 text-[#5C5A78] text-xs font-mono">
                  <svg className="size-4.5 text-[#5C5A78]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span>GitHub Not Linked</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CareerCTA />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

