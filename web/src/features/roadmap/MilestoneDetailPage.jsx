import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  CheckmarkCircle02Icon,
  CircleIcon
} from '@hugeicons/core-free-icons';

import { getRoadmapDetails } from './roadmap.api';
import { toggleMilestone } from './milestone.api';
import ResourceCard from './ResourceCard';
import PortfolioCard from './PortfolioCard';

export default function MilestoneDetailPage() {
  const { id, mid } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showSuccessGlow, setShowSuccessGlow] = useState(false);

  // 1. Fetch full roadmap details containing milestones structure
  const { data: roadmap, isLoading: isRoadmapLoading } = useQuery({
    queryKey: ['roadmapDetails', id],
    queryFn: () => getRoadmapDetails(id),
    enabled: !!id
  });

  // Search the phases structure to locate the specific milestone metadata matching 'mid'
  let milestone = null;
  let phaseName = '';
  let phaseWeeks = '';

  const phases = roadmap?.milestones_json?.phases || [];
  const completedMilestones = roadmap?.milestones_json?.completed_milestones || [];
  const isCompleted = completedMilestones.includes(mid);

  for (const phase of phases) {
    const topic = phase.topics?.find((t) => t.topic_id === mid);
    if (topic) {
      milestone = topic;
      phaseName = phase.phase === 1 ? 'Foundation' : (phase.phase === 2 ? 'Specialist' : 'Mastery');
      phaseWeeks = phase.weeks;
      break;
    }
  }

  // Success animation trigger
  useEffect(() => {
    if (isCompleted) {
      setShowSuccessGlow(true);
      const timer = setTimeout(() => setShowSuccessGlow(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  // 2. Milestone Complete toggle mutation with OPTIMISTIC updates
  const toggleMutation = useMutation({
    mutationFn: (completedState) => toggleMilestone({
      roadmapId: id,
      milestoneId: mid,
      completed: completedState
    }),
    onMutate: async (completedState) => {
      // Cancel outgoing refetches to avoid overwriting optimistic updates
      await queryClient.cancelQueries({ queryKey: ['roadmapDetails', id] });

      // Snapshot the previous cache value
      const previousRoadmap = queryClient.getQueryData(['roadmapDetails', id]);

      // Optimistically update the cache record immediately
      queryClient.setQueryData(['roadmapDetails', id], (old) => {
        if (!old) return old;
        const oldMilestones = old.milestones_json || {};
        const currentCompleted = oldMilestones.completed_milestones || [];

        let newCompleted = [...currentCompleted];
        if (completedState) {
          if (!newCompleted.includes(mid)) newCompleted.push(mid);
        } else {
          newCompleted = newCompleted.filter((m) => m !== mid);
        }

        // Optimistically recalculate percentage progress
        let totalTopics = 0;
        const phasesList = oldMilestones.phases || [];
        for (const p of phasesList) {
          totalTopics += (p.topics?.length || 0);
        }
        const newPct = totalTopics > 0 ? (newCompleted.length / totalTopics) * 100 : 0;

        return {
          ...old,
          completion_pct: Math.min(100, Math.max(0, newPct)),
          milestones_json: {
            ...oldMilestones,
            completed_milestones: newCompleted
          }
        };
      });

      // Return context containing previous value for error rollbacks
      return { previousRoadmap };
    },
    onError: (err, completedState, context) => {
      // Rollback to previous state
      if (context?.previousRoadmap) {
        queryClient.setQueryData(['roadmapDetails', id], context.previousRoadmap);
      }
      toast.error('Failed to update milestone progress. Please try again.');
    },
    onSettled: () => {
      // Refetch fresh data to ensure database sync is matching
      queryClient.invalidateQueries({ queryKey: ['roadmapDetails', id] });
    }
  });

  const handleToggleComplete = () => {
    if (toggleMutation.isPending) return;
    toggleMutation.mutate(!isCompleted);
  };

  // Loading skeletons screen
  if (isRoadmapLoading) {
    return (
      <div className="min-h-screen bg-[#060608] text-white p-6 md:p-10 flex flex-col items-center justify-center gap-8 relative select-none">
        <div className="absolute inset-0 bg-[#060608] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none opacity-50" />
        
        {/* Header Skeleton */}
        <div className="w-full max-w-7xl space-y-3 animate-pulse border-b border-white/5 pb-6">
          <div className="h-4 w-28 bg-white/5 rounded-full" />
          <div className="h-8 w-96 bg-white/10 rounded-lg" />
          <div className="h-4.5 w-60 bg-white/5 rounded-md" />
        </div>

        {/* Card skeletons */}
        <div className="w-full max-w-7xl space-y-6 animate-pulse">
          <div className="h-32 bg-white/5 border border-white/5 rounded-3xl" />
          <div className="h-60 bg-white/5 border border-white/5 rounded-3xl" />
          <div className="h-12 w-full bg-white/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 select-none">
        <h3 className="text-xl font-bold text-white mb-2">Milestone Not Found</h3>
        <p className="text-sm text-[#9D99B8] max-w-xs mb-6">
          We couldn't locate the details of this specific learning milestone.
        </p>
        <button
          onClick={() => navigate('/roadmap')}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer"
        >
          Return to Roadmap
        </button>
      </div>
    );
  }

  const { title, description, resources = [], portfolio_project } = milestone;

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
      {/* Sci-Fi overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6 px-2">
        {/* Floating Success Glow completes Overlay */}
        <AnimatePresence>
          {showSuccessGlow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-emerald-500/[0.02] border-2 border-emerald-500/20 pointer-events-none rounded-[32px] z-20 shadow-[0_0_50px_rgba(16,185,129,0.18)] flex items-center justify-center"
            >
              <div className="bg-black/90 backdrop-blur-xl px-6 py-3 rounded-full border border-emerald-500/25 text-emerald-400 flex items-center gap-2 font-mono text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] select-none">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-[#10B981] animate-bounce" />
                <span>Milestone Completed!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back navigation button & Badges Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (roadmap?.roadmap_id) {
                navigate(`/roadmap?roadmapId=${roadmap.roadmap_id}${roadmap.career_id ? `&careerId=${roadmap.career_id}` : ''}`);
              } else {
                navigate('/roadmap');
              }
            }}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 text-[#A2A0C2] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>Roadmap Overview</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_12px_rgba(139,92,246,0.1)] px-2.5 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded-full uppercase">
              Phase: {phaseName}
            </span>
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(34,211,238,0.1)] px-2.5 py-0.5 text-[9px] font-bold font-mono tracking-wider rounded-full uppercase">
              {phaseWeeks}
            </span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Learning Goal & Study Materials */}
          <div className="lg:col-span-8 space-y-6">
            {/* Milestone Title & Descriptor Glass Card */}
            <div className="w-full bg-[#161525]/40 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
              
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
                  Learning Mission Goal
                </span>
                <h2 className="text-lg md:text-2xl font-black text-white leading-snug font-sans">
                  {title}
                </h2>
              </div>
              
              <p className="text-xs md:text-sm text-[#A2A0C2] leading-relaxed relative z-10">
                {description}
              </p>
            </div>

            {/* Study Materials list section */}
            {resources.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-[#5C5A78] uppercase tracking-wider pl-1">
                  Recommended Study Materials
                </h3>
                <div className="flex flex-col gap-3">
                  {resources.map((res, index) => (
                    <ResourceCard key={index} resource={res} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Milestone Status & Capstone Goal */}
          <div className="lg:col-span-4 space-y-6">
            {/* Milestone Status Card Widget */}
            <div className="bg-[#161525] border border-white/10 rounded-3xl p-6 space-y-5 shadow-[0_10px_35px_rgba(0,0,0,0.3)] relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-600/5 blur-[40px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-cyan-500/5 blur-[40px] pointer-events-none" />
              
              <h3 className="text-xs font-mono font-bold text-[#5C5A78] uppercase tracking-wider">
                Milestone Status
              </h3>
              
              <div className="flex items-center gap-3.5">
                <span className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'bg-white/5 border-white/10 text-[#A2A0C2] opacity-60'
                }`}>
                  <HugeiconsIcon icon={isCompleted ? CheckmarkCircle02Icon : CircleIcon} className="size-5" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </h4>
                  <p className="text-[10px] text-[#9D99B8] mt-1 leading-relaxed font-sans">
                    {isCompleted 
                      ? 'You have mastered this skill set.' 
                      : 'Complete recommended courses & build the capstone output.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleComplete}
                disabled={toggleMutation.isPending}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer select-none ${
                  isCompleted
                    ? 'border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]'
                }`}
              >
                {isCompleted ? (
                  <span>Mark Incomplete</span>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 text-white/80" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </div>

            {/* Capstone Portfolio Project section */}
            {portfolio_project && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-[#5C5A78] uppercase tracking-wider pl-1">
                  Capstone Goal
                </h3>
                <PortfolioCard project={portfolio_project} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
