import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnalyticsUpIcon } from '@hugeicons/core-free-icons';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161525] border border-white/10 rounded-xl p-3 shadow-xl text-xs select-none font-mono">
        <p className="font-bold text-[#EEEAF8]">{payload[0].payload.name} Experience</p>
        <p className="text-[#22D3EE] font-bold mt-1">
          ₹{payload[0].value}LPA Average
        </p>
      </div>
    );
  }
  return null;
};

export default function SalaryChart({ career }) {
  const min = career.avg_salary_min || 800000;
  const max = career.avg_salary_max || 1800000;

  const chartData = [
    { name: 'Entry', salary: Math.round((min * 0.75) / 100000) },
    { name: 'Mid', salary: Math.round((min * 1.15) / 100000) },
    { name: 'Senior', salary: Math.round((max * 0.95) / 100000) },
    { name: 'Expert', salary: Math.round((max * 1.35) / 100000) },
  ];

  const avgSalary = Math.round(((min + max) / 2) / 100000);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[320px] hover:border-violet-500/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 text-[#22D3EE] rounded-lg">
            <HugeiconsIcon icon={AnalyticsUpIcon} className="size-4.5" />
          </span>
          <h4 className="text-sm font-bold text-[#EEEAF8]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Salary Insights
          </h4>
        </div>
        <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-[#22D3EE] rounded-full text-xs font-semibold font-mono">
          Average ₹{avgSalary}L/year
        </span>
      </div>

      <div className="flex-grow w-full min-h-[180px] mt-4 flex flex-col justify-end">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#5C5A78" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#5C5A78" fontSize={9} tickLine={false} axisLine={false} unit="L" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="salary" radius={[8, 8, 0, 0]} barSize={32}>
              {chartData.map((entry, index) => {
                const colors = ['#8B5CF6', '#22D3EE', '#8B5CF6', '#22D3EE'];
                return <Cell key={`cell-${index}`} fill={colors[index]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-[9px] text-[#5C5A78] leading-none uppercase font-mono tracking-wider mt-3">
        Projected annual compensation scale in INR (Lakhs)
      </div>
    </div>
  );
}
