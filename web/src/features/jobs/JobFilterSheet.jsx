import React, { useState, useEffect } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';

import SalarySlider from './SalarySlider';
import CategoryCheckbox from './CategoryCheckbox';

const CATEGORY_OPTIONS = ['AI', 'Frontend', 'Backend', 'Data', 'Design'];

export default function JobFilterSheet({ isOpen, onClose, filters, onApply, onClear }) {
  // Local state mirrored from active filter parameters
  const [city, setCity] = useState('');
  const [workMode, setWorkMode] = useState('all');
  const [jobType, setJobType] = useState('all');
  const [salaryRange, setSalaryRange] = useState([5, 50]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Sync state with incoming filters on open
  useEffect(() => {
    if (isOpen && filters) {
      setCity(filters.city || '');
      setWorkMode(filters.workMode || 'all');
      setJobType(filters.jobType || 'all');
      setSalaryRange(filters.salaryRange || [5, 50]);
      setSelectedCategories(filters.categories || []);
    }
  }, [isOpen, filters]);

  const handleApply = (e) => {
    e.preventDefault();
    onApply({
      city,
      workMode,
      jobType,
      salaryRange,
      categories: selectedCategories
    });
    onClose();
  };

  const handleClear = () => {
    setCity('');
    setWorkMode('all');
    setJobType('all');
    setSalaryRange([5, 50]);
    setSelectedCategories([]);
    onClear();
    onClose();
  };

  const toggleCategory = (cat, checked) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, cat]);
    } else {
      setSelectedCategories((prev) => prev.filter((item) => item !== cat));
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-[#0c0b14]/95 border-l border-white/10 text-white flex flex-col justify-between p-0 backdrop-blur-2xl">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <SheetHeader className="border-b border-white/5 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg">
                <HugeiconsIcon icon={FilterIcon} className="size-4.5 text-[#22D3EE]" />
              </span>
              <SheetTitle className="text-white text-sm font-extrabold font-mono uppercase tracking-wider">
                Filter Opportunities
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-[#9D99B8]">
              Refine your job marketplace matches.
            </SheetDescription>
          </SheetHeader>

          {/* Form */}
          <form onSubmit={handleApply} className="p-6 space-y-6">
            
            {/* City search */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Target Location (City)
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad, Bangalore, Remote..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-medium text-xs focus:border-violet-500 focus:outline-none transition-all placeholder:text-[#5C5A78]"
              />
            </div>

            {/* Work Mode radio group */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Work Mode Preference
              </label>
              
              <RadioGroup value={workMode} onValueChange={setWorkMode} className="grid grid-cols-1 gap-2.5">
                {[
                  { value: 'all', label: 'All Modes' },
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'onsite', label: 'On-site' }
                ].map((opt) => (
                  <div 
                    key={opt.value} 
                    onClick={() => setWorkMode(opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      workMode === opt.value
                        ? 'bg-violet-500/10 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                        : 'bg-white/5 border-white/5 text-[#A2A0C2] hover:text-white'
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={`mode-${opt.value}`} className="sr-only" />
                    <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                      workMode === opt.value ? 'border-[#22D3EE]' : 'border-white/20'
                    }`}>
                      {workMode === opt.value && <div className="size-2 rounded-full bg-[#22D3EE]" />}
                    </div>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Salary slider */}
            <div className="py-2 border-t border-white/5 pt-4">
              <SalarySlider value={salaryRange} onChange={setSalaryRange} />
            </div>

            {/* Job Type filter */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Employment Type
              </label>
              
              <RadioGroup value={jobType} onValueChange={setJobType} className="grid grid-cols-1 gap-2.5">
                {[
                  { value: 'all', label: 'All Types' },
                  { value: 'fulltime', label: 'Full-time' },
                  { value: 'parttime', label: 'Part-time' },
                  { value: 'internship', label: 'Internship' },
                  { value: 'contract', label: 'Contract' }
                ].map((opt) => (
                  <div 
                    key={opt.value} 
                    onClick={() => setJobType(opt.value)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all ${
                      jobType === opt.value
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'bg-white/5 border-white/5 text-[#A2A0C2] hover:text-white'
                    }`}
                  >
                    <RadioGroupItem value={opt.value} id={`type-${opt.value}`} className="sr-only" />
                    <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                      jobType === opt.value ? 'border-emerald-400' : 'border-white/20'
                    }`}>
                      {jobType === opt.value && <div className="size-2 rounded-full bg-emerald-400" />}
                    </div>
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Technical categories checkboxes */}
            <div className="space-y-2.5 border-t border-white/5 pt-4">
              <label className="text-[10px] font-bold font-mono text-[#5C5A78] uppercase tracking-widest block">
                Technical Fields
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <CategoryCheckbox
                    key={cat}
                    label={cat}
                    checked={selectedCategories.includes(cat)}
                    onChange={(checked) => toggleCategory(cat, checked)}
                  />
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Footer actions */}
        <SheetFooter className="border-t border-white/5 p-6 flex flex-row gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] font-semibold text-xs transition-all cursor-pointer select-none text-center"
          >
            Clear All
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
