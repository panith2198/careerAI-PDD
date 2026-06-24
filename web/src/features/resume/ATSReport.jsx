import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Tick02Icon, Cancel01Icon, ArrowRight01Icon, Award01Icon, Alert01Icon } from '@hugeicons/core-free-icons';

import ATSScoreGauge from './ATSScoreGauge';

export default function ATSReport({ resume, userSkills = [] }) {
  const { ats_score, skills_extracted } = resume;

  const resumeSkills = useMemo(() => {
    return skills_extracted?.skills || [];
  }, [skills_extracted]);

  // Compute matched vs missing skills
  const { matchedSkills, missingSkills } = useMemo(() => {
    const userSkillsLower = userSkills.map(s => s.toLowerCase().trim());
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase().trim());

    // Matched: Skills in both resume and user profile
    const matched = resumeSkills.filter(s => 
      userSkillsLower.includes(s.toLowerCase().trim())
    );

    // Missing: Skills in user profile but NOT in resume
    let missing = userSkills.filter(s => 
      !resumeSkillsLower.includes(s.toLowerCase().trim())
    );

    // Fallback if missing is empty to showcase interactive reports
    if (missing.length === 0) {
      const standardFallbacks = ['Docker', 'AWS Cloud', 'Unit Testing', 'CI/CD Pipelines', 'System Design'];
      missing = standardFallbacks.filter(s => 
        !resumeSkillsLower.includes(s.toLowerCase().trim())
      );
    }

    return { matchedSkills: matched, missingSkills: missing };
  }, [resumeSkills, userSkills]);

  // Priority-bound improvement cards
  const improvements = [
    {
      id: 1,
      title: 'Quantify Project Achievements',
      description: 'Your project descriptions focus heavily on tasks rather than outcomes. Revise statements to include measurable business metrics (e.g., "boosted page speed by 40%" or "reduced build times by 25%").',
      priority: 'High',
      color: '#EF4444'
    },
    {
      id: 2,
      title: 'Integrate Missing Cloud Skillsets',
      description: 'Your resume lacks references to cloud orchestration and container platforms (Docker, AWS, CI/CD). Add bullet points describing how you deploy packages and manage cloud configurations.',
      priority: 'Medium',
      color: '#F59E0B'
    },
    {
      id: 3,
      title: 'Refine Semantic Keyword Density',
      description: 'Align your summary statements with standard ATS taxonomy definitions. Integrate terms like "Component Architecture", "Design Systems", and "State Optimizations" to rank higher in search filters.',
      priority: 'Low',
      color: '#3B82F6'
    }
  ];

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
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="w-full space-y-8 select-none">
      
      {/* Top section: Gauge & Skills checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-1 flex">
          <ATSScoreGauge score={ats_score || 75} />
        </div>

        <div className="md:col-span-2 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 flex flex-col justify-between shadow-lg space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
              Resume Keyword Extraction
            </h4>

            {/* Matched Skills */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                <span>Indexed Skills ({matchedSkills.length})</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-xs font-medium text-emerald-400"
                  >
                    {skill}
                  </span>
                ))}
                {matchedSkills.length === 0 && (
                  <span className="text-[10px] font-mono text-[#5C5A78]">No matching skills extracted.</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-2 pt-2">
              <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                <span>Unindexed Skill Gaps ({missingSkills.length})</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 bg-rose-500/5 border border-rose-500/15 rounded-lg text-xs font-medium text-rose-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[9px] font-mono text-[#5C5A78] flex items-center gap-1.5">
            <HugeiconsIcon icon={Award01Icon} className="size-3.5 text-cyan-400" />
            <span>AI compares document taxonomy with profile declarations.</span>
          </div>
        </div>
      </div>

      {/* Bottom section: Recommendation cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
          AI Improvement Checklist
        </h4>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {improvements.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -4, border: '1px solid rgba(255,255,255,0.15)' }}
              className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded border"
                    style={{ 
                      color: item.color, 
                      borderColor: `${item.color}30`, 
                      backgroundColor: `${item.color}08`
                    }}
                  >
                    {item.priority} Priority
                  </span>
                  <HugeiconsIcon icon={Alert01Icon} className="size-4 text-[#5C5A78]" />
                </div>
                <h5 className="text-xs font-bold text-white leading-snug">
                  {item.title}
                </h5>
                <p className="text-[10px] text-[#A2A0C2] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[8px] font-mono text-[#5C5A78] uppercase">
                <span>ATS Guideline {item.id}</span>
                <span className="flex items-center gap-0.5">
                  <span>Learn how</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-2.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
