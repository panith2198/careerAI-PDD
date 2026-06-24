import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { FileUploadIcon, ArrowRight01Icon, Calendar02Icon } from '@hugeicons/core-free-icons';

export default function ResumeHistory({ resumes = [] }) {
  const navigate = useNavigate();

  const getScoreColor = (val) => {
    if (val < 50) return '#EF4444'; // Red
    if (val < 75) return '#F59E0B'; // Amber
    return '#10B981'; // Green
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 relative overflow-hidden select-none shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
            Resume Telemetry History
          </h3>
          <span className="text-[10px] font-mono font-bold text-[#A2A0C2] bg-white/5 px-2 py-0.5 rounded border border-white/5">
            {resumes.length}
          </span>
        </div>

        <button
          onClick={() => navigate('/resume/upload')}
          className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer font-mono"
        >
          <HugeiconsIcon icon={FileUploadIcon} className="size-3.5" />
          <span>Upload</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {resumes.slice(0, 5).map((r) => {
          const parts = r.file_url.split('/');
          const rawFilename = parts[parts.length - 1];
          const filename = rawFilename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '');
          const score = r.ats_score !== null ? parseFloat(r.ats_score) : 70;
          const color = getScoreColor(score);
          const radius = 14;
          const circumference = 2 * Math.PI * radius;

          return (
            <div
              key={r.resume_id}
              onClick={() => navigate(`/resume/${r.resume_id}/preview`)}
              className="w-full p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 select-none group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Mini Score Gauge */}
                <div className="relative size-10 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="2.5"
                      fill="transparent"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      stroke={color}
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[8px] font-black text-white font-mono leading-none">
                    {Math.round(score)}
                  </span>
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md group-hover:text-[#22D3EE] transition-colors">
                    {filename.substring(0, 30)}{filename.length > 30 ? '...' : ''}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-[#5C5A78] font-bold font-mono uppercase mt-1">
                    <HugeiconsIcon icon={Calendar02Icon} className="size-3 text-violet-400" />
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                </div>
              </div>

              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4.5 text-[#5C5A78] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </div>
          );
        })}

        {resumes.length === 0 && (
          <div className="w-full py-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
            <span className="p-3 bg-white/[0.02] border border-white/5 rounded-full inline-block text-[#5C5A78] mb-2">
              <HugeiconsIcon icon={FileUploadIcon} className="size-6 text-cyan-400" />
            </span>
            <p className="text-xs text-[#5C5A78] font-mono leading-none">
              No uploaded resumes indexed. Click Upload to parse your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
