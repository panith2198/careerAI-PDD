import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon } from '@hugeicons/core-free-icons';

export default function ExportCSVButton({ data }) {
  const handleExport = () => {
    if (!data) return;

    let csvContent = "";

    // 1. Skill Progress Section
    csvContent += "=== SKILL PROGRESS ===\n";
    csvContent += "Skill Name,Proficiency Level,Proficiency Score,Is Verified,Added At\n";
    (data.skill_progress || []).forEach(item => {
      csvContent += `"${item.skill_name}","${item.proficiency_level}",${item.proficiency_score},${item.is_verified},"${item.added_at || ''}"\n`;
    });
    csvContent += "\n";

    // 2. Assessment Scores Section
    csvContent += "=== ASSESSMENT SCORES ===\n";
    csvContent += "Assessment Title,Score,Percentile Rank,Time Taken (sec),Completed At\n";
    (data.assessment_scores || []).forEach(item => {
      csvContent += `"${item.assessment_title}",${item.score},${item.percentile_rank},${item.time_taken_seconds},"${item.completed_at || ''}"\n`;
    });
    csvContent += "\n";

    // 3. Roadmap Progress Section
    csvContent += "=== LEARNING ROADMAPS ===\n";
    csvContent += "Roadmap Title,Completion Pct,Status,Total Weeks,Hours Per Week\n";
    (data.roadmap_pct || []).forEach(item => {
      csvContent += `"${item.title}",${item.completion_pct},"${item.status}",${item.total_weeks},${item.hours_per_week}\n`;
    });
    csvContent += "\n";

    // 4. Recommendation Fit Trends Section
    csvContent += "=== CAREER RECOMMENDATION TRENDS ===\n";
    csvContent += "Recommendation Fit Score,Recommendation Rank,Trigger Event,Generated At\n";
    (data.career_fit_trend || []).forEach(item => {
      csvContent += `${item.fit_score},${item.rank},"${item.trigger}","${item.generated_at}"\n`;
    });

    // Create Blob and trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "career_analytics.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] cursor-pointer uppercase tracking-wider"
    >
      <HugeiconsIcon icon={Download01Icon} className="size-4" />
      <span>Export CSV</span>
    </button>
  );
}
