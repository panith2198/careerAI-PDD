import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function JobTabs({ activeTab, onTabChange }) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full select-none">
      <TabsList className="bg-white/[0.02] border border-white/10 rounded-2xl p-1 gap-2 flex items-center justify-start w-full max-w-md backdrop-blur-md h-auto">
        {[
          { value: 'all', label: 'All Jobs' },
          { value: 'saved', label: 'Saved' },
          { value: 'applied', label: 'My Applications' }
        ].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.value
                ? 'bg-violet-500/20 border border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                : 'bg-transparent border-transparent text-[#A2A0C2] hover:text-white'
            }`}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
