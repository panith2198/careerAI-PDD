import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  SparklesIcon, 
  RouteIcon, 
  Clock01Icon, 
  Task01Icon, 
  Book02Icon 
} from '@hugeicons/core-free-icons';

import { getCareers } from '@/features/career/career.api';
import { getRoadmaps, getRoadmapDetails, generateRoadmap } from './roadmap.api';
import RoadmapProgress from './RoadmapProgress';
import PhaseAccordion from './PhaseAccordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const careerIdParam = searchParams.get('careerId');
  const roadmapIdParam = searchParams.get('roadmapId');

  // Local state parameters for roadmap configuration form
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [targetMonths, setTargetMonths] = useState(3);
  const [budgetInr, setBudgetInr] = useState(0);

  // 1. Fetch active roadmaps
  const { data: roadmapsData, isLoading: isListLoading } = useQuery({
    queryKey: ['roadmapsList', careerIdParam],
    queryFn: () => getRoadmaps({ status: 'active', careerId: careerIdParam }),
    enabled: !roadmapIdParam
  });

  const activeRoadmapSummary = roadmapsData?.items?.[0];
  const activeRoadmapId = roadmapIdParam ? parseInt(roadmapIdParam) : activeRoadmapSummary?.roadmap_id;

  // 2. Fetch full details and poll if generation status is not complete (draft or pending)
  const { data: roadmap, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['roadmapDetails', activeRoadmapId],
    queryFn: () => getRoadmapDetails(activeRoadmapId),
    enabled: !!activeRoadmapId,
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      if (currentStatus === 'draft' || currentStatus === 'generating') {
        return 2000; // poll every 2s
      }
      return false;
    }
  });

  // 3. Load careers to populate generation form dropdown selection
  const { data: careersData } = useQuery({
    queryKey: ['careersDropdownList'],
    queryFn: () => getCareers({ limit: 100 }),
    enabled: !activeRoadmapId
  });

  const careers = careersData?.items || [];

  // Set default career selection if list loads and goal choice is vacant
  useEffect(() => {
    if (careers.length > 0 && !selectedCareerId) {
      if (careerIdParam && careers.some(c => c.career_id.toString() === careerIdParam)) {
        setSelectedCareerId(careerIdParam);
      } else {
        setSelectedCareerId(careers[0].career_id.toString());
      }
    }
  }, [careers, careerIdParam, selectedCareerId]);

  // 4. Generate roadmap mutation trigger
  const generateMutation = useMutation({
    mutationFn: () => generateRoadmap({
      careerId: parseInt(selectedCareerId),
      hoursPerWeek,
      targetMonths,
      budgetInr
    }),
    onSuccess: (data) => {
      toast.success('Your AI Career Roadmap is ready!');
      // Invalidate queries to trigger re-renders
      queryClient.invalidateQueries({ queryKey: ['roadmapsList'] });
    },
    onError: (err) => {
      toast.error('Failed to build curriculum layout. Please try again.');
    }
  });

  const handleGenerateClick = (e) => {
    e.preventDefault();
    if (!selectedCareerId) {
      toast.error('Please select a target career goal first.');
      return;
    }
    generateMutation.mutate();
  };

  // Determine overall aggregate metrics
  const phases = roadmap?.milestones_json?.phases || [];
  const completedMilestones = roadmap?.milestones_json?.completed_milestones || [];
  const totalMilestonesCount = phases.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0);

  // Loading skeleton screen
  const isGlobalLoading = isListLoading || (activeRoadmapId && isDetailsLoading);

  if (isGlobalLoading) {
    return (
      <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
        <div className="absolute inset-0 bg-[#060608] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none opacity-50" />
        
        {/* Header Skeleton */}
        <div className="w-full max-w-7xl space-y-3 animate-pulse border-b border-white/5 pb-6">
          <div className="h-4 w-32 bg-white/5 rounded-full" />
          <div className="h-8 w-80 bg-white/10 rounded-lg" />
          <div className="h-4.5 w-96 bg-white/5 rounded-md" />
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 animate-pulse">
            <div className="h-56 bg-white/5 border border-white/5 rounded-3xl" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 border border-white/5 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
      {/* Grid Pattern and Glow sphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto space-y-8 px-2"
      >
        {/* Header section with hero glass card */}
        <motion.header 
          variants={itemVariants} 
          className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-sm overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="space-y-2 relative z-10 text-center sm:text-left">
            <span className="text-[10px] font-bold font-mono text-[#A2A0C2] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
              <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-violet-400 animate-pulse" />
              <span>AI Operating Center</span>
            </span>
            <h1
              className="text-2xl md:text-3xl font-black text-white leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Your AI Career Roadmap
            </h1>
            <p className="text-xs text-[#A2A0C2] max-w-xl leading-relaxed">
              A personalized, adaptive learning journey designed to close skill gaps and achieve career-readying milestones.
            </p>
          </div>
        </motion.header>

        {generateMutation.isPending ? (
          // Dynamic generation loaders
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center p-16 text-center max-w-md mx-auto gap-6 border border-dashed border-violet-500/20 rounded-3xl bg-violet-500/[0.01]"
          >
            <div className="relative size-16">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/20 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="absolute -inset-1.5 rounded-full border-2 border-t-violet-500 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Designing Learning Journey...
              </h3>
              <p className="text-xs text-[#9D99B8] leading-relaxed">
                Analyzing core requirements, sequencing topological skill graphs, and compiling external study citations.
              </p>
            </div>
          </motion.div>
        ) : !roadmap ? (
          // Onboarding form for empty roadmap lists
          <motion.div
            variants={itemVariants}
            className="w-full max-w-2xl mx-auto bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            <div className="flex items-center gap-3 border-b border-white/5 pb-4 relative z-10">
              <span className="p-2 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-xl shrink-0">
                <HugeiconsIcon icon={RouteIcon} className="size-5 text-[#22D3EE]" />
              </span>
              <div>
                <h3 className="text-sm md:text-base font-extrabold text-white">
                  Configure Career Curriculum
                </h3>
                <p className="text-[10px] text-[#A2A0C2] uppercase font-mono tracking-wider">
                  AI Roadmap Builder Module
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateClick} className="space-y-5 relative z-10">
              {/* Career Goal Select Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-wider block">
                  Select Target Career Goal
                </label>
                <Select value={selectedCareerId} onValueChange={(val) => setSelectedCareerId(val)}>
                  <SelectTrigger size="custom" className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4 text-xs font-semibold hover:bg-white/[0.08] focus:border-violet-500/50 cursor-pointer flex items-center justify-between">
                    <SelectValue placeholder="Select target career goal" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12111d] border border-white/10 text-white shadow-2xl rounded-xl">
                    {careers.map((c) => (
                      <SelectItem 
                        key={c.career_id} 
                        value={c.career_id.toString()}
                        className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs"
                      >
                        {c.title} ({c.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Parameters Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hours committing */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-wider block">
                    Weekly Commitment
                  </label>
                  <Select value={hoursPerWeek.toString()} onValueChange={(val) => setHoursPerWeek(parseInt(val))}>
                    <SelectTrigger size="custom" className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4 text-xs font-semibold hover:bg-white/[0.08] focus:border-violet-500/50 cursor-pointer flex items-center justify-between">
                      <SelectValue placeholder="Select weekly commitment" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12111d] border border-white/10 text-white shadow-2xl rounded-xl">
                      <SelectItem value="5" className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs">5 Hours / Week (Casual)</SelectItem>
                      <SelectItem value="15" className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs">15 Hours / Week (Standard)</SelectItem>
                      <SelectItem value="30" className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs">30 Hours / Week (Intense)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-wider block">
                    Target Duration
                  </label>
                  <Select value={targetMonths.toString()} onValueChange={(val) => setTargetMonths(parseInt(val))}>
                    <SelectTrigger size="custom" className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl px-4 text-xs font-semibold hover:bg-white/[0.08] focus:border-violet-500/50 cursor-pointer flex items-center justify-between">
                      <SelectValue placeholder="Select target duration" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12111d] border border-white/10 text-white shadow-2xl rounded-xl">
                      <SelectItem value="1" className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs">1 Month (Speed Run)</SelectItem>
                      <SelectItem value="3" className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs">3 Months (Standard)</SelectItem>
                      <SelectItem value="6" className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs">6 Months (Deep Dive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CTA submit */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2 cursor-pointer select-none"
              >
                <HugeiconsIcon icon={SparklesIcon} className="size-4.5 text-[#22D3EE] animate-pulse" />
                <span>Generate My AI Roadmap</span>
              </button>
            </form>
          </motion.div>
        ) : (
          // Main interactive timeline dashboards
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left panel: overall progress stats */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
              {/* Progress SVG circle */}
              <RoadmapProgress percentage={roadmap.completion_pct} />

              {/* Mini status stats grid cards */}
              <div className="grid grid-cols-3 gap-3">
                {/* Stats 1: Weeks */}
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  <HugeiconsIcon icon={Clock01Icon} className="size-4 text-cyan-400 mb-2" />
                  <span className="text-xs font-mono font-black text-white leading-none">
                    {roadmap.total_weeks} Wks
                  </span>
                  <span className="text-[8px] font-mono font-bold text-[#5C5A78] uppercase mt-1">
                    Duration
                  </span>
                </div>

                {/* Stats 2: Milestones */}
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  <HugeiconsIcon icon={Task01Icon} className="size-4 text-violet-400 mb-2" />
                  <span className="text-xs font-mono font-black text-white leading-none">
                    {totalMilestonesCount}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-[#5C5A78] uppercase mt-1">
                    Milestones
                  </span>
                </div>

                {/* Stats 3: Commitment */}
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  <HugeiconsIcon icon={Book02Icon} className="size-4 text-emerald-400 mb-2" />
                  <span className="text-xs font-mono font-black text-white leading-none">
                    {roadmap.hours_per_week}h
                  </span>
                  <span className="text-[8px] font-mono font-bold text-[#5C5A78] uppercase mt-1">
                    Commitment
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right panel: dynamic phases timelines */}
            <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold text-[#5C5A78] uppercase tracking-wider">
                  Timeline Phases
                </h3>
                <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">
                  Click header to expand milestones
                </span>
              </div>

              {phases.map((phase) => (
                <PhaseAccordion
                  key={phase.phase}
                  phase={phase}
                  completedMilestones={completedMilestones}
                  roadmapId={roadmap.roadmap_id}
                />
              ))}
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
