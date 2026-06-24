import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CareerListSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-[#161525]/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-start md:items-center gap-4 flex-1">
            <Skeleton className="size-12 rounded-xl shrink-0 bg-white/5" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48 bg-white/5" />
              <Skeleton className="h-4 w-full max-w-lg bg-white/5" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-16 bg-white/5 rounded-md" />
                <Skeleton className="h-5 w-16 bg-white/5 rounded-md" />
                <Skeleton className="h-5 w-16 bg-white/5 rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t border-white/5 md:border-none pt-4 md:pt-0">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full bg-white/5" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-12 bg-white/5" />
                <Skeleton className="h-3 w-8 bg-white/5" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 bg-white/5 rounded-full" />
            <Skeleton className="h-10 w-28 bg-white/5 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
