import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, RouteIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import { getCareerDetails, getCareerGraph, getCareersList } from './careerPath.api';
import CareerGraph from './CareerGraph';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CareerPathPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Selected state for current role
  const [fromRole, setFromRole] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // 1. Fetch Target Career detail
  const { data: targetCareer, isLoading: isTargetLoading } = useQuery({
    queryKey: ['careerDetails', slug],
    queryFn: () => getCareerDetails(slug),
    enabled: !!slug
  });

  // 2. Fetch list of all careers to populate selectors
  const { data: careersList = [], isLoading: isCareersListLoading } = useQuery({
    queryKey: ['careersList'],
    queryFn: () => getCareersList()
  });

  // Set default current role based on user preference or list
  useEffect(() => {
    if (careersList.length > 0 && !fromRole) {
      const targetTitle = targetCareer?.title || '';
      const fallback = careersList.find((c) => c.title !== targetTitle);
      if (fallback) {
        setFromRole(fallback.title);
      } else {
        setFromRole(careersList[0].title);
      }
    }
  }, [careersList, targetCareer, fromRole]);

  // 3. Fetch transition graph path
  const targetTitle = targetCareer?.title || '';
  const { data: graphData, isLoading: isGraphLoading, isError } = useQuery({
    queryKey: ['careerGraph', fromRole, targetTitle],
    queryFn: () => getCareerGraph(fromRole, targetTitle),
    enabled: !!fromRole && !!targetTitle && fromRole !== targetTitle
  });

  const isLoading = isTargetLoading || isCareersListLoading || (isGraphLoading && fromRole !== targetTitle);

  // If roles match, path is just a single step
  const path = fromRole === targetTitle
    ? [targetTitle]
    : graphData?.path || [];

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 select-none overflow-hidden pb-12">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Page Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <button
            onClick={() => navigate(`/careers/${slug}`)}
            className="flex items-center gap-1 text-xs font-bold text-[#9D99B8] hover:text-white transition-all cursor-pointer mb-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>Back to Career Details</span>
          </button>
          <h1
            className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Your Career Transition Path
          </h1>
          <p className="text-xs md:text-sm text-[#9D99B8] max-w-2xl">
            AI-generated transition roadmap from your current role to your target career.
          </p>
        </div>
      </div>

      {/* Role selector panel */}
      <div className="relative z-10 bg-[#161525]/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* From role */}
          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 md:flex-initial">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#5C5A78]">
              Current Role
            </span>
            <div className="flex items-center gap-2">
              {!isCustomMode ? (
                <>
                  <Select value={fromRole} onValueChange={(val) => setFromRole(val)}>
                    <SelectTrigger size="custom" className="w-[180px] sm:w-[220px] h-10 bg-white/5 border-white/10 text-white rounded-xl px-4 text-xs font-semibold hover:bg-white/[0.08] focus:border-violet-500/50 cursor-pointer border flex items-center justify-between">
                      <SelectValue placeholder="Select current role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#12111d] border border-white/10 text-white shadow-2xl rounded-xl">
                      {careersList.map((c) => (
                        <SelectItem 
                          key={`from-${c.career_id}`} 
                          value={c.title}
                          className="hover:bg-white/5 focus:bg-white/5 focus:text-white rounded-lg text-xs"
                        >
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <button
                    onClick={() => {
                      setIsCustomMode(true);
                      setFromRole('');
                    }}
                    className="h-10 px-4 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-cyan-500/5 border border-violet-500/25 hover:border-violet-500/50 text-[#A78BFA] hover:text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.1)] hover:shadow-[0_0_18px_rgba(139,92,246,0.25)]"
                    title="Enter custom career role with AI"
                  >
                    <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-[#22D3EE] animate-pulse" />
                    <span>Custom AI</span>
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g. Graphic Designer"
                    className="w-[160px] sm:w-[200px] h-10 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-xl px-4 focus:border-violet-500/50 focus:outline-none flex items-center"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customRoleInput.trim()) {
                        setFromRole(customRoleInput.trim());
                      }
                    }}
                  />
                  
                  <button
                    onClick={() => {
                      if (customRoleInput.trim()) {
                        setFromRole(customRoleInput.trim());
                      } else {
                        toast.error('Please enter a role title first.');
                      }
                    }}
                    className="h-10 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.2)] hover:shadow-[0_0_18px_rgba(139,92,246,0.35)] shrink-0"
                  >
                    <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-[#22D3EE]" />
                    <span>Generate</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsCustomMode(false);
                      setCustomRoleInput('');
                      if (careersList.length > 0) {
                        const targetTitle = targetCareer?.title || '';
                        const fallback = careersList.find((c) => c.title !== targetTitle);
                        setFromRole(fallback ? fallback.title : careersList[0].title);
                      }
                    }}
                    className="h-10 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-[#A2A0C2] rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer shrink-0"
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="text-[#5C5A78] font-bold text-xs pt-4 hidden md:block">→</div>

          {/* To role (disabled / locked to target career) */}
          <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 md:flex-initial">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#5C5A78]">
              Target Role
            </span>
            <div className="w-[180px] sm:w-[220px] h-10 flex items-center bg-white/[0.02] border border-white/5 rounded-xl px-4 text-xs text-cyan-400 font-semibold select-none truncate">
              {targetCareer?.title || 'Loading Target Career...'}
            </div>
          </div>
        </div>

        {/* Dynamic metadata metrics */}
        <div className="flex items-center gap-6 shrink-0 select-none border-t border-white/5 md:border-none w-full md:w-auto pt-4 md:pt-0">
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#5C5A78]">
              Transitions
            </div>
            <div className="text-xl font-black text-white font-mono leading-none">
              {path.length > 1 ? `${path.length - 1} Hops` : '0 Hops'}
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#5C5A78]">
              Fit Score
            </div>
            <div className="text-xl font-black text-cyan-400 font-mono leading-none">
              {targetCareer?.fit_score || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="relative z-10 flex-1 w-full min-h-[460px] flex flex-col justify-center">
        {isLoading ? (
          <div className="w-full h-[460px] bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col gap-6 items-center justify-center">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <div className="flex items-center gap-12 w-full max-w-2xl justify-center">
              <Skeleton className="h-28 w-48 bg-white/5 rounded-2xl" />
              <Skeleton className="h-2 w-24 bg-white/5" />
              <Skeleton className="h-28 w-48 bg-white/5 rounded-2xl" />
            </div>
          </div>
        ) : path.length === 0 || isError ? (
          <div className="w-full h-[460px] bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
            <span className="p-4 bg-white/[0.02] border border-white/5 rounded-full text-[#5C5A78] mb-4">
              <HugeiconsIcon icon={RouteIcon} className="size-8" />
            </span>
            <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              No transition path exists
            </h3>
            <p className="text-xs text-[#9D99B8] max-w-sm mb-6">
              The AI was unable to map a direct path between these roles. Try selecting a different starting role.
            </p>
          </div>
        ) : (
          <CareerGraph path={path} careersList={careersList} />
        )}
      </div>
    </div>
  );
}
