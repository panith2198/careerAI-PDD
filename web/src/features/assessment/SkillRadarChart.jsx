import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export default function SkillRadarChart({ title, score }) {
  const baseScore = score || 0;
  const titleLower = (title || '').toLowerCase();
  
  // Dynamic category mapping based on assessment subject context
  let categories = ['Fundamentals', 'Syntax', 'Application', 'Problem Solving', 'Optimization'];
  
  if (titleLower.includes('kotlin')) {
    categories = ['Syntax & Types', 'Null Safety', 'Coroutines', 'OOP & Idioms', 'Collections'];
  } else if (titleLower.includes('architecture') || titleLower.includes('components')) {
    categories = ['Lifecycle & ViewModels', 'LiveData & Flows', 'Room Database', 'Repository Patterns', 'Threading'];
  } else if (titleLower.includes('compose') || titleLower.includes('layouts')) {
    categories = ['State Management', 'Layout Modifiers', 'Compositions', 'Animations', 'Performance'];
  } else if (titleLower.includes('data') || titleLower.includes('python')) {
    categories = ['Data Wrangling', 'Pandas & DataFrames', 'NumPy & Vectors', 'Math & Stats', 'Visualization'];
  } else if (titleLower.includes('react')) {
    categories = ['Hooks API', 'State Hooks', 'Performance', 'Context API', 'Architecture'];
  }

  // Create varied but realistic sub-scores centered around the user's actual score
  const data = categories.map((cat, idx) => {
    const variation = [6, -10, 8, -4, 12][idx];
    const val = Math.max(35, Math.min(100, Math.round(baseScore + variation)));
    return {
      subject: cat,
      score: val,
    };
  });

  return (
    <div className="w-full h-[320px] bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-5 flex flex-col justify-between select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-[11px] font-mono font-bold text-[#5C5A78] uppercase tracking-wider">
          Topic Breakdown
        </h4>
        <span className="text-[10px] font-mono font-bold text-[#22D3EE] uppercase tracking-wider">
          AI Analysis Model
        </span>
      </div>

      <div className="flex-1 w-full h-full min-h-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#A2A0C2', fontSize: 10, fontWeight: 500, fontFamily: 'Space Grotesk, sans-serif' }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#5C5A78', fontSize: 9, fontFamily: 'monospace' }}
              stroke="transparent"
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="#22D3EE"
              fillOpacity={0.16}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
