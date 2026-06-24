import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, addSkill, removeSkill } from '@/api/profileApi';

// Queries
export function useUserProfileQuery() {
  return useQuery({
    queryKey: ['profile', 'user'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
    },
  });
}

export function useAddSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSkill,
    onMutate: async (newSkill) => {
      await queryClient.cancelQueries({ queryKey: ['profile', 'user'] });
      const previousProfile = queryClient.getQueryData(['profile', 'user']);

      // Optimistically append the new skill to the list
      queryClient.setQueryData(['profile', 'user'], (old) => {
        if (!old) return old;
        const skillsList = Array.isArray(old.skills) ? old.skills : [];
        return {
          ...old,
          skills: [...skillsList, { ...newSkill, id: 'temp-id-' + Date.now(), is_optimistic: true }]
        };
      });

      return { previousProfile };
    },
    onError: (err, newSkill, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', 'user'], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
    },
  });
}

export function useRemoveSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeSkill,
    onMutate: async (userSkillId) => {
      await queryClient.cancelQueries({ queryKey: ['profile', 'user'] });
      const previousProfile = queryClient.getQueryData(['profile', 'user']);

      // Optimistically filter out the removed skill
      queryClient.setQueryData(['profile', 'user'], (old) => {
        if (!old) return old;
        const skillsList = Array.isArray(old.skills) ? old.skills : [];
        return {
          ...old,
          skills: skillsList.filter(s => s.id !== userSkillId && s.user_skill_id !== userSkillId)
        };
      });

      return { previousProfile };
    },
    onError: (err, userSkillId, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', 'user'], context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
    },
  });
}
