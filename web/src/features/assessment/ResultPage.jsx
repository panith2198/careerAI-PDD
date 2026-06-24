import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon } from '@hugeicons/core-free-icons';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

import { getAssessmentHistory } from './assessment.api';
import ScoreGauge from './ScoreGauge';
import SkillRadarChart from './SkillRadarChart';
import AIFeedbackCard from './AIFeedbackCard';
import ResultActions from './ResultActions';

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Try reading the state returned from the QuizPage transition (instant)
  const stateResult = location.state?.resultData;

  // 2. Fetch history as a fallback (handles reloads)
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['assessmentResults'],
    queryFn: getAssessmentHistory,
    enabled: !stateResult // only fetch if state was not passed
  });

  // Resolve the current result: either state or the most recent completion record
  const result = stateResult || historyData?.items?.[0];
  const passed = result ? (result.score >= 60) : false;

  // Trigger celebration on load
  useEffect(() => {
    if (result && passed) {
      // Primary confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#8B5CF6', '#22D3EE', '#A78BFA', '#10B981']
      });

      // Staggered secondary micro-bursts for premium feel
      const duration = 1.8 * 1000;
      const animationEnd = Date.now() + duration;
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 20 * (timeLeft / duration);
        confetti({
          particleCount,
          startVelocity: 25,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [result, passed]);

  // Action handlers
  const handleRetake = () => {
    if (result?.assessment_id) {
      navigate(`/assessments/${result.assessment_id}/quiz`);
    } else {
      navigate('/assessments');
    }
  };

  const handleViewRoadmap = () => {
    if (result?.career_id) {
      navigate(`/roadmap?careerId=${result.career_id}`);
    } else {
      navigate('/roadmap');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `AI Assessment Score: ${Math.round(result?.score)}%`,
        text: `I scored ${Math.round(result?.score)}% on the ${result?.title} assessment! Check out CareerAi.`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Result link copied to clipboard!');
    }
  };

  // Loading skeleton screen matching actual layout
  if (isLoading && !stateResult) {
    return (
      <div className="min-h-screen bg-[#060608] text-white p-6 md:p-10 flex flex-col items-center justify-center gap-8 relative select-none">
        <div className="absolute inset-0 bg-[#060608] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none opacity-50" />
        
        {/* Header Skeleton */}
        <div className="w-full max-w-7xl space-y-3 animate-pulse border-b border-white/5 pb-6">
          <div className="h-4 w-32 bg-white/5 rounded-full" />
          <div className="h-8 w-80 bg-white/10 rounded-lg" />
          <div className="h-4.5 w-96 bg-white/5 rounded-md" />
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Score card col */}
          <div className="lg:col-span-5 flex flex-col items-center gap-6 animate-pulse">
            <div className="size-52 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
              <div className="size-36 rounded-full bg-white/10" />
            </div>
            <div className="h-6 w-44 bg-white/5 rounded-full" />
            <div className="h-12 w-full bg-white/5 rounded-2xl mt-4" />
          </div>

          {/* Charts card col */}
          <div className="lg:col-span-7 space-y-6 animate-pulse">
            <div className="h-[320px] bg-white/5 border border-white/5 rounded-3xl" />
            <div className="h-60 bg-white/5 border border-white/5 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 select-none">
        <h3 className="text-xl font-bold text-white mb-2">No Result Found</h3>
        <p className="text-sm text-[#9D99B8] max-w-xs mb-6">
          We couldn't locate the details of this assessment session.
        </p>
        <button
          onClick={() => navigate('/assessments')}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer"
        >
          Return to Explorer
        </button>
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
      {/* Sci-Fi Grid overlays and decorative glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className={`absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full opacity-60 blur-[130px] transition-all duration-1000 ${
          passed ? 'bg-violet-600/10' : 'bg-rose-600/5'
        }`} />
        <div className={`absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full opacity-60 blur-[130px] transition-all duration-1000 ${
          passed ? 'bg-cyan-600/10' : 'bg-amber-600/5'
        }`} />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto space-y-8 px-4 md:px-6"
      >
        {/* Header section card */}
        <motion.header variants={itemVariants} className="space-y-1.5 border-b border-white/5 pb-5 select-none">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
            Analysis Complete
          </span>
          <h1 
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-white"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {result.title}
          </h1>
          <p className="text-xs md:text-sm text-[#9D99B8]">
            Review your dynamic topic scores and custom career developmental recommendations below.
          </p>
        </motion.header>

        {/* Dashboard layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: score, badge, actions */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 w-full shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              {/* Circular Gauge */}
              <ScoreGauge score={result.score} />

              {/* Percentile Pill */}
              <div className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-xs font-bold font-mono text-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                <HugeiconsIcon icon={Award01Icon} className="size-4 text-[#22D3EE] animate-bounce" />
                <span>Top {Math.round(result.percentile_rank || 15)}% of learners</span>
              </div>
            </div>

            {/* Actions tile wrapper */}
            <div className="w-full">
              <ResultActions 
                onRetake={handleRetake} 
                onViewRoadmap={handleViewRoadmap} 
                onShare={handleShare} 
              />
            </div>
          </motion.div>

          {/* Right panel: Radar Chart and markdown diagnostics */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            {/* Radar chart breakdown */}
            <SkillRadarChart title={result.title} score={result.score} />

            {/* AI Advisor Markdown card */}
            <AIFeedbackCard feedback={result.ai_feedback} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
