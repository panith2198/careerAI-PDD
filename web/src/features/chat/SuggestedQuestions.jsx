import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon } from '@hugeicons/core-free-icons';

const SUGGESTED_QUESTIONS = [
  { label: 'Suggest careers', prompt: 'Which future-ready AI careers best match my profile?' },
  { label: 'Improve my resume', prompt: 'How can I optimize my resume for ATS filters and semantic checks?' },
  { label: 'Create roadmap', prompt: 'Guide me on how to build a week-by-week transition roadmap into DevOps.' },
  { label: 'Find skills to learn', prompt: 'What are the most critical machine learning and data engineering skills to learn today?' },
  { label: 'Interview preparation', prompt: 'Can you help me prepare for a technical interview as an AI architect?' }
];

export default function SuggestedQuestions({ onSelectQuestion }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto my-4 px-4 select-none animate-fadeIn"
    >
      {SUGGESTED_QUESTIONS.map((item, idx) => (
        <motion.button
          key={idx}
          variants={itemVariants}
          onClick={() => onSelectQuestion(item.prompt)}
          className="px-4 py-2 bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/30 text-[#EEEAF8] hover:text-white rounded-full text-xs font-semibold transition-all duration-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] flex items-center gap-1.5 cursor-pointer"
        >
          <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-[#22D3EE]" />
          <span>{item.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
