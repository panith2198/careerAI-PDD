import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

import PriorityBadge from './PriorityBadge';
import SkillProgressBar from './SkillProgressBar';
import CourseRecommendation from './CourseRecommendation';

export default function SkillGapItem({ skill }) {
  const [isOpen, setIsOpen] = useState(false);
  const { name, priority, currentLevel, requiredLevel, courses = [] } = skill;

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/15 shadow-[0_12px_24px_rgba(0,0,0,0.25)]">
      {/* Collapsed Header click zone */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {name}
          </h4>
          <PriorityBadge priority={priority} />
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 shrink-0" />
        </motion.div>
      </div>

      {/* Expanded body section */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden border-t border-white/5 bg-white/[0.005]"
          >
            <div className="p-5 space-y-6">
              {/* Level bars grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SkillProgressBar label="Current Proficiency" percentage={currentLevel} color="cyan" />
                <SkillProgressBar label="Required Target" percentage={requiredLevel} color="violet" />
              </div>

              {/* Course suggestions list */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-wider">
                  Targeted Learning Curriculums
                </h5>
                <div className="flex flex-col gap-2.5">
                  {courses.map((course, idx) => (
                    <CourseRecommendation key={idx} course={course} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
