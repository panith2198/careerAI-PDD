import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { FavouriteIcon, Briefcase01Icon, SparklesIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ApplyBar({
  job,
  application,
  resumes = [],
  isLoadingResumes = false,
  onApply,
  onSave,
  onUnsave,
  isApplying = false,
  isSaving = false,
}) {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const hasApplied = application && application.status === 'applied';
  const isSaved = application && application.status === 'saved';

  const { title, company_name, source, job_url, job_url_direct } = job;

  // Set default resume ID when list loads
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].resume_id.toString());
    }
  }, [resumes, selectedResumeId]);

  const handleApplyClick = () => {
    if (hasApplied) return;
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) return;
    
    try {
      await onApply({
        resumeId: parseInt(selectedResumeId, 10),
        coverNote,
      });
      setIsDialogOpen(false);
      setCoverNote('');
    } catch (err) {
      // Handled by query mutation/toast
    }
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      onUnsave();
    } else {
      onSave();
    }
  };

  const renderContent = (isMobile = false) => {
    return (
      <div
        className={
          isMobile
            ? 'flex items-center justify-between gap-4 w-full'
            : 'space-y-4 w-full'
        }
      >
        {/* Save Toggle */}
        <motion.button
          type="button"
          onClick={handleSaveToggle}
          disabled={isSaving || hasApplied}
          whileTap={{ scale: 0.8 }}
          animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.3 }}
          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isSaved
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              : 'bg-white/5 border-white/5 text-[#5C5A78] hover:text-rose-400 hover:border-rose-500/20'
          } ${isMobile ? 'size-12' : 'w-full py-3.5 gap-2 text-xs font-bold'}`}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            className={`size-5 shrink-0 ${isSaved ? 'fill-rose-500' : ''}`}
          />
          {!isMobile && (isSaved ? 'Saved to Bookmarks' : 'Bookmark Opportunity')}
        </motion.button>

        {/* Apply CTA */}
        <button
          type="button"
          onClick={handleApplyClick}
          disabled={hasApplied}
          className={`relative overflow-hidden cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed ${
            isMobile ? 'flex-1 h-12' : 'w-full py-4 text-sm'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          {hasApplied ? (
            <>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4.5 text-cyan-300" />
              <span>Applied</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={Briefcase01Icon} className="size-4.5" />
              <span>Apply Now</span>
            </>
          )}
        </button>

        {/* External Apply Link */}
        {!isMobile && (job_url || job_url_direct) && source !== 'manual' && (
          <a
            href={job_url_direct || job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-[#A2A0C2] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 select-none"
          >
            <span>Apply on {source === 'zip_recruiter' ? 'ZipRecruiter' : source?.charAt(0).toUpperCase() + source?.slice(1)}</span>
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Panel */}
      <div className="hidden lg:block w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.3)] sticky top-28">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4">
          Job Application Control
        </h4>
        
        {renderContent(false)}

        <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2.5 text-[10px] text-[#A2A0C2] leading-normal font-mono select-none">
          <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Applying will share your AI matched profile, skill validations, and selected resume directly with the hiring manager.
          </span>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#060608]/75 backdrop-blur-xl border-t border-white/10 p-4 pb-safe flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {renderContent(true)}
      </div>

      {/* Apply Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0f] border border-white/10 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <HugeiconsIcon icon={Briefcase01Icon} className="size-5 text-violet-400" />
              Submit Application
            </DialogTitle>
            <DialogDescription className="text-xs text-[#A2A0C2] font-medium leading-relaxed">
              Complete your application details for <strong className="text-white font-bold">{title}</strong> at <strong className="text-cyan-400 font-bold">{company_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {isLoadingResumes ? (
            <div className="space-y-4 py-4 select-none">
              <div className="h-4 w-1/3 bg-white/5 rounded-sm animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded-md animate-pulse" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="space-y-4 py-4 select-none">
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/25 flex flex-col items-center text-center gap-2.5">
                <div className="size-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <HugeiconsIcon icon={FavouriteIcon} className="size-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-white">No Resumes Found</h5>
                  <p className="text-[10px] text-[#A2A0C2] leading-normal max-w-xs">
                    You need to upload at least one PDF resume to submit this job application.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsDialogOpen(false);
                  navigate('/resume/upload');
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 text-xs font-bold cursor-pointer"
              >
                Upload Resume First
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 py-2 select-none">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono">
                  Select Resume
                </label>
                <Select
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                >
                  <SelectTrigger className="w-full min-w-0 overflow-hidden bg-white/5 border border-white/10 text-white rounded-md p-2.5 h-[44px] text-xs font-mono focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none select-none text-left flex justify-between items-center cursor-pointer">
                    <SelectValue className="min-w-0 truncate" placeholder="Select resume" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0f] border-white/10 text-white rounded-xl shadow-2xl">
                    {resumes.map((r) => {
                      const parts = r.file_url.split('/');
                      const rawFilename = parts[parts.length - 1];
                      const filename = rawFilename.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_/i, '');
                      const dateStr = new Date(r.created_at).toLocaleDateString();
                      const scoreStr = r.ats_score !== null ? ` | Score: ${r.ats_score}%` : '';
                      return (
                        <SelectItem
                          key={r.resume_id}
                          value={r.resume_id.toString()}
                          className="focus:bg-violet-500/20 focus:text-white cursor-pointer py-2.5 rounded-lg text-xs font-mono"
                        >
                          {filename.substring(0, 30)}{filename.length > 30 ? '...' : ''} (Uploaded {dateStr}{scoreStr})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono flex items-center justify-between">
                  <span>Cover Note</span>
                  <span className="text-[#5C5A78] normal-case font-sans">Optional</span>
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Briefly introduce yourself and outline why you are an excellent fit for this position..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-md p-2.5 text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none min-h-[100px] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/5 text-[#A2A0C2] hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isApplying || !selectedResumeId}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-5 font-bold cursor-pointer"
                >
                  {isApplying ? 'Applying...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
