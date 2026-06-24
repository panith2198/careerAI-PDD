import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { HugeiconsIcon } from '@hugeicons/react';
import { Layers01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import MilestoneCard from './MilestoneCard';

export default function PhaseAccordion({ phase, completedMilestones = [], roadmapId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { phase: phaseNum, weeks, topics = [] } = phase;

  // Resolve localized phase name titles
  const getPhaseName = (num) => {
    if (num === 1) return 'Foundation Curriculum';
    if (num === 2) return 'Specialist Training';
    return 'Mastery & Integration';
  };

  // Calculate completion percentage
  const total = topics.length;
  const completed = topics.filter((t) => completedMilestones.includes(t.topic_id)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="w-full bg-[#161525]/30 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_15px_35px_rgba(0,0,0,0.35)] hover:border-white/15">
        
        {/* Accordion header toggle */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-5 md:p-6 cursor-pointer select-none">
            <div className="flex items-center gap-4 min-w-0">
              {/* Layers icon container */}
              <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                <HugeiconsIcon icon={Layers01Icon} className="size-5 text-[#22D3EE]" />
              </div>

              {/* Title & Duration */}
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-extrabold text-white leading-tight font-sans">
                  {getPhaseName(phaseNum)}
                </h3>
                <span className="text-[10px] font-bold font-mono text-[#A2A0C2] uppercase tracking-wider block mt-0.5">
                  {weeks}
                </span>
              </div>
            </div>

            {/* Progress aggregate */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-xs md:text-sm font-black font-mono text-[#22D3EE]">
                  {percentage}%
                </span>
                <span className="text-[8px] font-mono text-[#5C5A78] uppercase tracking-widest font-bold">
                  Progress
                </span>
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white"
              >
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 shrink-0" />
              </motion.div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Accordion body list */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className="overflow-hidden border-t border-white/5 bg-white/[0.005]"
              >
                <div className="p-5 md:p-6 flex flex-col gap-3">
                  {topics.map((topic) => (
                    <MilestoneCard
                      key={topic.topic_id}
                      milestone={topic}
                      isCompleted={completedMilestones.includes(topic.topic_id)}
                      roadmapId={roadmapId}
                    />
                  ))}
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </div>
    </Collapsible>
  );
}
