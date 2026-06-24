import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCareerList, getCareerDetail, getCareerRecommendations } from '@/api/careerApi';

export function useCareersQuery(filters = {}) {
  return useQuery({
    queryKey: ['career', 'list', filters],
    queryFn: () => getCareerList(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCareerDetailQuery(slug) {
  return useQuery({
    queryKey: ['career', 'detail', slug],
    queryFn: () => getCareerDetail(slug),
    enabled: !!slug && slug !== 'undefined',
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRecommendCareersMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (forceRefresh) => getCareerRecommendations(forceRefresh),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career', 'list'] });
    },
  });
}
