import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, Award01Icon, StarIcon, Task02Icon } from '@hugeicons/core-free-icons';

import api from '@/api/api';
import { getAnalyticsDashboard, getJobApplications } from './analytics.api';
import DateRangePicker from './DateRangePicker';
import ExportCSVButton from './ExportCSVButton';
import AnalyticsTabs from './AnalyticsTabs';

export default function AnalyticsDashboardPage() {
  // Default range: January 1st of current year to Today
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date()
  });

  // 1. Query dashboard telemetry metrics
  const { data: rawDashboardData, isLoading: isLoadingDashboard, isError: isDashboardError } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: getAnalyticsDashboard
  });

  // 2. Query job applications funnel statistics
  const { data: rawApplicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ['jobApplicationsAnalytics'],
    queryFn: getJobApplications
  });

  // Process and filter telemetry statistics client-side based on the selected date range
  const filteredDashboard = useMemo(() => {
    if (!rawDashboardData) return null;
    if (!dateRange?.from) return rawDashboardData;

    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to ? dateRange.to.getTime() : new Date().getTime();

    const checkDateInRange = (dateString) => {
      if (!dateString) return true; // Include if no date is recorded
      try {
        const time = new Date(dateString).getTime();
        return time >= fromTime && time <= toTime;
      } catch (e) {
        return true;
      }
    };

    return {
      ...rawDashboardData,
      skill_progress: (rawDashboardData.skill_progress || []).filter(s => checkDateInRange(s.added_at)),
      assessment_scores: (rawDashboardData.assessment_scores || []).filter(a => checkDateInRange(a.completed_at)),
      career_fit_trend: (rawDashboardData.career_fit_trend || []).filter(c => checkDateInRange(c.generated_at))
    };
  }, [rawDashboardData, dateRange]);

  // Process and filter job applications client-side
  const filteredApplications = useMemo(() => {
    const rawApps = Array.isArray(rawApplicationsData)
      ? rawApplicationsData
      : (rawApplicationsData?.items || []);

    if (!dateRange?.from) return rawApps;

    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to ? dateRange.to.getTime() : new Date().getTime();

    return rawApps.filter(app => {
      const dateString = app.applied_at || app.created_at || '';
      if (!dateString) return true;
      try {
        const time = new Date(dateString).getTime();
        return time >= fromTime && time <= toTime;
      } catch (e) {
        return true;
      }
    });
  }, [rawApplicationsData, dateRange]);

  // Compute overall aggregated statistics for display cards
  const stats = useMemo(() => {
    if (!filteredDashboard) {
      return { overallScore: '0%', standing: 'Top 100%', skillsImproved: 0, appliedCount: 0 };
    }

    const fitTrend = filteredDashboard.career_fit_trend || [];
    const latestFit = fitTrend.length > 0 ? Math.round(fitTrend[fitTrend.length - 1].fit_score) : 0;

    const scores = filteredDashboard.assessment_scores || [];
    const maxPercentile = scores.length > 0 ? Math.max(...scores.map(s => s.percentile_rank || 0)) : 0;
    const normalizedPercentile = maxPercentile <= 1 ? maxPercentile * 100 : maxPercentile;
    const standingVal = maxPercentile > 0 ? `Top ${Math.max(1, Math.round(100 - normalizedPercentile))}%` : 'Top 100%';

    const skillsImprovedCount = (filteredDashboard.skill_progress || []).filter(s => s.proficiency_score > 50).length;

    return {
      overallScore: `${latestFit}%`,
      standing: standingVal,
      skillsImproved: skillsImprovedCount,
      appliedCount: filteredApplications.length
    };
  }, [filteredDashboard, filteredApplications]);

  const isEmpty = useMemo(() => {
    if (!filteredDashboard) return false;
    return (
      (filteredDashboard.skill_progress || []).length === 0 &&
      (filteredDashboard.assessment_scores || []).length === 0 &&
      (filteredDashboard.roadmap_pct || []).length === 0
    );
  }, [filteredDashboard]);

  const isLoading = isLoadingDashboard || isLoadingApps;

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
      {/* Sci-Fi Deep Space Ambient Glow Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] right-[5%] w-[50%] h-[40%] rounded-full bg-violet-600/[0.04] blur-[150px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] rounded-full bg-cyan-600/[0.03] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Header section with title */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="space-y-2 relative z-10 text-center sm:text-left">
          <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-cyan-400 animate-pulse" />
            <span>AI Telemetry Dashboard</span>
          </span>
          <h1
            className="text-2xl md:text-3xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Your Career Intelligence Analytics
          </h1>
          <p className="text-xs text-[#A2A0C2] max-w-lg leading-relaxed">
            Track your skills evolution, assessment performance stats, learning roadmap completions, and job recruitment metrics.
          </p>
        </div>

        <div className="shrink-0 p-3.5 bg-white/5 border border-white/5 text-[#22D3EE] rounded-2xl relative z-10 shadow-lg hidden md:block">
          <HugeiconsIcon icon={Award01Icon} className="size-7" />
        </div>
      </header>

      {/* Actions and date range filter selectors */}
      <section className="relative z-30 flex flex-wrap items-center justify-between gap-4">
        <DateRangePicker range={dateRange} onRangeChange={setDateRange} />
        {filteredDashboard && <ExportCSVButton data={filteredDashboard} />}
      </section>

      {/* Main Grid Content */}
      <main className="relative z-10">
        {isLoading ? (
          // Skeleton Loading State
          <div className="space-y-6 animate-pulse">
            {/* Stats row skeletons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 h-24" />
              ))}
            </div>
            {/* Tabs Skeletons */}
            <div className="h-11 bg-white/[0.02] border border-white/5 rounded-xl w-64" />
            {/* Charts grid skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl h-72" />
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl h-72" />
            </div>
          </div>
        ) : isDashboardError ? (
          <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl">
            <p className="text-xs font-mono text-rose-400">Failed to resolve dashboard telemetry statistics.</p>
          </div>
        ) : isEmpty ? (
          // AI Empty State Card
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center p-12 bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl shadow-lg border-dashed py-24"
          >
            <div className="p-4 bg-violet-600/10 border border-violet-500/20 text-[#A78BFA] rounded-full mb-4">
              <HugeiconsIcon icon={SparklesIcon} className="size-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 font-mono uppercase tracking-wider">
              Start building your career data
            </h3>
            <p className="text-xs text-[#5C5A78] max-w-sm leading-relaxed mb-6">
              Take assessments, define curriculum roadmaps, and search vacancies to compile live career analytics dashboard trends.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="space-y-6"
          >
            {/* Stats indicators grid (4 columns) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Overall Score */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">Overall Score</span>
                <span className="text-2xl font-black text-white font-mono mt-2 group-hover:text-cyan-400 transition-colors">
                  {stats.overallScore}
                </span>
                <div className="absolute right-3 bottom-3 text-cyan-500/25">
                  <HugeiconsIcon icon={SparklesIcon} className="size-6" />
                </div>
              </div>

              {/* Stat 2: Cohort percentile standing */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">Standing</span>
                <span className="text-2xl font-black text-white font-mono mt-2 group-hover:text-violet-400 transition-colors">
                  {stats.standing}
                </span>
                <div className="absolute right-3 bottom-3 text-[#A78BFA]/25">
                  <HugeiconsIcon icon={StarIcon} className="size-6" />
                </div>
              </div>

              {/* Stat 3: Skills Improved */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">Skills Improved</span>
                <span className="text-2xl font-black text-white font-mono mt-2 group-hover:text-emerald-400 transition-colors">
                  {stats.skillsImproved}
                </span>
                <div className="absolute right-3 bottom-3 text-emerald-500/25">
                  <HugeiconsIcon icon={Award01Icon} className="size-6" />
                </div>
              </div>

              {/* Stat 4: Applied Jobs */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col justify-between shadow-md relative overflow-hidden group">
                <span className="text-[10px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">Applied Jobs</span>
                <span className="text-2xl font-black text-white font-mono mt-2 group-hover:text-amber-400 transition-colors">
                  {stats.appliedCount}
                </span>
                <div className="absolute right-3 bottom-3 text-amber-500/25">
                  <HugeiconsIcon icon={Task02Icon} className="size-6" />
                </div>
              </div>
            </div>

            {/* Sub-tab analytics views */}
            <AnalyticsTabs data={filteredDashboard} applications={filteredApplications} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
