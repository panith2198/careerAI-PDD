import React from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { BrainIcon, SparklesIcon, AwardIcon } from '@hugeicons/core-free-icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';

// Custom SVG Circular Gauge for Profile Strength
function ProfileStrengthGauge({ score = 85 }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.19
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative size-28 flex items-center justify-center shrink-0 mx-auto select-none">
      <svg className="size-full rotate-[-90deg]">
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="6"
        />
        <motion.circle
          cx="56"
          cy="56"
          r={radius}
          fill="transparent"
          stroke="#8B5CF6"
          strokeWidth="7"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
        />
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold font-mono text-white leading-none">
          {score}%
        </span>
        <span className="text-[8px] text-[#22D3EE] font-bold tracking-widest mt-1 uppercase leading-none">
          Strength
        </span>
      </div>
    </div>
  );
}

// Custom Tooltip for dark charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161525] border border-white/10 rounded-lg p-2.5 shadow-xl text-xs select-none">
        <p className="font-bold text-[#EEEAF8]">{payload[0].name || 'Value'}</p>
        <p className="text-[#22D3EE] font-mono font-bold mt-0.5">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsCard({ skillProgress = [], assessmentScores = [], careerFitTrend = [] }) {
  // Map skillProgress from database
  const skillGrowthData = skillProgress && skillProgress.length > 0
    ? skillProgress.map(s => ({
        name: s.skill_name,
        index: Math.round(s.proficiency_score || 0),
      }))
    : [];

  // Map careerFitTrend from database
  const careerFitData = careerFitTrend && careerFitTrend.length > 0
    ? careerFitTrend.map((t, idx) => {
        const dateStr = t.generated_at 
          ? new Date(t.generated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : `Point ${idx + 1}`;
        return {
          name: dateStr,
          score: Math.round(t.fit_score || 0),
        };
      })
    : [];

  // Dynamically calculate average skill score if skills exist
  const avgSkillScore = skillProgress.length > 0
    ? Math.round(skillProgress.reduce((acc, curr) => acc + (curr.proficiency_score || 0), 0) / skillProgress.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
      {/* 1. Profile Strength Widget */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[280px] hover:border-violet-500/20 transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-lg">
            <HugeiconsIcon icon={AwardIcon} className="size-4.5" />
          </span>
          <h4 className="text-sm font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Profile Strength
          </h4>
        </div>

        <div className="py-2">
          <ProfileStrengthGauge score={avgSkillScore} />
        </div>

        <div className="text-center text-[10px] text-[#5C5A78] leading-normal px-2">
          Update your experience chips, link verified credentials, or complete skills quizzes to raise score.
        </div>
      </div>

      {/* 2. Skills Growth Widget */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[280px] hover:border-violet-500/20 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] rounded-lg">
            <HugeiconsIcon icon={BrainIcon} className="size-4.5" />
          </span>
          <h4 className="text-sm font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Skills Growth Index
          </h4>
        </div>

        <div className="flex-1 w-full min-h-[140px] mt-2 flex flex-col justify-center">
          {skillGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
              <AreaChart data={skillGrowthData} style={{ outline: 'none' }} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#5C5A78" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C5A78" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="index"
                  name="Proficiency"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#violetGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 gap-1.5 text-center select-none">
              <span className="text-xs text-[#9D99B8] font-semibold">No skill telemetry recorded</span>
              <span className="text-[10px] text-[#5C5A78] leading-normal max-w-[200px]">Update your skills profile or take assessments to populate growth chart metrics.</span>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-[#5C5A78] mt-2 leading-none uppercase font-mono tracking-wider">
          Weekly skill vectors tracking
        </div>
      </div>

      {/* 3. AI Compatibility Trend Widget */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[280px] hover:border-violet-500/20 transition-all duration-300 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-[#34D399] rounded-lg">
            <HugeiconsIcon icon={SparklesIcon} className="size-4.5" />
          </span>
          <h4 className="text-sm font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AI Compatibility Trend
          </h4>
        </div>

        <div className="flex-1 w-full min-h-[140px] mt-2 flex flex-col justify-center">
          {careerFitData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
              <LineChart data={careerFitData} style={{ outline: 'none' }} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#5C5A78" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C5A78" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Compatibility"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: '#22D3EE', strokeWidth: 1, fill: '#060608' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-4 gap-1.5 text-center select-none">
              <span className="text-xs text-[#9D99B8] font-semibold">No recommendations history</span>
              <span className="text-[10px] text-[#5C5A78] leading-normal max-w-[200px]">Complete onboarding settings to start logging fit score trends over time.</span>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-[#5C5A78] mt-2 leading-none uppercase font-mono tracking-wider">
          Chronological compatibility fit index trend
        </div>
      </div>
    </div>
  );
}
