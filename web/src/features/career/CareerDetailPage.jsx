import React, { useState, useEffect, useRef } from 'react';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, SparklesIcon } from '@hugeicons/core-free-icons';

import CareerHero from './CareerHero';
import SalaryChart from './SalaryChart';
import SkillGapList from './SkillGapList';
import CareerStats from './CareerStats';
import CareerCTA from './CareerCTA';

export default function CareerDetailPage() {
  const career = useLoaderData();
  const navigate = useNavigate();
  const { slug } = useParams();

  // Scroll triggers for sticky header
  const triggerRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { rootMargin: '-60px 0px 0px 0px', threshold: 0 }
    );
    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }
    return () => {
      if (triggerRef.current) {
        observer.unobserve(triggerRef.current);
      }
    };
  }, []);

  // Framer Motion layout configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col gap-6 select-none pb-12 overflow-hidden">
      {/* Scroll Trigger */}
      <div ref={triggerRef} className="absolute top-0 left-0 w-full h-1 pointer-events-none" />

      {/* Sticky Header */}
      <AnimatePresence>
        {isSticky && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 md:left-64 right-0 h-14 bg-[#060608]/70 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between z-20 select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate('/careers')}
                className="p-1.5 hover:bg-white/5 rounded-lg text-[#9D99B8] hover:text-white transition-all cursor-pointer shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
              </button>
              <h2 className="text-sm font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {career.title}
              </h2>
              <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] text-[9px] font-bold rounded font-mono select-none shrink-0">
                {career.fit_score}% FIT
              </span>
            </div>
            <button
              onClick={() => navigate(`/careers/${slug}/path`)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.25)] hover:shadow-[0_0_15px_rgba(139,92,246,0.35)] shrink-0 cursor-pointer"
            >
              View Path
            </button>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Main Content Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-8 mt-2"
      >
        {/* Navigation / Back links */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <button
            onClick={() => navigate('/careers')}
            className="flex items-center gap-1 text-xs font-bold text-[#9D99B8] hover:text-white transition-all cursor-pointer select-none"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            <span>Back to Explorer</span>
          </button>
        </motion.div>

        {/* 1. Hero Card */}
        <motion.div variants={itemVariants}>
          <CareerHero career={career} />
        </motion.div>

        {/* 2. Stats Grid */}
        <motion.div variants={itemVariants}>
          <CareerStats career={career} />
        </motion.div>

        {/* 3. Middle Section: Salary insights & Skill gaps */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalaryChart career={career} />
          <SkillGapList skills={career.skills} />
        </motion.div>

        {/* 4. Action Center Grid */}
        <motion.div variants={itemVariants}>
          <CareerCTA slug={slug} careerId={career.career_id} />
        </motion.div>
      </motion.div>
    </div>
  );
}
