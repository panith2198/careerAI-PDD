import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, FileUploadIcon, Task02Icon } from '@hugeicons/core-free-icons';

import api from '@/api/api';
import { getResumeDetails } from './resume.api';
import PDFViewer from './PDFViewer';
import ATSReport from './ATSReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResumePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const resumeId = parseInt(id, 10);

  // 1. Fetch Resume analysis payload
  const { data: resume, isLoading: isLoadingResume, isError } = useQuery({
    queryKey: ['resumeDetails', resumeId],
    queryFn: () => getResumeDetails(resumeId),
    enabled: !!resumeId,
  });

  // 2. Fetch User Profile for skill checks
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/users/me'),
  });

  if (isLoadingResume || isLoadingProfile) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
        <Skeleton className="h-6 w-32 bg-white/5 rounded-sm animate-pulse" />
        <Skeleton className="h-20 w-full bg-white/5 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] w-full bg-white/5 rounded-3xl animate-pulse" />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-32 w-full bg-white/5 rounded-3xl animate-pulse" />
            <Skeleton className="h-60 w-full bg-white/5 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col items-center justify-center p-12 text-center select-none">
        <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Report not found</h2>
        <p className="text-sm text-[#9D99B8] mb-6 max-w-sm">
          The requested resume analysis report could not be found or access has been restricted.
        </p>
        <button
          onClick={() => navigate('/resume/upload')}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-mono"
        >
          Return to Upload page
        </button>
      </div>
    );
  }

  const userSkills = userProfile?.skills?.map((s) => s.skill_name) || [];

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/[0.04] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Back button */}
      <nav className="relative z-10 select-none">
        <button
          onClick={() => navigate('/resume/upload')}
          className="flex items-center gap-2 text-xs font-mono text-[#A2A0C2] hover:text-white transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Back to Upload</span>
        </button>
      </nav>

      {/* Page Header Title */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 flex items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest">
            Analysis Report
          </span>
          <h1 
            className="text-xl md:text-2xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Resume Evaluation Telemetry
          </h1>
        </div>
        <div className="shrink-0 p-2.5 bg-white/5 border border-white/5 text-[#22D3EE] rounded-xl">
          <HugeiconsIcon icon={Task02Icon} className="size-6" />
        </div>
      </header>

      {/* Responsive Layout Content */}
      <div className="relative z-10">
        {/* Desktop Side-by-Side Screen */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2">
            <PDFViewer fileUrl={resume.file_url} />
          </div>
          <div className="lg:col-span-3">
            <ATSReport resume={resume} userSkills={userSkills} />
          </div>
        </div>

        {/* Mobile Toggled Tabs Screen */}
        <div className="lg:hidden w-full">
          <Tabs defaultValue="parsed" className="w-full space-y-6">
            <TabsList className="grid grid-cols-2 bg-white/[0.02] border border-white/10 p-1 rounded-2xl h-11">
              <TabsTrigger 
                value="pdf" 
                className="text-xs font-bold font-mono rounded-xl data-[state=active]:bg-white/5 data-[state=active]:text-white cursor-pointer"
              >
                PDF View
              </TabsTrigger>
              <TabsTrigger 
                value="parsed" 
                className="text-xs font-bold font-mono rounded-xl data-[state=active]:bg-white/5 data-[state=active]:text-white cursor-pointer"
              >
                Parsed Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="outline-none focus:outline-none">
              <PDFViewer fileUrl={resume.file_url} />
            </TabsContent>

            <TabsContent value="parsed" className="outline-none focus:outline-none">
              <ATSReport resume={resume} userSkills={userSkills} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
