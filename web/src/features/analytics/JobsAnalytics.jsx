import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, Briefcase01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

export default function JobsAnalytics({ applications = [] }) {
  const funnelData = useMemo(() => {
    // If no applications, display zeroed metrics instead of falling back to mock data
    if (!applications || applications.length === 0) {
      return {
        stages: [
          { name: 'Applied', value: 0, percentage: 0, color: '#3B82F6' },
          { name: 'Screening', value: 0, percentage: 0, color: '#6366F1' },
          { name: 'Interview', value: 0, percentage: 0, color: '#8B5CF6' },
          { name: 'Offer Received', value: 0, percentage: 0, color: '#EC4899' },
          { name: 'Offer Accepted', value: 0, percentage: 0, color: '#06B6D4' }
        ],
        conversionRate: '0.0'
      };
    }

    // Parse status keys
    const rawApps = Array.isArray(applications) ? applications : [];
    const totalApplied = rawApps.length;
    
    const screeningCount = rawApps.filter(a => 
      ['screening', 'interview', 'offered', 'accepted'].includes(a.status?.toLowerCase())
    ).length;
    
    const interviewCount = rawApps.filter(a => 
      ['interview', 'offered', 'accepted'].includes(a.status?.toLowerCase())
    ).length;
    
    const offerCount = rawApps.filter(a => 
      ['offered', 'accepted'].includes(a.status?.toLowerCase())
    ).length;
    
    const acceptedCount = rawApps.filter(a => 
      a.status?.toLowerCase() === 'accepted'
    ).length;

    // Build funnel stages
    const stages = [
      { name: 'Applied', value: totalApplied, percentage: 100, color: '#3B82F6' },
      { name: 'Screening', value: screeningCount, percentage: totalApplied > 0 ? Math.round((screeningCount / totalApplied) * 100) : 0, color: '#6366F1' },
      { name: 'Interview', value: interviewCount, percentage: totalApplied > 0 ? Math.round((interviewCount / totalApplied) * 100) : 0, color: '#8B5CF6' },
      { name: 'Offer Received', value: offerCount, percentage: totalApplied > 0 ? Math.round((offerCount / totalApplied) * 100) : 0, color: '#EC4899' },
      { name: 'Offer Accepted', value: acceptedCount, percentage: totalApplied > 0 ? Math.round((acceptedCount / totalApplied) * 100) : 0, color: '#06B6D4' }
    ];

    const conversionRate = totalApplied > 0 ? ((acceptedCount / totalApplied) * 100).toFixed(1) : '0.0';

    return { stages, conversionRate };
  }, [applications]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none relative z-10 items-stretch">
      
      {/* Funnel Card Details (1/3 width) */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { opacity: 1, y: 0 }
        }}
        className="bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-6"
      >
        <div className="space-y-3">
          <div>
            <span className="text-[9px] font-bold font-mono text-cyan-400 uppercase tracking-widest block">Pipeline Yield</span>
            <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Conversion rate</h3>
          </div>
          <p className="text-[10px] text-[#A2A0C2] font-mono leading-relaxed">
            The percentage of submitted job applications that successfully yield a signed employment agreement.
          </p>
        </div>

        {/* Dynamic conversion score circle */}
        <div className="flex flex-col items-center justify-center p-4 bg-cyan-600/10 border border-cyan-500/20 text-[#22D3EE] rounded-full size-32 mx-auto relative shadow-lg">
          <HugeiconsIcon icon={Briefcase01Icon} className="size-8 text-[#22D3EE] mb-1" />
          <span className="text-xl font-black text-white font-mono leading-none">{funnelData.conversionRate}%</span>
          <span className="text-[8px] font-mono text-[#A2A0C2] uppercase mt-0.5">Success Rate</span>
        </div>

        <div className="text-center">
          <span className="text-[9px] font-mono text-[#5C5A78]">
            Industry benchmark average: 2.8% - 4.5%
          </span>
        </div>
      </motion.div>

      {/* Funnel Chart Details (2/3 width) */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 15 },
          visible: { opacity: 1, y: 0 }
        }}
        className="md:col-span-2 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
      >
        <div className="space-y-1">
          <span className="text-[9px] font-bold font-mono text-violet-400 uppercase tracking-widest block">Application Funnel</span>
          <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">Recruitment Stages Yield</h3>
        </div>

        {/* Recharts Funnel visualization */}
        <div className="h-60 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData.stages}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#A2A0C2"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0C0C12] border border-white/10 p-2.5 rounded-xl shadow-xl text-[10px] font-mono">
                        <p className="text-white font-extrabold">{payload[0].payload.name}</p>
                        <p className="text-cyan-400 font-bold">Candidates/Apps: {payload[0].value}</p>
                        <p className="text-[#A2A0C2]">Conversion: {payload[0].payload.percentage}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.02)', radius: 8 }}
              />
              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                barSize={20}
              >
                {funnelData.stages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
}
