import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getJobList,
  getJobDetail,
  getInterviewTips,
  applyJob,
  toggleSaveJob,
  getApplications,
  getSavedJobs,
  getJobMatchScore
} from '@/api/jobsApi';

// Queries
export function useJobsInfiniteQuery(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['jobs', 'list', filters],
    queryFn: ({ pageParam = 1 }) => getJobList(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.items || lastPage.items.length === 0) return undefined;
      const loadedCount = allPages.reduce((acc, p) => acc + (p.items?.length || 0), 0);
      if (loadedCount >= (lastPage.total || 0)) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });
}

export function useJobDetailsQuery(id) {
  return useQuery({
    queryKey: ['jobs', 'detail', id],
    queryFn: () => getJobDetail(id),
    enabled: !!id,
  });
}

export function useInterviewTipsQuery(id) {
  return useQuery({
    queryKey: ['jobs', 'tips', id],
    queryFn: () => getInterviewTips(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
}

export function useSavedJobsQuery() {
  return useQuery({
    queryKey: ['jobs', 'saved'],
    queryFn: getSavedJobs,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useJobApplicationsQuery() {
  return useQuery({
    queryKey: ['jobs', 'applications'],
    queryFn: getApplications,
  });
}

export function useJobMatchScoreQuery(id) {
  return useQuery({
    queryKey: ['jobs', 'match-score', id],
    queryFn: () => getJobMatchScore(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useApplyJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => applyJob(id, payload),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'detail', id] });
    },
  });
}

export function useSaveJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isSaved }) => toggleSaveJob(id, isSaved),
    onMutate: async ({ id, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ['jobs'] });

      // Optimistically update list caches
      queryClient.setQueriesData({ queryKey: ['jobs', 'list'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((job) =>
              job.job_id === id || job.id === id ? { ...job, is_saved: !isSaved } : job
            ),
          })),
        };
      });

      // Optimistically update single job detail cache
      queryClient.setQueryData(['jobs', 'detail', id], (old) => {
        if (!old) return old;
        return { ...old, is_saved: !isSaved };
      });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}
