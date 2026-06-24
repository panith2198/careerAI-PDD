import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function UploadProgress({ value = 0 }) {
  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-2xl p-5 space-y-3.5 select-none shadow-md">
      <div className="flex items-center justify-between text-xs font-mono font-bold">
        <span className="text-[#A2A0C2] uppercase tracking-wider">Uploading Resume</span>
        <span className="text-cyan-400">{value}%</span>
      </div>

      <div className="relative">
        <Progress value={value} className="h-2 bg-white/5 rounded-full overflow-hidden" />
        {/* Glow indicator aligned with progress */}
        <motion.div
          className="absolute top-0 bottom-0 left-0 bg-[#22D3EE]/30 rounded-full blur-[4px] pointer-events-none"
          initial={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between items-center text-[9px] font-mono text-[#5C5A78]">
        <span>DO NOT CLOSE THIS TAB</span>
        <span>TRANSMITTING FILE PACKETS</span>
      </div>
    </div>
  );
}
