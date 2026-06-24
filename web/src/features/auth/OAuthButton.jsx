import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { GoogleIcon } from '@hugeicons/core-free-icons';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function OAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    toast.error('Google Sign-In is not implemented.');
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full h-[52px] flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-[#8B5CF6]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] rounded-xl text-[#EEEAF8] font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <HugeiconsIcon 
          icon={GoogleIcon} 
          className="size-5 text-white/80 group-hover:text-white transition-colors" 
        />
      )}
      <span>Continue with Google</span>
    </button>
  );
}
