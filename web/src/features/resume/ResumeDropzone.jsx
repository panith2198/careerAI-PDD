import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { FileUploadIcon, Cancel01Icon, Alert02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { z } from 'zod';

const fileSchema = z.object({
  type: z.string().refine(val => val === 'application/pdf', {
    message: 'Only PDF files are supported'
  }),
  size: z.number().max(10 * 1024 * 1024, {
    message: 'File size must be less than 10MB'
  })
});

export default function ResumeDropzone({ onFileSelect, selectedFile, onRemoveFile }) {
  const [errorMsg, setErrorMsg] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setErrorMsg('');

    if (rejectedFiles.length > 0) {
      setErrorMsg('Invalid file. Only PDF files under 10MB are allowed.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Perform Zod validation
      const validation = fileSchema.safeParse({
        type: file.type,
        size: file.size
      });

      if (!validation.success) {
        setErrorMsg(validation.error.errors[0].message);
        return;
      }

      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* Red error alert card */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/25 flex items-start gap-3 text-rose-400"
          >
            <HugeiconsIcon icon={Alert02Icon} className="size-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-extrabold font-mono uppercase tracking-wider">Validation Error</h5>
              <p className="text-[10px] leading-relaxed text-rose-300/80">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              className="ml-auto p-1 rounded-lg hover:bg-white/5 text-[#5C5A78] hover:text-white transition-all cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedFile ? (
        <motion.div
          {...getRootProps()}
          whileHover={{ scale: 1.01, border: '1px dashed rgba(139, 92, 246, 0.3)' }}
          animate={{
            borderColor: isDragActive ? 'rgba(34, 211, 238, 0.4)' : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: isDragActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            scale: isDragActive ? 1.02 : 1
          }}
          transition={{ duration: 0.2 }}
          className="w-full h-64 border border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none relative group overflow-hidden"
        >
          <input {...getInputProps()} />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.01] to-cyan-500/[0.01] pointer-events-none" />
          
          <div className="space-y-4 flex flex-col items-center">
            <span className="p-4 bg-white/[0.03] border border-white/5 rounded-full text-[#A2A0C2] group-hover:text-white transition-all group-hover:border-violet-500/20 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]">
              <HugeiconsIcon icon={FileUploadIcon} className="size-8 text-[#22D3EE] animate-bounce" />
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white leading-tight">
                {isDragActive ? 'Drop your resume now' : 'Drag & drop your resume here'}
              </h4>
              <p className="text-[10px] text-[#A2A0C2] font-semibold">
                PDF format only • Max size 10MB
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Selected File Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-white/[0.03] border border-white/10 backdrop-blur-2xl rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <HugeiconsIcon icon={Tick02Icon} className="size-5" />
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {selectedFile.name}
              </h4>
              <span className="text-[10px] font-bold font-mono text-[#A2A0C2] mt-0.5 block">
                {formatSize(selectedFile.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-[#5C5A78] hover:text-white hover:border-rose-500/20 hover:bg-rose-500/5 transition-all cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
