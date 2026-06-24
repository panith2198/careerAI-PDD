import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  ArrowLeft01Icon, 
  SearchIcon, 
  Cancel01Icon, 
  Award01Icon, 
  Tick02Icon, 
  Add01Icon 
} from '@hugeicons/core-free-icons';

import api from '@/api/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const POPULAR_SKILLS = [
  { skill_id: 1, skill_name: "Python", category: "technical" },
  { skill_id: 2, skill_name: "SQL", category: "technical" },
  { skill_id: 3, skill_name: "Docker", category: "tool" },
  { skill_id: 4, skill_name: "Kubernetes", category: "technical" },
  { skill_id: 5, skill_name: "React", category: "technical" },
  { skill_id: 6, skill_name: "Kotlin", category: "technical" },
  { skill_id: 7, skill_name: "Swift", category: "technical" },
  { skill_id: 8, skill_name: "Git", category: "tool" },
];

export default function SkillsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Skill selection state for proficiency customization before add
  const [selectedSkillForAdd, setSelectedSkillForAdd] = useState(null);
  const [proficiency, setProficiency] = useState('intermediate');
  const [yearsExp, setYearsExp] = useState(1.0);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Fetch User profile (current skills list)
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/users/me'),
  });

  // 2. Fetch search results based on debounced query
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['skillsSearch', debouncedQuery],
    queryFn: () => api.get(`/users/skills/search?q=${debouncedQuery}`),
    enabled: debouncedQuery.trim().length > 0,
  });

  // Mutations
  const addSkillMutation = useMutation({
    mutationFn: (payload) => api.post('/users/me/skills', payload),
    onSuccess: () => {
      toast.success('Skill added to your profile!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setSelectedSkillForAdd(null);
      setSearchQuery('');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add skill. It may already exist.');
    },
  });

  const removeSkillMutation = useMutation({
    mutationFn: (userSkillId) => api.delete(`/users/me/skills/${userSkillId}`),
    onSuccess: () => {
      toast.success('Skill removed from your profile.');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to remove skill.');
    },
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedSkillForAdd) return;

    const payload = {
      proficiency_level: proficiency,
      years_experience: parseFloat(yearsExp),
    };

    if (selectedSkillForAdd.isCustom) {
      payload.custom_skill_name = selectedSkillForAdd.skill_name;
    } else {
      payload.skill_id = selectedSkillForAdd.skill_id;
    }

    addSkillMutation.mutate(payload);
  };

  const getProficiencyBadgeStyle = (level) => {
    const l = level?.toLowerCase() || 'beginner';
    if (l === 'expert') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (l === 'advanced') return 'bg-violet-500/10 border-violet-500/20 text-[#A78BFA]';
    if (l === 'intermediate') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  };

  const userSkills = userProfile?.skills || [];
  const currentSkillIds = new Set(userSkills.map((s) => s.skill_id));

  // Compute stats using useMemo
  const stats = React.useMemo(() => {
    const total = userSkills.length;
    const avgExp = total > 0 
      ? (userSkills.reduce((sum, s) => sum + parseFloat(s.years_of_experience || 0), 0) / total).toFixed(1)
      : '0.0';
    
    const profLevels = userSkills.map(s => s.proficiency_level?.toLowerCase());
    let topProf = 'None';
    if (profLevels.length > 0) {
      const counts = {};
      profLevels.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
      topProf = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      topProf = topProf.charAt(0).toUpperCase() + topProf.slice(1);
    }

    return { total, avgExp, topProf };
  }, [userSkills]);

  // Filter out skills that user already has
  const filteredSearchResults = (searchResults || []).filter(
    (s) => !currentSkillIds.has(s.skill_id)
  );

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-violet-600/[0.04] blur-[130px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-cyan-600/[0.04] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Navigation and Title */}
      <nav className="relative z-10 select-none">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 text-xs font-mono text-[#A2A0C2] hover:text-white transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          <span>Back to Profile</span>
        </button>
      </nav>

      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 flex items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest">
            Profile Settings
          </span>
          <h1 
            className="text-xl md:text-2xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Manage Professional Skills
          </h1>
        </div>
        <div className="shrink-0 p-2.5 bg-white/5 border border-white/5 text-[#22D3EE] rounded-xl">
          <HugeiconsIcon icon={Award01Icon} className="size-6 animate-pulse" />
        </div>
      </header>

      {/* Skills Manager Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left Side: Stats and Declared Skillsets Matrix (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Statistics Card */}
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
              Skill Overview Stats
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase font-semibold">Total</span>
                <span className="text-xl font-black text-violet-400 mt-1">{stats.total}</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase font-semibold">Avg Exp</span>
                <span className="text-xl font-black text-cyan-400 mt-1">{stats.avgExp}y</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase font-semibold">Focus</span>
                <span className="text-xs font-black text-emerald-400 mt-2 truncate w-full">{stats.topProf}</span>
              </div>
            </div>
          </div>

          {/* Declared Skillsets Card */}
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
              Declared Skillsets
            </h4>

            <div className="space-y-3">
              {userSkills.map((s) => (
                <div
                  key={s.user_skill_id}
                  className="p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{s.skill_name}</span>
                      <span className="text-[#22D3EE] shrink-0" title="Self Declared">
                        <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-widest ${getProficiencyBadgeStyle(s.proficiency_level)}`}>
                        {s.proficiency_level}
                      </span>
                      {s.years_of_experience > 0 && (
                        <span className="text-[9px] font-mono text-[#A2A0C2]">
                          {s.years_of_experience} yrs exp
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeSkillMutation.mutate(s.user_skill_id)}
                    disabled={removeSkillMutation.isPending}
                    className="p-2 text-[#5C5A78] hover:text-rose-400 hover:bg-white/5 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Remove Skill"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                  </button>
                </div>
              ))}

              {userSkills.length === 0 && (
                <p className="text-center text-[10px] font-mono text-[#5C5A78] py-8 w-full border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
                  No skills declared in profile taxonomy.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Skill Search Panel & Popular Stack Catalog (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-6">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
                Search & Add Skills
              </h4>
              <p className="text-[10px] text-[#A2A0C2] font-mono">
                Search our database of technology stacks or declare a custom skill.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search database (e.g. React, Docker, Python)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-[#5C5A78] text-xs rounded-xl p-3.5 pl-10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 outline-none"
              />
              <HugeiconsIcon
                icon={SearchIcon}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-[#5C5A78]"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin" />
              )}
            </div>

            {/* Dropdown list of Search Results */}
            {searchQuery.trim() ? (
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
                  Search Results
                </h5>
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {filteredSearchResults.map((skill) => (
                    <div
                      key={skill.skill_id}
                      className="p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4 transition-all"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-white">{skill.skill_name}</h5>
                        <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-wider mt-1 block">
                          {skill.category || 'General Technology'}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setProficiency('intermediate');
                          setYearsExp(1.0);
                          setSelectedSkillForAdd(skill);
                        }}
                        className="px-3.5 py-1.5 bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600 hover:border-violet-500 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <HugeiconsIcon icon={Add01Icon} className="size-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}

                  {/* Add Custom Skill Button */}
                  <div className="p-4 rounded-2xl bg-violet-600/[0.03] border border-violet-500/20 flex items-center justify-between gap-4 transition-all mt-2">
                    <div>
                      <h5 className="text-xs font-bold text-white">Add "{searchQuery}" manually</h5>
                      <p className="text-[9px] text-[#A2A0C2] mt-0.5">Declare a custom skill not in the standard database.</p>
                    </div>
                    <button
                      onClick={() => {
                        setProficiency('intermediate');
                        setYearsExp(1.0);
                        setSelectedSkillForAdd({ skill_name: searchQuery, isCustom: true });
                      }}
                      className="px-3.5 py-2 bg-violet-600 border border-violet-500 hover:bg-violet-500 hover:border-violet-400 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer font-mono shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    >
                      <HugeiconsIcon icon={Add01Icon} className="size-3" />
                      <span>Configure & Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Popular Stack Catalog */
              <div className="space-y-4 pt-2">
                <h5 className="text-[10px] font-bold text-[#5C5A78] uppercase tracking-wider font-mono">
                  Popular Stack Catalog
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {POPULAR_SKILLS.map((skill) => {
                    const isAdded = userSkills.some(us => us.skill_id === skill.skill_id);
                    return (
                      <div
                        key={skill.skill_id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isAdded 
                            ? 'bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                            : 'bg-white/[0.01] hover:bg-white/[0.02] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div>
                          <h6 className="text-xs font-bold text-white">{skill.skill_name}</h6>
                          <span className="text-[8px] font-bold font-mono text-violet-400 uppercase tracking-widest mt-1 block">
                            {skill.category}
                          </span>
                        </div>
                        {isAdded ? (
                          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1">
                            <HugeiconsIcon icon={Tick02Icon} className="size-3" />
                            <span>Added</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setProficiency('intermediate');
                              setYearsExp(1.0);
                              setSelectedSkillForAdd(skill);
                            }}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <HugeiconsIcon icon={Add01Icon} className="size-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Select Proficiency Modal Dialog overlay */}
      <AnimatePresence>
        {selectedSkillForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-extrabold text-white">Configure Skill Parameters</h4>
                  <span className="text-xs font-bold text-violet-400 font-mono mt-0.5 block">
                    {selectedSkillForAdd.skill_name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSkillForAdd(null)}
                  className="p-1 rounded-lg hover:bg-white/5 text-[#5C5A78] hover:text-white transition-all cursor-pointer"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 font-mono text-xs">
                {/* Proficiency Select */}
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Proficiency Level
                  </label>
                  <Select onValueChange={setProficiency} value={proficiency}>
                    <SelectTrigger className="w-full !h-[44px] bg-white/5 border-white/10 rounded-xl px-3 text-white text-xs text-left focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 focus-visible:ring-1 focus-visible:ring-violet-500/20 focus-visible:border-violet-500">
                      <SelectValue placeholder="Select proficiency level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0b0b14] border border-white/10 text-white rounded-xl shadow-2xl">
                      <SelectItem value="beginner" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">Beginner</SelectItem>
                      <SelectItem value="intermediate" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">Intermediate</SelectItem>
                      <SelectItem value="advanced" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">Advanced</SelectItem>
                      <SelectItem value="expert" className="text-white hover:bg-white/5 focus:bg-white/5 cursor-pointer rounded-lg py-2">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Years Experience Input */}
                <div className="flex flex-col">
                  <label className="block mb-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.5"
                    value={yearsExp}
                    onChange={(e) => setYearsExp(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 outline-none focus:border-violet-500 text-xs h-[44px]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSkillForAdd(null)}
                    className="px-4 py-2 border border-white/5 bg-white/5 rounded-xl text-[#A2A0C2] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSkillMutation.isPending}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer"
                  >
                    {addSkillMutation.isPending ? 'Adding...' : 'Add to Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
