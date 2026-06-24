import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SUGGESTED_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'Machine Learning',
  'Data Analysis',
  'Figma',
  'UI/UX Design',
  'Product Strategy',
  'SQL',
  'TypeScript',
  'Growth Marketing',
  'Business Analysis',
];

export default function ProfileStep({ control, errors, isPending }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Career Interest (Select) */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="careerInterest" className="text-[#EEEAF8] text-xs font-semibold">
          Career Goal
        </Label>
        <motion.div
          animate={errors.careerInterest ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Controller
            name="careerInterest"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                <SelectTrigger className="!w-full !h-11 !px-4 !text-xs flex items-center justify-between gap-2 bg-[#161525] text-[#EEEAF8] border-white/10 rounded-xl focus:border-[#8B5CF6] [&>svg]:size-4">
                  <SelectValue placeholder="Select your career goal" />
                </SelectTrigger>
                <SelectContent className="bg-[#11101E] border-white/10 text-[#EEEAF8]">
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </motion.div>
        <AnimatePresence>
          {errors.careerInterest && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.careerInterest.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Experience Level (Radio Cards) */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#EEEAF8] text-xs font-semibold">
          Experience Level
        </Label>
        <motion.div
          animate={errors.experienceLevel ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Controller
            name="experienceLevel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Professional'].map((level) => {
                  const isSelected = field.value === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={isPending}
                      onClick={() => field.onChange(level)}
                      className={`flex flex-col items-center justify-center h-10 rounded-xl border text-center transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none ${
                        isSelected
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-[0_0_15px_rgba(139,92,246,0.2)] text-[#EEEAF8]'
                          : 'border-white/5 bg-[#161525] text-[#5C5A78] hover:border-white/10 hover:text-[#9D99B8]'
                      }`}
                    >
                      <span className="text-xs font-semibold">{level}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </motion.div>
        <AnimatePresence>
          {errors.experienceLevel && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.experienceLevel.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Skills (Multi-select Chips) */}
      <div className="flex flex-col gap-1">
        <Label className="text-[#EEEAF8] text-xs font-semibold">
          Skills
        </Label>
        <motion.div
          animate={errors.skills ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Controller
            name="skills"
            control={control}
            render={({ field }) => {
              const selectedSkills = field.value || [];
              const toggleSkill = (skill) => {
                if (selectedSkills.includes(skill)) {
                  field.onChange(selectedSkills.filter((s) => s !== skill));
                } else {
                  field.onChange([...selectedSkills, skill]);
                }
              };

              return (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 border border-white/5 rounded-xl bg-[#11101E]/50">
                  {SUGGESTED_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={isPending}
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-violet-500/20 border-violet-400 text-[#EEEAF8] shadow-[0_0_10px_rgba(139,92,246,0.15)]'
                            : 'bg-[#161525] border-white/5 text-[#9D99B8] hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>
              );
            }}
          />
        </motion.div>
        <AnimatePresence>
          {errors.skills && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.skills.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Bio (Textarea) */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="bio" className="text-[#EEEAF8] text-xs font-semibold">
          Bio
        </Label>
        <motion.div
          animate={errors.bio ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Textarea
            id="bio"
            placeholder="Tell AI about your goals..."
            disabled={isPending}
            className={`w-full min-h-14 bg-[#161525] text-[#EEEAF8] placeholder:text-[#5C5A78] rounded-xl border transition-all duration-200 outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-[#8B5CF6]/30 ${
              errors.bio
                ? 'border-[#F43F5E] focus-visible:border-[#F43F5E]'
                : 'border-white/10 focus-visible:border-[#8B5CF6] focus:border-[#8B5CF6]'
            }`}
            {...control.register('bio')}
          />
        </motion.div>
        <AnimatePresence>
          {errors.bio && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-[#F43F5E] font-medium mt-1"
            >
              {errors.bio.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
