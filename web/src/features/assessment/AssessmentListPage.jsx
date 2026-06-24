import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon, SparklesIcon, FilterIcon } from '@hugeicons/core-free-icons';

import useDebounce from '@/hooks/useDebounce';
import SearchBar from '@/features/career/SearchBar';
import AssessmentFilterSheet from './AssessmentFilterSheet';
import AssessmentCard from './AssessmentCard';
import { getAssessments, getAssessmentHistory } from './assessment.api';

export default function AssessmentListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse parameters from URL state for persistence
  const careerId = searchParams.get('careerId') || '';
  const skillId = searchParams.get('skillId') || '';
  const urlSearch = searchParams.get('search') || '';

  // Local state for search bar input responsiveness
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync debounced search to URL params
  useEffect(() => {
    setSearchParams((prev) => {
      if (debouncedSearch) prev.set('search', debouncedSearch);
      else prev.delete('search');
      return prev;
    });
  }, [debouncedSearch, setSearchParams]);

  // Sync local input with URL change (back/forward navigation)
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // 1. Fetch assessments list based on career/skill filters
  const { data: assessmentsData, isLoading: isAssessmentsLoading } = useQuery({
    queryKey: ['assessments', { careerId, skillId }],
    queryFn: () => getAssessments({ careerId, skillId })
  });

  // 2. Fetch past results to overlay previous scores
  const { data: resultsData, isLoading: isResultsLoading } = useQuery({
    queryKey: ['assessmentResults'],
    queryFn: getAssessmentHistory
  });

  // Map assessment results to find the highest score for each assessment_id
  const scoresMap = useMemo(() => {
    const map = {};
    if (resultsData?.items) {
      resultsData.items.forEach((res) => {
        const aid = res.assessment_id;
        const score = res.score;
        if (map[aid] === undefined || score > map[aid]) {
          map[aid] = score;
        }
      });
    }
    return map;
  }, [resultsData]);

  // Frontend live-search filtering based on debounced search query
  const assessments = assessmentsData?.items || [];
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const query = debouncedSearch.toLowerCase().trim();
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        (item.career_title || '').toLowerCase().includes(query) ||
        (item.skill_name || '').toLowerCase().includes(query)
      );
    });
  }, [assessments, debouncedSearch]);

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[#161525] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-56 animate-pulse select-none">
          <div>
            <div className="size-11 rounded-xl bg-white/5 mb-4" />
            <div className="h-5 w-2/3 bg-white/10 rounded-md mb-2" />
            <div className="h-3 w-1/3 bg-white/5 rounded-md mb-4" />
            <div className="h-5 w-24 bg-white/5 rounded-full" />
          </div>
          <div className="border-t border-white/5 pt-4">
            <div className="flex gap-4 mb-4">
              <div className="h-3 w-16 bg-white/5 rounded-md" />
              <div className="h-3 w-16 bg-white/5 rounded-md" />
            </div>
            <div className="h-10 w-full bg-white/10 rounded-xl" />
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
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden">
      {/* Sci-Fi Grid overlay and glowing background spheres */}
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
            <span>AI Assessments & Certification</span>
          </span>
          <h1
            className="text-2xl md:text-3xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Skill Certifications
          </h1>
          <p className="text-xs text-[#A2A0C2] max-w-xl leading-relaxed">
            Measure your technical capabilities, earn verified badges, and identify critical growth opportunities relative to target careers.
          </p>
        </div>
      </header>

      {/* Search and Filters controls - Sticky right under TopBar */}
      <div className="relative sticky top-16 z-20 flex items-center gap-3 bg-[#060608]/90 backdrop-blur-xl py-3.5 border-b border-white/[0.04] -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex-grow">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            isSearching={isAssessmentsLoading}
          />
        </div>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className={`h-11 shrink-0 px-4.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            careerId || skillId
              ? 'bg-violet-600/10 border-violet-500/30 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.1)]'
              : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <HugeiconsIcon icon={FilterIcon} className="size-4 shrink-0 text-cyan-400" />
          <span>Filters</span>
          {(careerId || skillId) && (
            <span className="size-2 rounded-full bg-violet-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Filter Sheet component */}
      <AssessmentFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        activeCareerId={careerId}
        activeSkillId={skillId}
        onApply={({ careerId: newCareerId, skillId: newSkillId }) => {
          setSearchParams((prev) => {
            if (newCareerId) prev.set('careerId', newCareerId);
            else prev.delete('careerId');
            
            if (newSkillId) prev.set('skillId', newSkillId);
            else prev.delete('skillId');
            
            return prev;
          });
        }}
        onClear={handleClearFilters}
      />

      {/* Assessment Grid list section */}
      <main className="relative z-10 flex-grow">
        {isAssessmentsLoading || isResultsLoading ? (
          renderSkeletons()
        ) : filteredAssessments.length === 0 ? (
          // Empty Welcome/Search Fail State
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto gap-4 select-none border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <span className="p-4 bg-white/[0.02] border border-white/5 rounded-full text-[#5C5A78]">
              <HugeiconsIcon icon={SearchIcon} className="size-8 text-[#22D3EE] animate-pulse" />
            </span>
            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              No assessments found
            </h3>
            <p className="text-xs text-[#9D99B8] leading-relaxed">
              Try updating or clearing your category and technical skill filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          // Dynamic Stagger Grid List with framer-motion layout morphs
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredAssessments.map((item) => (
                <motion.div
                  key={item.assessment_id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  className="h-full"
                >
                  <AssessmentCard
                    assessment={item}
                    pastScore={scoresMap[item.assessment_id]}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
