import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Briefcase01Icon,
  RouteIcon,
  BrainIcon,
  BellIcon,
  UserGroupIcon,
  Alert01Icon
} from '@hugeicons/core-free-icons';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  'job_match': Briefcase01Icon,
  'roadmap': RouteIcon,
  'ai_tip': BrainIcon,
  'system': BellIcon
};

const TYPE_COLORS = {
  'job_match': 'text-amber-400 border-amber-500/20 bg-amber-950/20',
  'roadmap': 'text-[#A78BFA] border-violet-500/20 bg-violet-950/20',
  'ai_tip': 'text-cyan-400 border-cyan-500/20 bg-cyan-950/20',
  'system': 'text-rose-400 border-rose-500/20 bg-rose-950/20'
};

export default function NotificationCard({ notification, onRead, onDismiss }) {
  const navigate = useNavigate();
  const xValue = useMotionValue(0);

  const relativeTime = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
    } catch (e) {
      return 'Recently';
    }
  }, [notification.created_at]);

  const handleDragEnd = (event, info) => {
    // If swiped more than 120px left or right, trigger dismiss
    if (Math.abs(info.offset.x) > 120) {
      onDismiss(notification.id);
    }
  };

  const handleClick = (e) => {
    // Call read handler
    if (!notification.is_read) {
      onRead(notification.id);
    }
    // Route navigation
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const IconComponent = TYPE_ICONS[notification.type] || Alert01Icon;
  const colorClass = TYPE_COLORS[notification.type] || 'text-slate-400 border-slate-500/10 bg-slate-950/10';

  return (
    <motion.div
      layout
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
      style={{ x: xValue }}
      whileTap={{ scale: 0.98 }}
      className="relative select-none w-full"
    >
      {/* Background delete indicator visible during swipes */}
      <div className="absolute inset-0 bg-rose-600/10 border border-rose-500/20 rounded-2xl flex items-center justify-between px-6 pointer-events-none font-mono text-[10px] font-bold text-rose-400 uppercase tracking-widest">
        <span>Dismissing...</span>
        <span>Dismissing...</span>
      </div>

      {/* Main glass card content container */}
      <div
        onClick={handleClick}
        className={`relative bg-[#09090E]/90 hover:bg-white/[0.04] border ${
          notification.is_read ? 'border-white/5' : 'border-violet-500/20'
        } backdrop-blur-2xl rounded-2xl p-5 flex items-start gap-4 transition-colors cursor-pointer w-full group shadow-md`}
      >
        {/* Category Icon Badge */}
        <div className={`p-2.5 rounded-xl border shrink-0 ${colorClass}`}>
          <HugeiconsIcon icon={IconComponent} className="size-5 shrink-0" />
        </div>

        {/* Content detail area */}
        <div className="space-y-1 flex-1 pr-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className={`text-xs font-bold text-white transition-colors group-hover:text-violet-400 leading-snug ${
              notification.is_read ? 'font-medium text-[#A2A0C2]' : 'font-extrabold text-white'
            }`}>
              {notification.title}
            </h4>
          </div>
          <p className="text-xs text-[#8280A3] leading-relaxed">
            {notification.message}
          </p>
          <span className="text-[9px] font-bold font-mono text-[#5C5A78] uppercase tracking-wider block pt-1">
            {relativeTime}
          </span>
        </div>

        {/* Unread dot indicator top right */}
        {!notification.is_read && (
          <span className="absolute top-5 right-5 size-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
        )}
      </div>
    </motion.div>
  );
}
