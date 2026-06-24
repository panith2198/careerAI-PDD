import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generateRoadmap, getRoadmapList, getRoadmapById, updateMilestone } from '@/api/roadmapApi';

export function useRoadmapsQuery() {
  return useQuery({
    queryKey: ['roadmap', 'list'],
    queryFn: () => getRoadmapList(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useRoadmapDetailsQuery(id) {
  return useQuery({
    queryKey: ['roadmap', 'detail', id],
    queryFn: () => getRoadmapById(id),
    enabled: !!id,
  });
}

export function useRoadmapPollingQuery(id, options = {}) {
  return useQuery({
    queryKey: ['roadmap', 'detail', id],
    queryFn: () => getRoadmapById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'active' || data.status === 'done')) {
        return false; // Stop polling
      }
      return 3000; // Poll every 3 seconds
    },
    ...options
  });
}

export function useGenerateRoadmapMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', 'list'] });
    },
  });
}

export function useUpdateMilestoneMutation(roadmapId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateMilestone(roadmapId, payload.milestoneId, payload),
    onMutate: async (payload) => {
      const { milestoneId, completed } = payload;
      await queryClient.cancelQueries({ queryKey: ['roadmap', 'detail', roadmapId] });
      const previousRoadmap = queryClient.getQueryData(['roadmap', 'detail', roadmapId]);

      // Optimistically update the milestone completed status
      queryClient.setQueryData(['roadmap', 'detail', roadmapId], (old) => {
        if (!old) return old;
        return {
          ...old,
          phases: old.phases.map(phase => ({
            ...phase,
            milestones: phase.milestones.map(ms => 
              ms.id === milestoneId || ms.milestone_id === milestoneId
                ? { ...ms, completed } 
                : ms
            )
          }))
        };
      });

      return { previousRoadmap };
    },
    onError: (err, payload, context) => {
      if (context?.previousRoadmap) {
        queryClient.setQueryData(['roadmap', 'detail', roadmapId], context.previousRoadmap);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', 'detail', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmap', 'list'] });
    },
  });
}
