import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit02Icon, Location01Icon, ImageAdd01Icon, Mail01Icon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ProfileHeader({
  user,
  onAvatarUpload,
  isUploadingAvatar = false,
}) {
  const navigate = useNavigate();

  const fullName = user?.full_name || 'Professional User';
  const email = user?.email || '';
  const profile = user?.profile || {};
  const city = profile?.city || 'India';
  const role = user?.role || 'Member';

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleAvatarClick = () => {
    if (isUploadingAvatar) return;
    const input = document.getElementById('avatar-upload-input');
    if (input) input.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload(file);
    }
  };

  return (
    <div className="w-full bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-3xl p-6 md:p-8 select-none relative overflow-hidden shadow-xl">
      {/* Premium background mesh and glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/[0.03] to-cyan-500/[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
      
      <input
        type="file"
        id="avatar-upload-input"
        className="hidden"
        accept="image/png, image/jpeg"
        onChange={handleFileChange}
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between w-full gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-w-0 text-center sm:text-left">
          {/* Avatar Section */}
          <div
            onClick={handleAvatarClick}
            className="relative group rounded-full border-2 border-white/10 overflow-hidden bg-white/5 cursor-pointer shrink-0 size-24 md:size-28 shadow-lg hover:border-violet-500/50 transition-all duration-300"
          >
            {isUploadingAvatar ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <div className="size-6 border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 text-white text-xs font-mono font-bold select-none z-15">
                <HugeiconsIcon icon={ImageAdd01Icon} className="size-5" />
              </div>
            )}
            <Avatar className="size-full rounded-full">
              <AvatarImage
                src={`http://localhost:8000/static/avatars/user_${user?.user_id}.jpg`}
                alt={fullName}
                className="size-full object-cover rounded-full"
              />
              <AvatarFallback className="rounded-full text-xl font-black text-cyan-400 bg-white/5 select-none font-mono flex items-center justify-center size-full">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Meta Information */}
          <div className="min-w-0 space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight font-sans tracking-tight">
                {fullName}
              </h2>
              <span className="self-center sm:self-auto text-[10px] font-bold font-mono text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20 shadow-sm w-fit">
                {role}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs text-[#A2A0C2] font-semibold">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} className="size-4 text-cyan-400" />
                <span>{city}</span>
              </div>
              <span className="hidden sm:inline text-[#5C5A78]">•</span>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Mail01Icon} className="size-4 text-violet-400" />
                <span className="font-mono text-[11px] lowercase text-[#A2A0C2]">{email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Action button */}
        <button
          onClick={() => navigate('/profile/edit')}
          className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 text-xs transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_22px_rgba(139,92,246,0.35)] cursor-pointer active:scale-[0.98]"
        >
          <HugeiconsIcon icon={Edit02Icon} className="size-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}
