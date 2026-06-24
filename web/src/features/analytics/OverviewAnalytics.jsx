import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { Award01Icon, StarIcon, Task02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { format } from 'date-fns';

export default function OverviewAnalytics({ data }) {
  // 1. Skill/Career Fit Score Trend LineChart (from career_fit_trend data)
  const lineChartData = useMemo(() => {
    const trend = data?.career_fit_trend || [];
    return trend.map(item => {
      let dateLabel = 'Growth';
      try {
        dateLabel = format(new Date(item.generated_at), 'MMM d');
      } catch (e) {}
      return {
        label: dateLabel,
        score: Math.round(item.fit_score)
      };
    });
  }, [data?.career_fit_trend]);

  // 2. Assessment Performance BarChart (from assessment_scores data)
  const barChartData = useMemo(() => {
    const scores = data?.assessment_scores || [];
    return scores.map(item => ({
      name: item.assessment_title.length > 12 ? item.assessment_title.slice(0, 10) + '..' : item.assessment_title,
      score: Math.round(item.score)
    }));
  }, [data?.assessment_scores]);

  // 3. Roadmap Completion Pie/Donut Chart (from roadmap_pct data)
  const donutData = useMemo(() => {
    const roadmaps = data?.roadmap_pct || [];
    const avgCompletion = roadmaps.length > 0
      ? Math.round(roadmaps.reduce((acc, r) => acc + r.completion_pct, 0) / roadmaps.length)
      : 0;

    return {
      percentage: avgCompletion,
      chartData: [
        { name: 'Completed', value: avgCompletion, color: '#06B6D4' },
        { name: 'Remaining', value: 100 - avgCompletion, color: 'rgba(255, 255, 255, 0.03)' }
      ]
    };
  }, [data?.roadmap_pct]);

  // 4. Cohort Percentile (from assessment percentile averages)
  const cohortPercentile = useMemo(() => {
    const scores = data?.assessment_scores || [];
    if (scores.length > 0) {
      const maxPercentile = Math.max(...scores.map(s => s.percentile_rank || 0));
      const normalizedPercentile = maxPercentile <= 1 ? maxPercentile * 100 : maxPercentile;
      if (normalizedPercentile > 0) return Math.round(normalizedPercentile);
    }
    return 0;
  }, [data?.assessment_scores]);

  // Framer Motion entry animations
  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none relative z-10">
      
      {/* Skill Score Trend LineChart */}
      <motion.div
        variants={cardVariants}
        className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
      >
        <div className="space-y-1">
          <span className="text-[9px] font-bold font-mono text-violet-400 uppercase tracking-widest block">AI Career Alignment</span>
          <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Skill Fit Index Trend</h3>
        </div>
        
        <div className="h-56 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <XAxis dataKey="label" stroke="#A2A0C2" tickLine={false} axisLine={false} />
              <YAxis stroke="#A2A0C2" domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0C0C12] border border-white/10 p-2.5 rounded-xl shadow-xl text-[10px] font-mono">
                        <p className="text-[#A2A0C2]">{payload[0].payload.label}</p>
                        <p className="text-violet-400 font-bold">Fit Score: {payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.05)', strokeWidth: 1 }}
              />
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="100%" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <Line
                type="monotone"
                dataKey="score"
                stroke="url(#lineGlow)"
                strokeWidth={3}
                dot={{ fill: '#06B6D4', strokeWidth: 1, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Assessment Performance BarChart */}
      <motion.div
        variants={cardVariants}
        className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
      >
        <div className="space-y-1">
          <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest block">Evaluations Scoreboard</span>
          <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Assessment Standings</h3>
        </div>

        <div className="h-56 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#A2A0C2" tickLine={false} axisLine={false} />
              <YAxis stroke="#A2A0C2" domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0C0C12] border border-white/10 p-2.5 rounded-xl shadow-xl text-[10px] font-mono">
                        <p className="text-white font-extrabold">{payload[0].payload.name}</p>
                        <p className="text-cyan-400 font-bold">Score: {payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.02)', radius: 8 }}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Donut Chart: Roadmap Completion */}
      <motion.div
        variants={cardVariants}
        className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6"
      >
        <div className="space-y-3 text-center sm:text-left flex-1">
          <div>
            <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest block">Syllabus Complete</span>
            <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Roadmap Progress</h3>
          </div>
          <p className="text-[10px] text-[#A2A0C2] font-mono leading-relaxed max-w-[200px]">
            Aggregated milestones completion index across all active curriculum roadmaps.
          </p>
        </div>

        {/* Center label donut wrapper */}
        <div className="relative size-40 flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData.chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {donutData.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white font-mono leading-none">
              {donutData.percentage}%
            </span>
            <span className="text-[8px] font-bold font-mono text-[#5C5A78] uppercase mt-1">
              Complete
            </span>
          </div>
        </div>
      </motion.div>

      {/* Cohort Percentile Standing Card */}
      <motion.div
        variants={cardVariants}
        className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6 overflow-hidden relative"
      >
        {/* Neon accent glow */}
        <div className="absolute right-0 bottom-0 w-28 h-28 bg-violet-600/[0.04] rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 text-center sm:text-left flex-1 relative z-10">
          <div>
            <span className="text-[9px] font-bold font-mono text-violet-400 uppercase tracking-widest block">Cohort Placement</span>
            <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Overall Percentile Rank</h3>
          </div>
          <p className="text-[10px] text-[#A2A0C2] font-mono leading-relaxed">
            You are scoring ahead of <strong className="text-white">{cohortPercentile}%</strong> of active learners in similar professional trajectories.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 relative z-10 p-4 bg-violet-600/10 border border-violet-500/20 text-[#A78BFA] rounded-full size-28 shadow-lg">
          <HugeiconsIcon icon={Award01Icon} className="size-8 text-[#A78BFA] animate-bounce" />
          <span className="text-base font-black text-white font-mono mt-1">Top {100 - cohortPercentile}%</span>
        </div>
      </motion.div>

    </div>
  );
}
