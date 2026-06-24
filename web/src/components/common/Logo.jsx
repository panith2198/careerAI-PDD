import React from 'react';

export default function Logo({ className = "size-9", ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 48 48" 
      className={className} 
      {...props}
    >
      <defs>
        {/* Arrow shaft gradient */}
        <linearGradient id="arrowShaftGrad" x1="24" y1="38" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7B2FBE" />
          <stop offset="100%" stopColor="#9D4EDD" />
        </linearGradient>

        {/* Arrow head gradient */}
        <linearGradient id="arrowHeadGrad" x1="16" y1="18" x2="32" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9D4EDD" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>

        {/* Base platform gradient */}
        <linearGradient id="basePlatformGrad" x1="12" y1="38" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7B2FBE" />
          <stop offset="50%" stopColor="#9D4EDD" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>

      {/* Arrow shaft (career growth) */}
      <path d="M24,8 L24,38" stroke="url(#arrowShaftGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Arrow head */}
      <path d="M16,18 L24,8 L32,18" stroke="url(#arrowHeadGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* AI circuit branches */}
      <path d="M24,26 L14,20" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M24,26 L34,20" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M24,32 L12,29" stroke="#7B2FBE" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M24,32 L36,29" stroke="#7B2FBE" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Circuit nodes */}
      <path d="M24,8 m-3,0 a3,3 0,1 1,6 0 a3,3 0,1 1,-6 0" fill="#9D4EDD" />
      <path d="M24,26 m-2.5,0 a2.5,2.5 0,1 1,5 0 a2.5,2.5 0,1 1,-5 0" fill="#00D4FF" />
      <path d="M14,20 m-2,0 a2,2 0,1 1,4 0 a2,2 0,1 1,-4 0" fill="#00D4FF" />
      <path d="M34,20 m-2,0 a2,2 0,1 1,4 0 a2,2 0,1 1,-4 0" fill="#00D4FF" />
      <path d="M24,32 m-2,0 a2,2 0,1 1,4 0 a2,2 0,1 1,-4 0" fill="#9D4EDD" />
      <path d="M12,29 m-1.5,0 a1.5,1.5 0,1 1,3 0 a1.5,1.5 0,1 1,-3 0" fill="#7B2FBE" />
      <path d="M36,29 m-1.5,0 a1.5,1.5 0,1 1,3 0 a1.5,1.5 0,1 1,-3 0" fill="#7B2FBE" />

      {/* Base platform */}
      <path d="M12,38 L36,38" stroke="url(#basePlatformGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
