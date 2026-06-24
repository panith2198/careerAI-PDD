import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { SparklesIcon, BellIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Skeleton } from '@/components/ui/skeleton';

import {
  getNotifications,
  markAllRead,
  markNotificationRead,
  deleteNotification
} from './notifications.api';
import NotificationFilters from './NotificationFilters';
import NotificationCard from './NotificationCard';
import EmptyNotifications from './EmptyNotifications';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');

  // 1. Fetch user notifications
  const { data: notificationsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notificationsList'],
    queryFn: () => getNotifications()
  });

  // 2. Mark all as read mutation (Optimistic update)
  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notificationsList'] });
      const previousNotifications = queryClient.getQueryData(['notificationsList']);

      queryClient.setQueryData(['notificationsList'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(item => ({ ...item, is_read: true }))
        };
      });

      return { previousNotifications };
    },
    onError: (err, newValues, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notificationsList'], context.previousNotifications);
      }
      toast.error('Failed to mark all as read. Resyncing...');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
    }
  });

  // 3. Mark single notification as read mutation (Optimistic update)
  const readMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id, true),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notificationsList'] });
      const previousNotifications = queryClient.getQueryData(['notificationsList']);

      queryClient.setQueryData(['notificationsList'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(item => item.id === id ? { ...item, is_read: true } : item)
        };
      });

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notificationsList'], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
    }
  });

  // 4. Swipe delete mutation (Optimistic update)
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notificationsList'] });
      const previousNotifications = queryClient.getQueryData(['notificationsList']);

      queryClient.setQueryData(['notificationsList'], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter(item => item.id !== id)
        };
      });

      return { previousNotifications };
    },
    onError: (err, id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notificationsList'], context.previousNotifications);
      }
      toast.error('Failed to dismiss alert. Resyncing...');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsList'] });
    }
  });

  const handleMarkAllRead = () => {
    // Check if there are unread items
    const items = notificationsData?.items || [];
    const hasUnread = items.some(i => !i.is_read);
    if (!hasUnread) {
      toast.info('No unread notifications to clear.');
      return;
    }
    readAllMutation.mutate();
  };

  const handleReadNotification = (id) => {
    readMutation.mutate(id);
  };

  const handleDismissNotification = (id) => {
    deleteMutation.mutate(id);
  };

  // Filter items based on active category
  const filteredNotifications = useMemo(() => {
    const items = notificationsData?.items || [];
    if (activeCategory === 'All') return items;
    
    // Map category tabs to notification types
    const catMap = {
      'Jobs': ['job_match'],
      'Roadmap': ['roadmap'],
      'AI': ['ai_tip'],
      'System': ['system']
    };
    
    const targetTypes = catMap[activeCategory] || [];
    return items.filter(item => targetTypes.includes(item.type));
  }, [notificationsData, activeCategory]);

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-6 pb-20 select-none">
      {/* Sci-Fi Deep Space Glowing Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-violet-600/[0.04] blur-[140px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[45%] h-[45%] rounded-full bg-cyan-600/[0.03] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Header section with hero glass card */}
      <header className="relative z-10 w-full select-none bg-white/[0.01] border border-white/5 backdrop-blur-2xl rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="space-y-2 relative z-10 text-center sm:text-left">
          <span className="text-[10px] font-bold font-mono text-[#A2A0C2] uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5 text-violet-400 animate-pulse" />
            <span>AI Updates & Inbox</span>
          </span>
          <h1
            className="text-2xl md:text-3xl font-black text-white leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Notifications
          </h1>
          <p className="text-xs text-[#A2A0C2] max-w-sm leading-relaxed">
            Stay updated with your AI career journey, skill assessments, and matching vacancies.
          </p>
        </div>

        {/* Mark All As Read action button */}
        <button
          onClick={handleMarkAllRead}
          disabled={readAllMutation.isPending}
          className="shrink-0 px-4 py-3 bg-white/5 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/30 rounded-xl text-xs font-mono font-bold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 relative z-10"
        >
          <HugeiconsIcon icon={Tick02Icon} className="size-4 text-[#A78BFA]" />
          <span>Mark all as read</span>
        </button>
      </header>

      {/* Categories filter selector chips */}
      <section className="relative z-20">
        {isLoading ? (
          <div className="flex flex-wrap gap-2 select-none">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-20 rounded-xl bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : (
          <NotificationFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}
      </section>

      {/* Main notifications feed listing */}
      <main className="relative z-10 max-w-7xl w-full mx-auto mt-2">
        {isLoading ? (
          // Skeleton Loading State
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 h-24 flex gap-4 items-start"
              >
                <Skeleton className="size-10 rounded-xl bg-white/5 border border-white/5 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 rounded-md w-1/3 bg-white/5" />
                  <Skeleton className="h-3 rounded-md w-3/4 bg-white/5" />
                  <Skeleton className="h-2.5 rounded-md w-12 bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-3xl select-none">
            <p className="text-xs font-mono text-rose-400">Failed to load alerts: {error?.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 border border-white/10 text-white rounded-xl text-xs hover:bg-white/5 cursor-pointer font-mono"
            >
              Retry Sync
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          // Empty state display
          <EmptyNotifications />
        ) : (
          // Active notifications stacked feed with slide animations
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
                  className="w-full"
                >
                  <NotificationCard
                    notification={notification}
                    onRead={handleReadNotification}
                    onDismiss={handleDismissNotification}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
