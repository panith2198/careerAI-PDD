import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioGroup } from '@/components/ui/radio-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';

import AnswerOption from './AnswerOption';
import DifficultyBadge from './DifficultyBadge';
import MarkdownRenderer from '@/features/chat/MarkdownRenderer';

export default function QuestionCard({ 
  question, 
  selectedOptionId, 
  onSelect, 
  questionIndex, 
  direction = 1,
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
  nextText,
  saving,
  saveStatus,
  isReadOnly,
  isSubmitting
}) {
  if (!question) return null;

  const { id, text, category, difficulty, options = [] } = question;

  // Slide transition configurations
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[460px] flex flex-col justify-center">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="w-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_30px_70px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle tech background grid pattern inside card */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Badge & Info Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 select-none relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)] px-2.5 py-0.5 text-[10px] font-bold font-mono tracking-wider rounded-full uppercase">
                {category || 'Skills'}
              </span>
              <DifficultyBadge difficulty={difficulty} />
            </div>
            <span className="text-[11px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">
              Item #{questionIndex}
            </span>
          </div>

          {/* Split Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
            {/* Left Column: Question Details & Markdown Preview */}
            <div className="space-y-4 lg:border-r lg:border-white/5 lg:pr-8 min-h-[180px]">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#5C5A78] font-bold block select-none">
                Problem Description
              </span>
              <div className="py-1 prose-sm">
                <MarkdownRenderer content={text} />
              </div>
            </div>

            {/* Right Column: Answers Options List */}
            <div className="space-y-4 w-full">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#5C5A78] font-bold block mb-1 select-none">
                Select Your Answer:
              </span>
              <RadioGroup value={selectedOptionId || ''} onValueChange={onSelect} className="grid grid-cols-1 gap-3.5 w-full">
                {options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  return (
                    <AnswerOption
                      key={option.id}
                      id={option.id}
                      letter={letter}
                      text={option.text}
                      isSelected={selectedOptionId === option.id}
                      onClick={() => onSelect(option.id)}
                    />
                  );
                })}
              </RadioGroup>
            </div>
          </div>

          {/* Footer: Navigation Buttons & Status inside the Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 mt-4 select-none relative z-10 w-full">
            <button
              type="button"
              onClick={onPrevious}
              disabled={isPreviousDisabled}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[#A2A0C2] hover:bg-white/10 hover:text-white hover:border-white/20 transition-all font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              <span>Previous</span>
            </button>

            {/* Status indicator in the center */}
            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.div
                    key="saving"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[11px] font-mono text-cyan-400/80"
                  >
                    <div className="size-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Syncing response...</span>
                  </motion.div>
                ) : saveStatus === 'saved' ? (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold font-mono rounded-full shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-[#10B981]" />
                    <span>Answer saved</span>
                  </motion.div>
                ) : isReadOnly ? (
                  <motion.div
                    key="readonly"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[#5C5A78]"
                  >
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 text-[#5C5A78]" />
                    <span>Viewing history (Read-only)</span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_22px_rgba(139,92,246,0.35)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <span>{nextText}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
