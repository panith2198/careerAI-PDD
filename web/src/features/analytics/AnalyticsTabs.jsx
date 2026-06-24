import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import OverviewAnalytics from './OverviewAnalytics';
import SkillsAnalytics from './SkillsAnalytics';
import JobsAnalytics from './JobsAnalytics';

export default function AnalyticsTabs({ data, applications }) {
  return (
    <Tabs defaultValue="overview" className="w-full space-y-6 relative z-20 select-none">
      {/* Glass pills layout */}
      <TabsList className="bg-white/[0.02] border border-white/10 rounded-xl p-1 gap-1 flex w-fit h-11 shrink-0">
        <TabsTrigger
          value="overview"
          className="rounded-lg data-active:bg-violet-600/20 data-active:border-violet-500/20 data-active:text-white cursor-pointer px-5 py-2 font-mono uppercase tracking-wider text-[10px] font-bold"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="skills"
          className="rounded-lg data-active:bg-violet-600/20 data-active:border-violet-500/20 data-active:text-white cursor-pointer px-5 py-2 font-mono uppercase tracking-wider text-[10px] font-bold"
        >
          Skills
        </TabsTrigger>
        <TabsTrigger
          value="jobs"
          className="rounded-lg data-active:bg-violet-600/20 data-active:border-violet-500/20 data-active:text-white cursor-pointer px-5 py-2 font-mono uppercase tracking-wider text-[10px] font-bold"
        >
          Jobs
        </TabsTrigger>
      </TabsList>

      {/* Tabs Contents */}
      <TabsContent value="overview" className="mt-0 outline-none">
        <OverviewAnalytics data={data} />
      </TabsContent>

      <TabsContent value="skills" className="mt-0 outline-none">
        <SkillsAnalytics data={data} />
      </TabsContent>

      <TabsContent value="jobs" className="mt-0 outline-none">
        <JobsAnalytics applications={applications} />
      </TabsContent>
    </Tabs>
  );
}
