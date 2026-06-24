import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';

import useAuthStore from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';

import CareerMatchCard from './CareerMatchCard';
import RoadmapProgressWidget from './RoadmapProgressWidget';
import QuickActionGrid from './QuickActionGrid';
import AnalyticsCard from './AnalyticsCard';
import {
  getCareerRecommendations,
  getAnalyticsDashboard,
  getRoadmapStatus,
  getJobsMatchCount,
} from './dashboard.api';


export default function DashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'Alex';

  // Mobile Pull-to-refresh gesture states
  const [pullDownY, setPullDownY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isAtTop = useRef(true);

  // Parallel API queries via React Query
  const {
    data: recsData,
    isLoading: recsLoading,
  } = useQuery({
    queryKey: ['careerRecommendations'],
    queryFn: () => getCareerRecommendations(),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: () => getAnalyticsDashboard(),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: roadmapData,
    isLoading: roadmapLoading,
  } = useQuery({
    queryKey: ['roadmapStatus'],
    queryFn: () => getRoadmapStatus(),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: jobsData,
    isLoading: jobsLoading,
  } = useQuery({
    queryKey: ['jobsMatch'],
    queryFn: () => getJobsMatchCount(),
    staleTime: 1000 * 60 * 5,
  });

  // Track scroll boundary for Pull-to-refresh
  useEffect(() => {
    const handleScroll = () => {
      isAtTop.current = window.scrollY === 0;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTouchStart = (e) => {
    if (isAtTop.current && !isRefreshing) {
      startY.current = e.touches[0].pageY;
    }
  };

  const handleTouchMove = (e) => {
    if (isAtTop.current && !isRefreshing && startY.current > 0) {
      const currentY = e.touches[0].pageY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        // Apply logarithm-like resistance
        setPullDownY(Math.min(diff * 0.45, 90));
      }
    }
  };

  const handleTouchEnd = async () => {
    startY.current = 0;
    if (pullDownY > 55) {
      setIsRefreshing(true);
      setPullDownY(55);

      try {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['careerRecommendations'] }),
          queryClient.invalidateQueries({ queryKey: ['analyticsDashboard'] }),
          queryClient.invalidateQueries({ queryKey: ['roadmapStatus'] }),
          queryClient.invalidateQueries({ queryKey: ['jobsMatch'] }),
        ]);
        toast.success('Dashboard metrics refreshed');
      } catch (err) {
        toast.error('Failed to update dashboard data');
      } finally {
        setIsRefreshing(false);
        setPullDownY(0);
      }
    } else {
      setPullDownY(0);
    }
  };

  const isLoading = recsLoading || analyticsLoading || roadmapLoading || jobsLoading;

  // Extract combined states
  const careers = recsData?.careers || [];
  const activeRoadmap = roadmapData?.items?.[0] || null;
  const jobsCount = jobsData?.matched_jobs?.length || 8;
  const skillProgress = analyticsData?.skill_progress || [];
  const assessmentScores = analyticsData?.assessment_scores || [];
  const careerFitTrend = analyticsData?.career_fit_trend || [];

  // Framer Motion staggered entrance presets
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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#060608] px-6 py-6 flex flex-col gap-6 text-foreground">
        {/* Welcome Section Skeleton */}
        <Skeleton className="w-full h-32 rounded-3xl bg-white/5" />

        {/* Carousel Skeleton */}
        <div className="flex gap-5 overflow-hidden">
          <Skeleton className="w-[320px] h-[220px] shrink-0 rounded-2xl bg-white/5" />
          <Skeleton className="w-[320px] h-[220px] shrink-0 rounded-2xl bg-white/5" />
          <Skeleton className="w-[320px] h-[220px] shrink-0 rounded-2xl bg-white/5" />
        </div>

        {/* Widgets Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-1 h-[220px] rounded-3xl bg-white/5" />
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[130px] rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>

        {/* Analytics Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[280px] rounded-3xl bg-white/5" />
          <Skeleton className="h-[280px] rounded-3xl bg-white/5" />
          <Skeleton className="h-[280px] rounded-3xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full min-h-screen bg-[#060608] px-4 md:px-8 py-6 relative overflow-hidden font-sans text-foreground select-none pb-20 md:pb-8"
    >
      {/* AI Grid Background Overlay */}
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

      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#22D3EE]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Pull gesture refresh spinner */}
      {pullDownY > 0 && (
        <div
          className="absolute top-2 left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{
            transform: `translateY(${pullDownY}px)`,
            opacity: Math.min(pullDownY / 45, 1),
            transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <div className="size-9 rounded-full bg-[#161525] border border-white/10 flex items-center justify-center shadow-lg shadow-violet-500/10">
            <HugeiconsIcon
              icon={SparklesIcon}
              className={`size-4.5 text-[#22D3EE] ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </div>
        </div>
      )}

      {/* Content wrapper */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="z-[2] relative flex flex-col gap-8 w-full max-w-7xl mx-auto"
        style={{
          transform: isRefreshing ? 'translateY(40px)' : `translateY(${pullDownY * 0.4}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        {/* 1. Top Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_50px_rgba(139,92,246,0.1)]"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-[#EEEAF8] tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Welcome back, {userName}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#9D99B8]">
              Your AI career assistant found new opportunities today.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto px-4 py-2 bg-gradient-to-r from-[#22D3EE]/10 to-[#8B5CF6]/10 border border-cyan-500/20 text-[#22D3EE] rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <HugeiconsIcon icon={SparklesIcon} className="size-4 animate-pulse text-[#22D3EE]" strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-wider">AI Analysis Ready</span>
          </div>
        </motion.div>



        {/* 2. Career Matches Carousel */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Recommended Careers
            </h3>
            <p className="text-xs text-[#9D99B8]">
              Dynamic fit modeling calculated based on your profile skill matrix.
            </p>
          </div>
          <CareerMatchCard careers={careers} />
        </motion.div>

        {/* 3. Middle Section: Roadmap & Action Tiles */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 h-full min-h-[220px]">
            <RoadmapProgressWidget roadmap={activeRoadmap} />
          </div>
          <div className="lg:col-span-2">
            <QuickActionGrid jobsCount={jobsCount} />
          </div>
        </motion.div>

        {/* 4. Analytics Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Intelligence Telemetry
            </h3>
            <p className="text-xs text-[#9D99B8]">
              Comprehensive analytical overview of your proficiency indices and application outcomes.
            </p>
          </div>
          <AnalyticsCard 
            skillProgress={skillProgress} 
            assessmentScores={assessmentScores} 
            careerFitTrend={careerFitTrend} 
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
