import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Cancel01Icon, 
  Copy01Icon, 
  CheckmarkCircle02Icon, 
  FileAttachmentIcon,
  Link01Icon
} from '@hugeicons/core-free-icons';
import MarkdownRenderer from './MarkdownRenderer';
import PDFViewer from '../resume/PDFViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api, { API_ORIGIN } from '@/api/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function SourcePreviewSheet({ source, onClose }) {
  const [copied, setCopied] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source) {
      setPreviewData(null);
      return;
    }

    // If content is already present, just use it
    if (source.content) {
      setPreviewData(source);
      return;
    }

    // Otherwise, fetch it dynamically by doc_id
    if (source.doc_id) {
      setLoading(true);
      api.get(`/rag/documents/${source.doc_id}`)
        .then((res) => {
          // Merge local relevance if present
          setPreviewData({
            ...res,
            relevance: source.relevance || res.relevance
          });
        })
        .catch((err) => {
          console.error('Failed to fetch document content:', err);
          // Fallback to whatever metadata we have
          setPreviewData(source);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPreviewData(source);
    }
  }, [source]);

  if (!source) return null;

  const currentData = previewData || source;
  const cleanTitle = currentData.title || 'Untitled Document';
  const relevancePercent = currentData.relevance ? `${Math.round(parseFloat(currentData.relevance) * 100)}%` : null;
  const isPdf = currentData.source_type === 'pdf' || cleanTitle.toLowerCase().endsWith('.pdf');
  const pdfUrl = currentData.source_path || currentData.file_url;

  const handleCopy = async () => {
    if (!currentData.content) return;
    try {
      await navigator.clipboard.writeText(currentData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy document content:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0B14] border-l border-white/[0.06] text-white">
      {/* Sheet Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0E0E1B]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="p-2 bg-violet-600/10 border border-violet-500/20 rounded-xl text-violet-400 shrink-0">
            <HugeiconsIcon icon={FileAttachmentIcon} className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate max-w-[280px]" title={cleanTitle}>
              {cleanTitle}
            </h2>
            <p className="text-[10px] text-white/40 font-mono flex items-center gap-2 mt-0.5">
              <span className="capitalize">{currentData.source_type || 'Document'}</span>
              {relevancePercent && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-cyan-400">Relevance: {relevancePercent}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/[0.05] rounded-xl text-white/50 hover:text-white transition-all cursor-pointer"
          title="Close Panel"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </div>

      {/* Action Sub-Bar */}
      <div className="shrink-0 px-6 py-2.5 border-b border-white/[0.04] bg-[#0B0B14]/50 flex items-center justify-between text-xs">
        <button
          onClick={handleCopy}
          disabled={loading || !currentData.content}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} className={`size-3.5 ${copied ? 'text-emerald-400' : ''}`} />
          <span>{copied ? 'Copied Content' : 'Copy Content'}</span>
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl.startsWith('/') ? `${API_ORIGIN}${pdfUrl}` : pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#22D3EE] hover:text-[#A78BFA] hover:bg-cyan-400/5 transition-all font-semibold cursor-pointer"
          >
            <HugeiconsIcon icon={Link01Icon} className="size-3.5" />
            <span>Open Original File</span>
          </a>
        )}
      </div>

      {/* Sheet Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-custom bg-[#09090F]">
        {loading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-6 w-1/3 bg-white/5" />
            <Skeleton className="h-40 w-full bg-white/5 rounded-2xl animate-pulse" />
            <Skeleton className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
          </div>
        ) : isPdf && pdfUrl ? (
          <Tabs defaultValue="pdf" className="w-full h-full flex flex-col gap-4">
            <TabsList className="grid grid-cols-2 bg-white/[0.02] border border-white/10 p-1 rounded-xl h-9 shrink-0">
              <TabsTrigger 
                value="pdf" 
                className="text-[11px] font-bold font-mono rounded-lg data-[state=active]:bg-white/5 data-[state=active]:text-white cursor-pointer"
              >
                Document View
              </TabsTrigger>
              <TabsTrigger 
                value="text" 
                className="text-[11px] font-bold font-mono rounded-lg data-[state=active]:bg-white/5 data-[state=active]:text-white cursor-pointer"
              >
                Text Chunk
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="outline-none focus:outline-none flex-1 min-h-0">
              <PDFViewer fileUrl={pdfUrl} />
            </TabsContent>

            <TabsContent value="text" className="outline-none focus:outline-none flex-1 min-h-0">
              {currentData.content ? (
                <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 select-text leading-relaxed font-sans text-white/80">
                  <MarkdownRenderer content={currentData.content} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
                  <p className="text-sm text-white/30 italic">No document preview text available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="w-full">
            {currentData.content ? (
              <div className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-5 select-text leading-relaxed font-sans text-white/80">
                <MarkdownRenderer content={currentData.content} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
                <p className="text-sm text-white/30 italic">No document preview text available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
