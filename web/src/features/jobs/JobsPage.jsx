import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Briefcase01Icon, FilterIcon, SearchIcon, SparklesIcon, RefreshIcon } from '@hugeicons/core-free-icons';

import { getJobs, getJobApplications, getSemanticMatches, saveJob, unsaveJob, syncJobs } from './jobs.api';
import JobTabs from './JobTabs';
import JobSearch from './JobSearch';
import JobCard from './JobCard';
import JobFilterSheet from './JobFilterSheet';
import useAuthStore from '@/stores/authStore';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state parameters from URL search queries
  const activeTab = searchParams.get('tab') || 'all';
  const searchVal = searchParams.get('search') || '';
  const cityVal = searchParams.get('city') || '';
  const workModeVal = searchParams.get('mode') || 'all';
  const jobTypeVal = searchParams.get('jtype') || 'all';
  const salaryMinVal = parseInt(searchParams.get('salMin') || '5');
  const salaryMaxVal = parseInt(searchParams.get('salMax') || '50');
  const categoriesVal = searchParams.get('cats') ? searchParams.get('cats').split(',') : [];

  // 1. Fetch AI semantic match scores
  const { data: matchData } = useQuery({
    queryKey: ['semanticMatches'],
    queryFn: getSemanticMatches
  });

  const matchScoresMap = matchData?.match_scores || {};

  // 2. Fetch Job listings based on active tab
  // Tab 1: All active jobs (Infinite Query)
  const {
    data: allJobsPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isAllJobsLoading,
  } = useInfiniteQuery({
    queryKey: ['allJobs', { city: cityVal, workMode: workModeVal, jobType: jobTypeVal }],
    queryFn: ({ pageParam = 1 }) => getJobs({
      city: cityVal,
      workMode: workModeVal,
      jobType: jobTypeVal,
      page: pageParam,
      limit: 10
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((acc, p) => acc + p.items.length, 0);
      if (fetchedCount < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: activeTab === 'all'
  });

  // Tab 2 & 3: Saved & Applied jobs (Standard pagination list)
  const { data: userApplicationsData, isLoading: isApplicationsLoading } = useQuery({
    queryKey: ['userApplications', activeTab],
    queryFn: () => getJobApplications({ status: activeTab }),
    enabled: activeTab !== 'all'
  });

  // 3. Mutation: Save / Unsave bookmark toggle
  const saveMutation = useMutation({
    mutationFn: ({ id, save }) => (save ? saveJob(id) : unsaveJob(id)),
    onSuccess: (_, variables) => {
      toast.success(variables.save ? 'Opportunity saved!' : 'Bookmark removed.');
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
    },
    onError: () => {
      toast.error('Failed to sync bookmark action.');
    }
  });

  const handleSaveToggle = (jobId, shouldSave) => {
    saveMutation.mutate({ id: jobId, save: shouldSave });
  };

  const syncMutation = useMutation({
    mutationFn: (source) => syncJobs(source),
    onSuccess: (data) => {
      toast.success(data.message || 'Job synchronization started in background.');
      queryClient.invalidateQueries({ queryKey: ['allJobs'] });
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || 'Failed to trigger job synchronization.';
      toast.error(errorMsg);
    }
  });

  const handleSyncTrigger = () => {
    syncMutation.mutate('all');
  };

  // URL state modifiers
  const handleTabChange = (tabValue) => {
    setSearchParams((prev) => {
      prev.set('tab', tabValue);
      return prev;
    });
  };

  const handleSearchChange = (val) => {
    setSearchParams((prev) => {
      if (val) prev.set('search', val);
      else prev.delete('search');
      return prev;
    });
  };

  const handleApplyFilters = (filters) => {
    setSearchParams((prev) => {
      if (filters.city) prev.set('city', filters.city);
      else prev.delete('city');

      if (filters.workMode !== 'all') prev.set('mode', filters.workMode);
      else prev.delete('mode');

      if (filters.jobType !== 'all') prev.set('jtype', filters.jobType);
      else prev.delete('jtype');

      prev.set('salMin', filters.salaryRange[0].toString());
      prev.set('salMax', filters.salaryRange[1].toString());

      if (filters.categories.length > 0) prev.set('cats', filters.categories.join(','));
      else prev.delete('cats');

      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchParams((prev) => {
      prev.delete('city');
      prev.delete('mode');
      prev.delete('jtype');
      prev.delete('salMin');
      prev.delete('salMax');
      prev.delete('cats');
      return prev;
    });
  };

  // Client-side local filtering (combines keyword search, salary checks, and category filter parameters)
  const resolvedList = useMemo(() => {
    let rawList = [];
    if (activeTab === 'all') {
      rawList = allJobsPages?.pages?.flatMap((page) => page.items) || [];
    } else {
      rawList = userApplicationsData?.items || [];
    }

    // Apply client filters dynamically
    return rawList.filter((item) => {
      // 1. Text Search matching title, company, skills, location, or work mode
      if (searchVal) {
        const query = searchVal.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesCompany = item.company_name?.toLowerCase().includes(query);
        const matchesSkills = item.required_skills_json?.some((s) => s.toLowerCase().includes(query));
        const matchesLocation = item.location_city?.toLowerCase().includes(query);
        const matchesMode = item.work_mode?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesLocation && !matchesMode) return false;
      }

      // 2. Salary range checks (Lakhs translation: e.g. salary range slider 15L means ₹1500000)
      if (item.salary_min !== undefined && item.salary_min !== null) {
        const minL = item.salary_min / 100000;
        const maxL = (item.salary_max || item.salary_min) / 100000;
        if (minL < salaryMinVal || maxL > salaryMaxVal) return false;
      }

      // 3. Category matching (checks if job title or categories match)
      if (categoriesVal.length > 0) {
        const titleLower = item.title?.toLowerCase() || '';
        const matchesCategory = categoriesVal.some((cat) => {
          const c = cat.toLowerCase();
          if (c === 'ai' && (titleLower.includes('ai') || titleLower.includes('machine learning') || titleLower.includes('intelligence') || titleLower.includes('deep learning'))) return true;
          if (c === 'frontend' && (titleLower.includes('frontend') || titleLower.includes('react') || titleLower.includes('javascript') || titleLower.includes('ui'))) return true;
          if (c === 'backend' && (titleLower.includes('backend') || titleLower.includes('node') || titleLower.includes('python') || titleLower.includes('api'))) return true;
          if (c === 'data' && (titleLower.includes('data') || titleLower.includes('analyst') || titleLower.includes('science'))) return true;
          if (c === 'design' && (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui/ux'))) return true;
          return false;
        });
        if (!matchesCategory) return false;
      }

      return true;
    });
  }, [activeTab, allJobsPages, userApplicationsData, searchVal, salaryMinVal, salaryMaxVal, categoriesVal]);

  // Count active filters for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (cityVal) count++;
    if (workModeVal !== 'all') count++;
    if (jobTypeVal !== 'all') count++;
    if (salaryMinVal !== 5 || salaryMaxVal !== 50) count++;
    if (categoriesVal.length > 0) count++;
    return count;
  }, [cityVal, workModeVal, jobTypeVal, salaryMinVal, salaryMaxVal, categoriesVal]);

  // Loading skeletons
  const isTabLoading = activeTab === 'all' ? isAllJobsLoading : isApplicationsLoading;

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 md:p-6 flex flex-col justify-between h-56 animate-pulse select-none">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="size-12 rounded-xl bg-white/5" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
            </div>
            <div className="size-10 rounded-xl bg-white/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-white/5 rounded" />
            <div className="h-5 w-20 bg-white/5 rounded" />
          </div>
          <div className="border-t border-white/5 pt-4 flex justify-between">
            <div className="h-4 w-20 bg-white/5 rounded" />
            <div className="h-8 w-24 bg-white/10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
      
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[45%] h-[45%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Header section with hero glass card */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="space-y-2 relative z-10 text-center sm:text-left">
          <span className="text-[10px] font-bold font-mono text-[#A2A0C2] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-violet-400 animate-pulse" />
            <span>AI Job Matchmaker</span>
          </span>
          <h1
            className="text-2xl md:text-3xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Job Board
          </h1>
          <p className="text-xs text-[#A2A0C2] max-w-xl leading-relaxed">
            AI-matched job opportunities dynamically calibrated based on your current skill sets and roadmap trajectory.
          </p>
        </div>

      </header>

      {/* Tab controls */}
      <section className="relative z-10 w-full">
        <JobTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </section>

      {/* Search & Filter Toolbar */}
      <section className="relative z-10 w-full flex flex-col md:flex-row items-center gap-4">
        <JobSearch
          search={searchVal}
          onSearchChange={handleSearchChange}
          onFilterOpen={() => setIsFilterOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />
      </section>

      {/* Job Feed Lists */}
      <main className="relative z-10 flex-grow">
        {isTabLoading ? (
          renderSkeletons()
        ) : resolvedList.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto gap-4 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <span className="p-4 bg-white/[0.02] border border-white/5 rounded-full text-[#5C5A78]">
              <HugeiconsIcon icon={Briefcase01Icon} className="size-8 text-[#22D3EE] animate-pulse" />
            </span>
            <h3 className="text-base font-bold text-white leading-none">
              No opportunities found
            </h3>
            <p className="text-xs text-[#9D99B8] leading-relaxed">
              Try updating search tags, clearing filters, or switching feed tabs.
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Animating Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {resolvedList.map((job) => (
                  <motion.div
                    key={job.job_id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                    className="h-full"
                  >
                    <JobCard
                      job={job}
                      matchScore={matchScoresMap[job.job_id.toString()] || 70}
                      isSaved={job.status === 'saved'}
                      onSaveToggle={handleSaveToggle}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button for Infinite scroll feed */}
            {activeTab === 'all' && hasNextPage && (
              <div className="w-full flex items-center justify-center pt-4">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 text-[#A2A0C2] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 select-none"
                >
                  {isFetchingNextPage ? (
                    <>
                      <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Loading opportunities...</span>
                    </>
                  ) : (
                    <span>Load More Opportunities</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Slide-out Filters sheet drawer */}
      <JobFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={{
          city: cityVal,
          workMode: workModeVal,
          jobType: jobTypeVal,
          salaryRange: [salaryMinVal, salaryMaxVal],
          categories: categoriesVal
        }}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

    </div>
  );
}
