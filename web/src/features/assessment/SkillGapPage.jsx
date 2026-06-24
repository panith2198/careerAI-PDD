import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  CheckmarkCircle02Icon, 
  Alert02Icon,
  Book02Icon,
  BrainIcon
} from '@hugeicons/core-free-icons';

import { getAssessmentHistory } from './assessment.api';
import SkillGapItem from './SkillGapItem';

// Helper function to enrich database skill gaps with realistic detail benchmarks
const enrichGapSkills = (missingSkills = [], assessmentTitle = '', score = 0) => {
  const titleLower = (assessmentTitle || '').toLowerCase();
  let skillsList = [...missingSkills];

  // Fallback: If list is empty but score is below 100%, suggest topic categories based on name context
  if (skillsList.length === 0 && score < 100) {
    if (titleLower.includes('kotlin')) {
      skillsList = [
        { skill_name: 'Kotlin Coroutines & Async Flow', recommended_focus: 'Concurrency & Threading' },
        { skill_name: 'Kotlin Generics & Reified Types', recommended_focus: 'Advanced type parameters representation' },
        { skill_name: 'Kotlin Null Safety Contracts', recommended_focus: 'Handling boundary reference checks' }
      ];
    } else if (titleLower.includes('architecture') || titleLower.includes('components')) {
      skillsList = [
        { skill_name: 'Jetpack Lifecycle & LiveData', recommended_focus: 'Lifecycle-aware data caches' },
        { skill_name: 'Room Database & SQL Caching', recommended_focus: 'Local caching and repositories' },
        { skill_name: 'Jetpack Navigation & Deep Links', recommended_focus: 'Transition routes configuration' }
      ];
    } else if (titleLower.includes('compose') || titleLower.includes('layouts')) {
      skillsList = [
        { skill_name: 'Compose State Hoisting', recommended_focus: 'Recompositions and remember keys' },
        { skill_name: 'Custom Modifiers & Graphics', recommended_focus: 'Canvas overrides and bounds layouts' },
        { skill_name: 'Compose Performance Analysis', recommended_focus: 'Stability inspection guides' }
      ];
    } else if (titleLower.includes('data') || titleLower.includes('python')) {
      skillsList = [
        { skill_name: 'Pandas Vectorization Operations', recommended_focus: 'Fast dataset analysis & merges' },
        { skill_name: 'Statistical Model Optimization', recommended_focus: 'Linear regression & hypothesis testing' },
        { skill_name: 'SQL Advanced Window Queries', recommended_focus: 'Analytics query filters and groupings' }
      ];
    } else {
      skillsList = [
        { skill_name: 'Performance Optimization', recommended_focus: 'Memory management and bounds checking' },
        { skill_name: 'Unit & Integration Testing', recommended_focus: 'Validation assertions frameworks' },
        { skill_name: 'System Design Patterns', recommended_focus: 'SOLID design principles' }
      ];
    }
  }

  return skillsList.map((skill, index) => {
    // Distribute priorities evenly
    const priorities = ['high', 'medium', 'low'];
    const priority = priorities[index % 3];

    // Align levels realistically relative to score performance
    const current = Math.max(20, Math.round(score * 0.7 - (index * 15)));
    const required = Math.min(95, 80 + (index * 5));

    // Targeted courses based on skill name
    const courses = [
      {
        title: `Ultimate ${skill.skill_name || skill.skill_name} bootcamp`,
        provider: 'Udemy Academic Platform',
        url: 'https://www.udemy.com'
      },
      {
        title: `${skill.skill_name || skill.skill_name} deep-dive tutorial`,
        provider: 'Pluralsight Professional Library',
        url: 'https://www.pluralsight.com'
      }
    ];

    return {
      name: skill.skill_name || skill.skill_name,
      recommendedFocus: skill.recommended_focus || skill.recommendedFocus || 'Skill validation study',
      priority,
      currentLevel: current,
      requiredLevel: required,
      courses
    };
  });
};

export default function SkillGapPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Try reading pre-resolved location state
  const stateResult = location.state?.resultData;

  // 2. Fetch history fallback (page reloads)
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['assessmentResults'],
    queryFn: getAssessmentHistory,
    enabled: !stateResult
  });

  const result = stateResult || historyData?.items?.[0];

  // Resolve and enrich missing competencies
  const rawGaps = result?.gap_analysis?.missing_competencies || [];
  const score = result?.score || 0;
  const enrichedSkills = React.useMemo(() => {
    if (!result) return [];
    return enrichGapSkills(rawGaps, result.title, score);
  }, [result, rawGaps, score]);

  const highPriorityCount = enrichedSkills.filter((s) => s.priority === 'high').length;
  const recommendedCoursesCount = enrichedSkills.length * 2;

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

        {/* Stats Grid Skeleton */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white/5 border border-white/5 rounded-3xl" />
          ))}
        </div>

        {/* Rows List Skeleton */}
        <div className="w-full max-w-7xl space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 border border-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 select-none">
        <h3 className="text-xl font-bold text-white mb-2">No Gap Analysis Found</h3>
        <p className="text-sm text-[#9D99B8] max-w-xs mb-6">
          We couldn't locate the details of this assessment session's gaps analysis.
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

  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        ease: 'easeOut'
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
      {/* Background neon glows and tech overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[45%] h-[45%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-7xl mx-auto space-y-8 px-2"
      >
        {/* Header toolbar */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
              Diagnostic Report
            </span>
            <h1 
              className="text-2xl md:text-3xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Your Skill Gap Analysis
            </h1>
            <p className="text-xs text-[#9D99B8]">
              Target role criteria: <span className="text-white font-semibold">{result.title}</span>
            </p>
          </div>

          <button
            onClick={() => navigate(`/assessments/${sessionId}/result`, { state: { resultData: result } })}
            className="w-fit px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20 text-[#A2A0C2] font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>Back to Results</span>
          </button>
        </motion.header>

        {enrichedSkills.length === 0 ? (
          // Empty Success State
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto gap-4 border border-dashed border-emerald-500/20 rounded-3xl bg-emerald-500/[0.01]"
          >
            <span className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8" />
            </span>
            <h3 className="text-base font-bold text-white leading-none">
              Your skills match this career path!
            </h3>
            <p className="text-xs text-[#9D99B8] leading-relaxed">
              Congratulations! Your recent assessment scores meet all the required thresholds for this skill category.
            </p>
            <button
              onClick={() => navigate('/roadmap')}
              className="mt-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              Open Learning Roadmap
            </button>
          </motion.div>
        ) : (
          <>
            {/* Skill Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Missing Count */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300">
                <span className="p-3 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-2xl shrink-0">
                  <HugeiconsIcon icon={BrainIcon} className="size-5 text-[#22D3EE]" />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
                    Skill Discrepancies
                  </span>
                  <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">
                    {enrichedSkills.length} Missing Competencies
                  </h4>
                </div>
              </div>

              {/* Card 2: High Priorities */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group hover:border-rose-500/20 transition-all duration-300">
                <span className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl shrink-0">
                  <HugeiconsIcon icon={Alert02Icon} className="size-5 text-rose-400" />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
                    Urgent Actions
                  </span>
                  <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">
                    {highPriorityCount} High Priority Gaps
                  </h4>
                </div>
              </div>

              {/* Card 3: Recommendations */}
              <div className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <span className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shrink-0">
                  <HugeiconsIcon icon={Book02Icon} className="size-5 text-cyan-400" />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
                    Curriculum Sync
                  </span>
                  <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">
                    {recommendedCoursesCount} Course Recommendations
                  </h4>
                </div>
              </div>
            </motion.div>

            {/* Expandable Gaps list panel */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-mono font-bold text-[#5C5A78] uppercase tracking-wider">
                  Gap Items Checklist
                </h3>
                <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider">
                  Select row to expand details
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {enrichedSkills.map((skill, index) => (
                  <SkillGapItem key={index} skill={skill} />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
