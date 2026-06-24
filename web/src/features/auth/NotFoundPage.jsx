import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-6 py-12 font-sans select-none overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-brand/5 rounded blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 text-center max-w-lg flex flex-col items-center">
        {/* Animated Space Illustration */}
        <div className="w-64 h-64 mb-8 relative flex items-center justify-center">
          <svg className="w-full h-full animate-bounce" style={{ animationDuration: '4s' }} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stars */}
            <circle cx="30" cy="40" r="1.5" fill="#A78BFA" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            <circle cx="210" cy="50" r="2" fill="#22D3EE" className="animate-ping" style={{ animationDuration: '2.5s' }} />
            <circle cx="50" cy="180" r="1" fill="#EEEAF8" />
            <circle cx="180" cy="190" r="1.5" fill="#A78BFA" />

            {/* Moon/Planet */}
            <circle cx="120" cy="120" r="60" fill="url(#planetGrad)" />
            {/* Planet Rings */}
            <ellipse cx="120" cy="120" rx="90" ry="18" stroke="url(#ringGrad)" strokeWidth="6" transform="rotate(-15 120 120)" />

            {/* Astronaut floating */}
            <g className="animate-pulse" style={{ animationDuration: '3s' }}>
              <rect x="90" y="80" width="60" height="50" rx="25" fill="#EEEAF8" />
              <rect x="98" y="88" width="44" height="26" rx="13" fill="#0F0F1C" stroke="#8B5CF6" strokeWidth="2" />
              <circle cx="110" cy="98" r="4" fill="#22D3EE" />
              <rect x="100" y="130" width="40" height="20" rx="10" fill="#EEEAF8" />
              {/* BackPack */}
              <rect x="82" y="90" width="10" height="40" rx="5" fill="#9D99B8" />
            </g>

            {/* Definitions */}
            <defs>
              <linearGradient id="planetGrad" x1="60" y1="60" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E1B2E" />
                <stop offset="50%" stopColor="#6D28D9" />
                <stop offset="100%" stopColor="#0F0F1C" />
              </linearGradient>
              <linearGradient id="ringGrad" x1="30" y1="120" x2="210" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
                <stop offset="30%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="70%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 404 Text */}
        <h1 className="font-heading text-8xl font-bold tracking-tight text-primary-glow mb-2">404</h1>
        <h2 className="font-heading text-2xl font-semibold mb-4 text-text-primary">Lost in Space</h2>
        <p className="text-text-secondary text-sm md:text-base mb-8 leading-relaxed">
          The page you are looking for has drifted out of orbit. Let's get you back to the command center.
        </p>

        {/* Action Button */}
        <Button size="lg" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-8">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
