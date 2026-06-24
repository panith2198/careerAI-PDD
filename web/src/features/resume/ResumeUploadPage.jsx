import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  BrainIcon, 
  SparklesIcon, 
  FileUploadIcon, 
  ArrowRight01Icon, 
  Alert02Icon,
  Tick02Icon,
  Cancel01Icon,
  Calendar02Icon
} from '@hugeicons/core-free-icons';
import { toast } from 'sonner';

import api from '@/api/api';
import { getResumeStatus } from './resume.api';
import useUploadProgress from './useUploadProgress';
import ResumeDropzone from './ResumeDropzone';
import UploadProgress from './UploadProgress';
import ProcessingTimeline from './ProcessingTimeline';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [parseStatus, setParseStatus] = useState(null); // 'pending', 'processing', 'done', 'failed'

  const { progress, uploading, performUpload } = useUploadProgress();

  // Fetch previously uploaded resumes for listing in history panel
  const { data: resumeHistoryData, refetch: refetchHistory } = useQuery({
    queryKey: ['resumeHistory'],
    queryFn: () => api.get('/resume/history'),
  });

  const resumesList = resumeHistoryData?.items || [];

  // Compute resume history summary stats
  const stats = React.useMemo(() => {
    const total = resumesList.length;
    const scores = resumesList
      .map(r => r.ats_score !== null ? parseFloat(r.ats_score) : null)
      .filter(s => s !== null);
      
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : 0;
      
    const highestScore = scores.length > 0
      ? Math.round(Math.max(...scores))
      : 0;

    return { total, averageScore, highestScore };
  }, [resumesList]);

  // Polling parsing status
  const { data: statusData } = useQuery({
    queryKey: ['resumeStatus', resumeId],
    queryFn: () => getResumeStatus(resumeId),
    enabled: !!resumeId && parseStatus !== 'done' && parseStatus !== 'failed',
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'done' || status === 'failed' ? false : 3000;
    }
  });

  // Track status changes from polling
  useEffect(() => {
    if (statusData?.status) {
      setParseStatus(statusData.status);
      if (statusData.status === 'done') {
        toast.success('Resume analysis completed successfully!');
        refetchHistory(); // Refresh history immediately
      } else if (statusData.status === 'failed') {
        toast.error('Resume processing failed. Please try again.');
      }
    }
  }, [statusData, refetchHistory]);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    try {
      const result = await performUpload(file);
      if (result?.resume_id) {
        setResumeId(result.resume_id);
        setParseStatus(result.status || 'pending');
        toast.success('Resume uploaded successfully! Initializing AI parsing...');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload resume. Please try again.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResumeId(null);
    setParseStatus(null);
  };

  // Compute active step in pipeline
  const getTimelineStep = () => {
    if (uploading) return 0;
    if (parseStatus === 'pending') return 1;
    if (parseStatus === 'processing') return 2; // AI mapping
    if (statusData?.status === 'processing') return 3; // ATS report construction
    if (parseStatus === 'done') return 4;
    return 0;
  };

  const currentStep = getTimelineStep();
  const showTimeline = uploading || !!resumeId;

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-16 overflow-hidden select-none">
      {/* Sci-Fi Ambient Glow and grid overlays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[45%] h-[45%] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[45%] h-[45%] rounded-full bg-cyan-600/5 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Header Section */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <h1 
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Upload your resume
          </h1>
          <p className="text-xs md:text-sm text-[#9D99B8] leading-relaxed max-w-xl">
            Our multi-dimensional AI engine scans your profile skillsets, evaluates market index matching, and prepares custom interview telemetry templates.
          </p>
        </div>
        <div className="shrink-0 p-3 bg-white/5 border border-white/5 text-cyan-400 rounded-2xl hidden md:block">
          <HugeiconsIcon icon={FileUploadIcon} className="size-8" />
        </div>
      </header>

      {/* 12-Column Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Side: Stats and Previous Uploads (4 Columns) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Stats Card */}
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
              Upload Telemetry Overview
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase font-semibold">Resumes</span>
                <span className="text-lg font-black text-violet-400 mt-1">{stats.total}</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase font-semibold">Avg ATS</span>
                <span className="text-lg font-black text-cyan-400 mt-1">{stats.averageScore}%</span>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase font-semibold">Top Score</span>
                <span className="text-lg font-black text-emerald-400 mt-1">{stats.highestScore}%</span>
              </div>
            </div>
          </div>

          {/* Previous Resumes Card List */}
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
              Uploaded Resumes Archive
            </h4>

            <div className="space-y-3.5 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
              {resumesList.map((r) => {
                const parts = r.file_url.split('/');
                const rawFilename = parts[parts.length - 1];
                const filename = rawFilename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '');
                const score = r.ats_score !== null ? parseFloat(r.ats_score) : 70;
                
                const getScoreColor = (val) => {
                  if (val < 50) return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
                  if (val < 75) return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
                  return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
                };

                const formatDate = (dateStr) => {
                  try {
                    const d = new Date(dateStr);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  } catch (e) {
                    return dateStr;
                  }
                };

                return (
                  <div
                    key={r.resume_id}
                    onClick={() => navigate(`/resume/${r.resume_id}/preview`)}
                    className="p-3.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 group"
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-white truncate group-hover:text-[#22D3EE] transition-colors">
                        {filename}
                      </h5>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-mono font-bold ${getScoreColor(score)}`}>
                          ATS: {Math.round(score)}%
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-[#A2A0C2] font-mono">
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

              {resumesList.length === 0 && (
                <div className="w-full py-12 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
                  <span className="p-3 bg-white/[0.02] border border-white/5 rounded-full inline-block text-[#5C5A78] mb-2">
                    <HugeiconsIcon icon={FileUploadIcon} className="size-6 text-cyan-400" />
                  </span>
                  <p className="text-xs text-[#5C5A78] font-mono leading-none">
                    No uploaded resumes indexed.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Upload and Live Monitor (8 Columns) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Main Upload Actions Panel */}
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg space-y-6">
            
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3">
                Analyze Document
              </h4>
              <p className="text-[10px] text-[#A2A0C2] font-mono">
                Select your resume to trigger real-time AI parsing and semantic scoring checks.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!resumeId && !uploading && (
                <motion.div
                  key="upload-inputs"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <ResumeDropzone
                    onFileSelect={handleFileSelect}
                    selectedFile={file}
                    onRemoveFile={handleRemoveFile}
                  />

                  {file && (
                    <button
                      onClick={handleUploadSubmit}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_25px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 group cursor-pointer font-mono"
                    >
                      <HugeiconsIcon icon={SparklesIcon} className="size-4 animate-pulse text-[#22D3EE]" />
                      <span>Analyze Resume</span>
                    </button>
                  )}
                </motion.div>
              )}

              {uploading && (
                <motion.div
                  key="upload-progress"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                >
                  <UploadProgress value={progress} />
                </motion.div>
              )}

              {parseStatus && parseStatus !== 'done' && parseStatus !== 'failed' && (
                <motion.div
                  key="parsing-telemetry"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl"
                >
                  <div className="relative size-20 flex items-center justify-center bg-violet-500/10 border border-violet-500/20 text-[#A78BFA] rounded-full">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-2 rounded-full border border-dashed border-violet-400/40"
                    />
                    <HugeiconsIcon icon={BrainIcon} className="size-10 text-[#22D3EE] animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">
                      AI Analysis In Progress
                    </h4>
                    <p className="text-[10px] text-[#A2A0C2] max-w-xs leading-relaxed font-mono">
                      AI is analyzing your career profile and extracting skill gaps...
                    </p>
                  </div>
                </motion.div>
              )}

              {parseStatus === 'done' && (
                <motion.div
                  key="complete-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full bg-white/[0.02] border border-emerald-500/20 backdrop-blur-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-[0_15px_35px_rgba(16,185,129,0.05)]"
                >
                  <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <HugeiconsIcon icon={BrainIcon} className="size-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                      Resume Analysis Complete
                    </h4>
                    <p className="text-[10px] text-[#A2A0C2] max-w-xs leading-relaxed font-mono">
                      Your resume has been parsed successfully. Click below to review your compatibility rating and improvement checklist.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-xs justify-center mx-auto">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white text-[#A2A0C2] text-xs font-bold transition-all cursor-pointer font-mono"
                    >
                      Upload New
                    </button>
                    <button
                      onClick={() => navigate(`/resume/${resumeId}/preview`)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.25)] flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                    >
                      <span>View Report</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {parseStatus === 'failed' && (
                <motion.div
                  key="parse-failure"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full bg-white/[0.02] border border-rose-500/20 backdrop-blur-2xl rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-xl"
                >
                  <div className="size-16 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                    <HugeiconsIcon icon={Alert02Icon} className="size-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                      Processing Failure
                    </h4>
                    <p className="text-[10px] text-[#A2A0C2] max-w-xs leading-relaxed font-mono">
                      Our AI parser encountered an error while indexing this document layout. Please make sure the PDF text is extractable.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer font-mono mx-auto block"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Pipeline Telemetry Timeline Card */}
          <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-lg">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4">
              Real-time Pipeline Telemetry
            </h4>
            
            {showTimeline ? (
              <ProcessingTimeline currentStep={currentStep} />
            ) : (
              <div className="text-center py-10 space-y-3">
                <span className="p-3 bg-white/[0.02] border border-white/5 rounded-full inline-block text-[#5C5A78]">
                  <HugeiconsIcon icon={FileUploadIcon} className="size-8" />
                </span>
                <h5 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                  No active document monitor
                </h5>
                <p className="text-[10px] text-[#5C5A78] leading-relaxed max-w-xs mx-auto font-mono">
                  Once a PDF resume is uploaded, real-time pipeline telemetry events and extraction details will stream here.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
