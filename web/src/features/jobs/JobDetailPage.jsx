import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Task02Icon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import api from '@/api/api';
import {
  getJobDetails,
  getInterviewTips,
  getJobApplications,
  getSemanticMatches,
  applyToJob,
  saveJob,
  unsaveJob,
} from './jobs.api';
import CompanyBanner from './CompanyBanner';
import SkillMatchList from './SkillMatchList';
import InterviewTips from './InterviewTips';
import ApplyBar from './ApplyBar';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const jobId = parseInt(id, 10);

  // 1. Fetch Job details
  const { data: job, isLoading: isLoadingJob, isError: isJobError } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: () => getJobDetails(jobId),
    enabled: !!jobId,
  });

  // 2. Fetch AI Interview Tips
  const { data: tips, isLoading: isLoadingTips } = useQuery({
    queryKey: ['jobInterviewTips', jobId],
    queryFn: () => getInterviewTips(jobId),
    enabled: !!jobId,
  });

  // 3. Fetch User profile (to get user's skills for comparison)
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/users/me'),
  });

  // 4. Fetch User resumes history
  const { data: resumeHistory, isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumeHistory'],
    queryFn: () => api.get('/resume/history'),
  });

  // 5. Fetch User applications/bookmarks to check current job status
  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['jobApplications'],
    queryFn: () => getJobApplications(),
  });

  const { data: matchData } = useQuery({
    queryKey: ['semanticMatches'],
    queryFn: getSemanticMatches,
  });

  const matchScoresMap = matchData?.match_scores || {};
  const matchScore = matchScoresMap[jobId.toString()] || 70;

  // Extract application entry for this job
  const application = applicationsData?.items?.find((app) => app.job_id === jobId) || null;

  // Mutations
  const applyMutation = useMutation({
    mutationFn: (payload) => applyToJob(jobId, payload),
    onSuccess: () => {
      toast.success('Your application has been submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to submit application. Please try again.');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => saveJob(jobId),
    onSuccess: () => {
      toast.success('Opportunity saved to your bookmarks.');
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to save job listing.');
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => unsaveJob(jobId),
    onSuccess: () => {
      toast.success('Bookmark removed.');
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to unsave job listing.');
    },
  });

  if (isLoadingJob || isLoadingProfile || isLoadingApplications) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
        <Skeleton className="h-6 w-32 bg-white/5 rounded-sm" />
        <Skeleton className="h-44 w-full bg-white/5 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full bg-white/5 rounded-3xl" />
            <Skeleton className="h-20 w-full bg-white/5 rounded-3xl" />
            <Skeleton className="h-60 w-full bg-white/5 rounded-3xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-48 w-full bg-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isJobError || !job) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col items-center justify-center p-12 text-center select-none">
        <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Job listing not found</h2>
        <p className="text-sm text-[#9D99B8] mb-6 max-w-sm">
          The opportunity you are looking for may have expired or been deactivated by the company.
        </p>
        <button
          onClick={() => navigate('/jobs')}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  // Acquired user skills mapping for checklist match overlaps
  const userSkills = userProfile?.skills?.map((s) => s.skill_name) || [];
  const requiredSkills = job.required_skills_json || [];

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-24 md:pb-16 select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/[0.04] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Back CTA Button */}
      <nav className="relative z-10 select-none">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-xs font-mono text-[#A2A0C2] hover:text-white transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Back to Marketplace</span>
        </button>
      </nav>

      {/* Company Banner */}
      <header className="relative z-10 w-full select-none">
        <CompanyBanner job={job} />
      </header>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Left main column details */}
        <main className="lg:col-span-2 space-y-6">
          {/* Skill Matching Component */}
          <section className="w-full">
            <SkillMatchList requiredSkills={requiredSkills} userSkills={userSkills} />
          </section>

          {/* Collapsible AI Interview preparation tips */}
          <section className="w-full">
            <InterviewTips tips={tips?.tips_markdown} />
          </section>

          {/* Job description sheet */}
          <section className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2.5 text-sm font-extrabold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-4 mb-5 select-none">
              <HugeiconsIcon icon={Task02Icon} className="size-4.5 text-violet-400" />
              <h3>Opportunity Description</h3>
            </div>

            <div className="prose prose-invert max-w-none text-[#A2A0C2] leading-relaxed selection:bg-violet-500/30">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl font-black text-white mt-6 mb-3 font-mono" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-5 mb-2.5 font-mono" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-bold text-white mt-4 mb-2 font-mono" {...props} />,
                  p: ({ node, ...props }) => <p className="text-xs md:text-sm text-[#A2A0C2] leading-relaxed mb-4" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-[#A2A0C2] text-xs md:text-sm" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-[#A2A0C2] text-xs md:text-sm" {...props} />,
                  li: ({ node, ...props }) => <li className="text-xs md:text-sm" {...props} />,
                  a: ({ node, ...props }) => <a className="text-[#22D3EE] hover:underline font-semibold" target="_blank" rel="noreferrer" {...props} />,
                  strong: ({ node, ...props }) => <strong className="text-white font-extrabold" {...props} />,
                }}
              >
                {job.description_raw || '*No detailed description provided for this job.*'}
              </ReactMarkdown>
            </div>
          </section>
        </main>

        {/* Right column sidebar controls */}
        <aside className="lg:col-span-1 w-full">
          <ApplyBar
            job={job}
            application={application}
            resumes={resumeHistory?.items}
            isLoadingResumes={isLoadingResumes}
            onApply={(payload) => applyMutation.mutateAsync(payload)}
            onSave={() => saveMutation.mutateAsync()}
            onUnsave={() => unsaveMutation.mutateAsync()}
            isApplying={applyMutation.isPending}
            isSaving={saveMutation.isPending || unsaveMutation.isPending}
          />
        </aside>
      </div>
    </div>
  );
}
