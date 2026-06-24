import React from 'react';
import { motion } from 'framer-motion';

export default function ScannerScanAnimation() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-[16/10] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cyan-brand/5 rounded blur-3xl opacity-30"></div>
      
      <svg
        className="w-full h-full text-foreground"
        viewBox="0 0 300 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Document Border & Mock Text */}
        <g>
          {/* Outer Sheet container */}
          <rect x="90" y="20" width="120" height="140" rx="8" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="1.5" />
          
          {/* Header lines */}
          <line x1="110" y1="40" x2="190" y2="40" stroke="#EEEAF8" strokeWidth="3" strokeLinecap="round" />
          <line x1="110" y1="52" x2="160" y2="52" stroke="#9D99B8" strokeWidth="2" strokeLinecap="round" />
          
          {/* Body mock paragraphs */}
          <line x1="110" y1="72" x2="190" y2="72" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          <line x1="110" y1="82" x2="175" y2="82" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          
          <line x1="110" y1="102" x2="190" y2="102" stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          <line x1="110" y1="112" x2="180" y2="112" stroke="#22D3EE" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
          
          <line x1="110" y1="132" x2="185" y2="132" stroke="#9D99B8" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
          <line x1="110" y1="142" x2="150" y2="142" stroke="#9D99B8" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
        </g>

        {/* Laser Line Scanning Effect */}
        <motion.g
          animate={{
            y: [0, 110, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Main Laser Line */}
          <line x1="80" y1="30" x2="220" y2="30" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" />
          {/* Laser Glow Area */}
          <line x1="80" y1="30" x2="220" y2="30" stroke="#22D3EE" strokeWidth="8" strokeOpacity="0.15" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  );
}
