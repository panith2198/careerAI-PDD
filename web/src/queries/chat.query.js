import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/api/axios';

// API Functions
export async function getChatSessions() {
  const response = await axios.get('/rag/sessions');
  return response.data;
}

export async function getSessionMessages(sessionId) {
  const response = await axios.get(`/rag/sessions/${sessionId}/messages`);
  return response.data;
}

export async function createChatSession(title) {
  const params = title ? { title } : {};
  const response = await axios.post('/rag/sessions', null, { params });
  return response.data;
}

export async function deleteChatSession(sessionId) {
  const response = await axios.delete(`/rag/sessions/${sessionId}`);
  return response.data;
}

export async function clearAllSessions() {
  const response = await axios.delete('/rag/sessions');
  return response.data;
}

// Queries
export function useChatSessionsQuery() {
  return useQuery({
    queryKey: ['chat', 'history'],
    queryFn: getChatSessions,
    staleTime: 0, // Always fresh
  });
}

export function useSessionMessagesQuery(sessionId) {
  return useQuery({
    queryKey: ['chat', 'messages', sessionId],
    queryFn: () => getSessionMessages(sessionId),
    enabled: !!sessionId,
    staleTime: 0,
  });
}

// Mutations
export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title) => createChatSession(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] });
    },
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] });
    },
  });
}

export function useClearSessionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] });
    },
  });
}

// Helper to manually save a message to the React Query cache after SSE ends
export function useSaveChatMessageToCache() {
  const queryClient = useQueryClient();
  return (sessionId, message) => {
    queryClient.setQueryData(['chat', 'messages', sessionId], (oldMessages) => {
      const messagesList = Array.isArray(oldMessages) ? oldMessages : [];
      return [...messagesList, message];
    });
    // Invalidate history to update previews
    queryClient.invalidateQueries({ queryKey: ['chat', 'history'] });
  };
}
