import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, Add01Icon, Remove01Icon } from '@hugeicons/core-free-icons';

// Set up CDN worker script to bypass local bundler issues
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const finalUrl = fileUrl?.startsWith('/') ? `http://localhost:8000${fileUrl}` : fileUrl;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset) => {
    setPageNumber(prev => Math.min(numPages || 1, Math.max(1, prev + offset)));
  };

  const adjustZoom = (amount) => {
    setScale(prev => Math.min(2.0, Math.max(0.6, prev + amount)));
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-5 flex flex-col items-center gap-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] select-none">
      {/* PDF Action Controls Toolbar */}
      <div className="w-full flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </button>
          
          <span className="text-xs font-mono font-bold text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
            Page {pageNumber} / {numPages || '-'}
          </span>

          <button
            type="button"
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </button>
        </div>

        {/* Zoom modifiers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustZoom(-0.1)}
            disabled={scale <= 0.6}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={Remove01Icon} className="size-4" />
          </button>
          
          <span className="text-[10px] font-mono font-bold text-[#A2A0C2] min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>

          <button
            type="button"
            onClick={() => adjustZoom(0.1)}
            disabled={scale >= 2.0}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#A2A0C2] hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
          </button>
        </div>
      </div>

      {/* PDF Page Canvas viewport wrapper */}
      <div className="w-full overflow-auto flex justify-center p-4 bg-black/25 rounded-2xl border border-white/5 max-h-[600px] scrollbar-custom">
        <div className="origin-top transition-transform duration-200" style={{ transform: `scale(${scale})` }}>
          <Document
            file={finalUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                <div className="size-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-[#A2A0C2] uppercase tracking-wider">Reading document canvas...</span>
              </div>
            }
            error={
              <div className="p-8 text-center text-rose-400 text-xs font-mono bg-rose-500/5 rounded-2xl border border-rose-500/10">
                Failed to index PDF document layout. Ensure file is accessible.
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-xl rounded-lg overflow-hidden border border-white/10"
              width={360}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
