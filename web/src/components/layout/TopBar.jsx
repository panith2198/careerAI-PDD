import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon, Logout01Icon } from '@hugeicons/core-free-icons';
import useAuthStore from '@/stores/authStore';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-surface-1/80 border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md text-foreground">
      {/* Search / Context Info */}
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-bold tracking-tight text-text-primary">
          Career Command Center
        </h2>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon Link */}
        <button 
          onClick={() => navigate('/notifications')} 
          className="p-2 text-text-secondary hover:text-foreground hover:bg-surface-glass rounded-xl transition-all"
        >
          <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} className="size-5" />
        </button>

        {/* Profile / Avatar */}
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="w-8 h-8 rounded-sm bg-primary-dim border border-primary-bright/20 flex items-center justify-center text-primary-glow font-bold text-xs uppercase cursor-pointer" onClick={() => navigate('/profile')}>
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-text-primary leading-tight">
              {user?.name || 'Career Explorer'}
            </p>
            <p className="text-[10px] text-text-tertiary">
              {user?.role || 'User'}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button 
          onClick={handleLogout} 
          className="p-2 text-rose-brand/80 hover:text-rose-brand hover:bg-rose-dim rounded-xl transition-all ml-2"
          title="Log out"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-5" />
        </button>
      </div>
    </header>
  );
}
