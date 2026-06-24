import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon, SparklesIcon, Loading01Icon, FilterIcon } from '@hugeicons/core-free-icons';

import useDebounce from '@/hooks/useDebounce';
import { getCareers } from './career.api';
import SearchBar from './SearchBar';
import CareerFilterSheet from './CareerFilterSheet';
import CareerCard from './CareerCard';
import CareerListSkeleton from './CareerListSkeleton';

export default function CareerListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL parameters
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || 'All';
  const urlSort = searchParams.get('sort') || 'recommended';

  // Input states
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 300);
  const [category, setCategory] = useState(urlCategory);
  const [sort, setSort] = useState(urlSort);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  // Sync state changes back to URL Search Params
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category && category !== 'All') params.category = category;
    if (sort && sort !== 'recommended') params.sort = sort;
    setSearchParams(params);
  }, [debouncedSearch, category, sort, setSearchParams]);

  // Sync state with URL change (e.g. back navigation or URL modifications)
  useEffect(() => {
    setSearchInput(urlSearch);
    setCategory(urlCategory);
    setSort(urlSort);
  }, [urlSearch, urlCategory, urlSort]);

  // Infinite query for fetching data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['careers', debouncedSearch, category, sort],
    queryFn: ({ pageParam = 1 }) =>
      getCareers({
        page: pageParam,
        limit: 20,
        search: debouncedSearch,
        category,
        sort,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);
      if (totalLoaded < (lastPage.total || 0)) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  // Flatten items for virtualization
  const careers = data ? data.pages.flatMap((page) => page.items || []) : [];

  const parentRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Clear all filters action
  const handleClearFilters = () => {
    setSearchInput('');
    setCategory('All');
    setSort('recommended');
    setSearchParams({});
  };

  return (
    <div className="relative w-full flex flex-col gap-6 select-none">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Header section with hero glass card */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="space-y-2 relative z-10 text-center sm:text-left">
          <span className="text-[10px] font-bold font-mono text-[#A2A0C2] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-violet-400 animate-pulse" />
            <span>AI Career Explorer</span>
          </span>
          <h1
            className="text-2xl md:text-3xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Explore Career Paths
          </h1>
          <p className="text-xs text-[#A2A0C2] max-w-xl leading-relaxed">
            Discover customized career opportunities matched with your skills, interests, and professional aspirations.
          </p>
        </div>
      </header>

      {/* Search and Filters controls - Sticky right under TopBar */}
      <div className="relative sticky top-16 z-20 flex items-center gap-3 bg-[#060608]/90 backdrop-blur-xl py-3.5 border-b border-white/[0.04] -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex-grow">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            isSearching={isFetching && !isFetchingNextPage}
          />
        </div>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className={`h-11 shrink-0 px-4.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
            category !== 'All' || sort !== 'recommended'
              ? 'bg-violet-600/10 border-violet-500/30 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.1)]'
              : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white'
          }`}
        >
          <HugeiconsIcon icon={FilterIcon} className="size-4 shrink-0 text-cyan-400" />
          <span>Filters</span>
          {(category !== 'All' || sort !== 'recommended') && (
            <span className="size-2 rounded-full bg-violet-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Filter Sheet component */}
      <CareerFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        activeCategory={category}
        activeSort={sort}
        onApply={({ category: newCat, sort: newSort }) => {
          setCategory(newCat);
          setSort(newSort);
        }}
        onClear={handleClearFilters}
      />

      {/* Results View */}
      <div className="relative z-10 flex-grow">
        {status === 'pending' && <CareerListSkeleton />}

        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#161525]/20 border border-white/5 rounded-3xl min-h-[300px]">
            <span className="text-rose-400 font-bold mb-2">Failed to load careers</span>
            <span className="text-xs text-[#9D99B8] mb-4">Please check your network and try again.</span>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10"
            >
              Retry Connection
            </button>
          </div>
        )}

        {status === 'success' && (
          <>
            {careers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#161525]/20 border border-white/5 rounded-3xl min-h-[350px]">
                <span className="p-4 bg-white/[0.02] border border-white/5 rounded-full text-[#5C5A78] mb-4">
                  <HugeiconsIcon icon={SearchIcon} className="size-8" />
                </span>
                <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  No career paths found
                </h3>
                <p className="text-xs text-[#9D99B8] max-w-sm mb-6">
                  Try adjusting your filters or searching for different keywords.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                  {careers.map((career) => (
                    <CareerCard key={career.career_id} career={career} />
                  ))}
                </div>

                {/* Infinite scroll sentinel trigger node */}
                <div ref={observerRef} className="h-10 w-full pointer-events-none" />

                {/* Infinite loading next page indicator */}
                {isFetchingNextPage && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#161525] border border-violet-500/20 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.15)] z-20 select-none">
                    <HugeiconsIcon icon={Loading01Icon} className="size-4 text-violet-400 animate-spin" />
                    <span className="text-[10px] font-bold text-[#A78BFA] uppercase tracking-wider font-mono">
                      Analyzing more careers...
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
