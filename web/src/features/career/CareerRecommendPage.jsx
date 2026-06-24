import React, { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, RefreshIcon } from '@hugeicons/core-free-icons';

import { generateRecommendations } from './careerRecommend.api';
import { getCareersList } from './careerPath.api';
import AIThinkingLoader from './AIThinkingLoader';
import RecommendationCard from './RecommendationCard';
import { Spinner } from '@/components/ui/spinner';

export default function CareerRecommendPage() {
  const navigate = useNavigate();

  // 1. Fetch careers list for taxonomy matching (acquired vs missing skills)
  const { data: careersList = [] } = useQuery({
    queryKey: ['careersList'],
    queryFn: () => getCareersList()
  });

  // 2. Recommendations trigger mutation
  const mutation = useMutation({
    mutationKey: ['recommendationsTrigger'],
    mutationFn: (force) => generateRecommendations(force)
  });

  // Trigger on mount
  useEffect(() => {
    mutation.mutate(false); // Fetch cached recommendations first
  }, []);

  const handleRegenerate = () => {
    if (mutation.isPending) return;
    mutation.mutate(true); // Force re-calculate recommendations
  };

  const recommendations = mutation.data?.careers || [];
  const isLoading = mutation.isPending;

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 select-none overflow-hidden pb-12">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Page Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-violet-400 font-medium text-xs tracking-wider uppercase font-mono">
            <HugeiconsIcon icon={SparklesIcon} className="size-4 animate-pulse" />
            <span>AI Personal Strategist</span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Your AI Career Recommendations
          </h1>
          <p className="text-xs md:text-sm text-[#9D99B8]">
            Top career paths selected based on your profile.
          </p>
        </div>

        {/* Action Button */}
        {recommendations.length > 0 && !isLoading && (
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50 select-none"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-4 text-violet-400" />
            <span>Generate Again</span>
          </button>
        )}
      </div>

      {/* Main Viewport Grid */}
      <div className="relative z-10 flex-grow flex flex-col justify-center min-h-[350px]">
        {isLoading ? (
          <AIThinkingLoader />
        ) : recommendations.length === 0 ? (
          <div className="w-full max-w-md mx-auto text-center border border-white/5 bg-[#161525]/20 rounded-3xl p-8 flex flex-col items-center gap-4">
            <span className="p-4 bg-white/[0.02] border border-white/5 rounded-full text-[#5C5A78]">
              <HugeiconsIcon icon={SparklesIcon} className="size-8 animate-pulse" />
            </span>
            <h3 className="text-lg font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Complete your profile to unlock recommendations
            </h3>
            <p className="text-xs text-[#9D99B8] leading-relaxed">
              Add skills and career interests to allow the AI strategist to calculate matching roles.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              Update Profile
            </button>
          </div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.12 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
          >
            {recommendations.slice(0, 5).map((rec) => (
              <RecommendationCard
                key={`rec-${rec.career_id}-${rec.rank}`}
                recommendation={rec}
                careersList={careersList}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
