import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCareers } from '@/features/career/career.api';

const SUGGESTED_SKILLS = [
  { id: '1', name: 'Kotlin Programming' },
  { id: '2', name: 'Android Architecture Components' },
  { id: '3', name: 'Jetpack Compose UI' },
  { id: '4', name: 'Python Fundamentals' },
  { id: 'react', name: 'React' },
  { id: 'python', name: 'Python' },
  { id: 'machine-learning', name: 'Machine Learning' },
  { id: 'cloud', name: 'Cloud' },
  { id: 'system-design', name: 'System Design' }
];

export default function AssessmentFilters({
  careerId,
  setCareerId,
  skillId,
  setSkillId,
  search,
  setSearch,
  onClear
}) {
  // Query careers dynamically to match what is available in the database
  const { data: careersData } = useQuery({
    queryKey: ['careers', { limit: 100 }],
    queryFn: () => getCareers({ limit: 100 })
  });
  const careers = careersData?.items || [];

  return (
    <div className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-xl select-none">
      {/* Search Input */}
      <div className="w-full md:w-fit relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments..."
          className="w-full md:w-64 bg-[#161525]/80 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all duration-300"
        />
      </div>

      {/* Select Filter Selectors */}
      <div className="w-full md:w-fit flex flex-col sm:flex-row gap-3 items-center">
        {/* Career Filter */}
        <select
          value={careerId || ''}
          onChange={(e) => setCareerId(e.target.value || null)}
          className="w-full sm:w-48 bg-[#161525]/80 border border-white/10 text-[#EEEAF8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all cursor-pointer"
        >
          <option value="">All Careers</option>
          {careers.map((c) => (
            <option key={c.career_id} value={c.career_id}>
              {c.title}
            </option>
          ))}
        </select>

        {/* Skill Filter */}
        <select
          value={skillId || ''}
          onChange={(e) => setSkillId(e.target.value || null)}
          className="w-full sm:w-48 bg-[#161525]/80 border border-white/10 text-[#EEEAF8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] outline-none transition-all cursor-pointer"
        >
          <option value="">All Skills</option>
          {SUGGESTED_SKILLS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Reset Filter Button */}
        {(careerId || skillId || search) && (
          <button
            onClick={onClear}
            className="w-full sm:w-auto px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
