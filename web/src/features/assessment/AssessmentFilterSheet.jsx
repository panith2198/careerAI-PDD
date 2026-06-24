import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';
import { getCareers } from '@/features/career/career.api';

const SUGGESTED_SKILLS = [
  { id: '', name: 'All Skills' },
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

export default function AssessmentFilterSheet({ 
  isOpen, 
  onClose, 
  activeCareerId, 
  activeSkillId, 
  onApply, 
  onClear 
}) {
  const [localCareerId, setLocalCareerId] = useState(activeCareerId);
  const [localSkillId, setLocalSkillId] = useState(activeSkillId);

  // Dynamic careers query
  const { data: careersData } = useQuery({
    queryKey: ['careers', { limit: 100 }],
    queryFn: () => getCareers({ limit: 100 })
  });
  const careers = careersData?.items || [];

  // Sync state when sheet is opened
  useEffect(() => {
    if (isOpen) {
      setLocalCareerId(activeCareerId);
      setLocalSkillId(activeSkillId);
    }
  }, [isOpen, activeCareerId, activeSkillId]);

  const handleApply = () => {
    onApply({
      careerId: localCareerId,
      skillId: localSkillId
    });
    onClose();
  };

  const handleClear = () => {
    setLocalCareerId('');
    setLocalSkillId('');
    onClear();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#0c0b14]/95 border-l border-white/10 text-white flex flex-col justify-between p-0 backdrop-blur-2xl">
        <div className="flex-grow overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <SheetHeader className="border-b border-white/5 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg">
                <HugeiconsIcon icon={FilterIcon} className="size-4.5 text-[#22D3EE]" />
              </span>
              <SheetTitle className="text-white text-sm font-extrabold font-mono uppercase tracking-wider">
                Filter Assessments
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-[#9D99B8]">
              Refine active skill assessments by career path and core technologies.
            </SheetDescription>
          </SheetHeader>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            
            {/* Career Path Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Target Career Path
              </label>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLocalCareerId('')}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                    localCareerId === ''
                      ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold'
                      : 'bg-white/5 border-white/5 text-[#9D99B8] hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  All Careers
                </button>
                {careers.map((c) => {
                  const isSelected = String(localCareerId) === String(c.career_id);
                  return (
                    <button
                      key={c.career_id}
                      type="button"
                      onClick={() => setLocalCareerId(c.career_id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold'
                          : 'bg-white/5 border-white/5 text-[#9D99B8] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {c.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Skill Filter */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Core Technical Skill
              </label>
              
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.map((sk) => {
                  const isSelected = String(localSkillId) === String(sk.id);
                  return (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => setLocalSkillId(sk.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-500/10 border-violet-500/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold'
                          : 'bg-white/5 border-white/5 text-[#9D99B8] hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {sk.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t border-white/5 p-6 flex flex-row gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] font-semibold text-xs transition-all cursor-pointer select-none text-center"
          >
            Clear Filters
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] text-center cursor-pointer select-none"
          >
            Apply Filters
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
