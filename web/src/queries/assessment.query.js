import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/api/axios';

// API Functions
export async function getAssessments(filters = {}) {
  const response = await axios.get('/assessments/list', { params: filters });
  return response.data;
}

export async function getAssessmentHistory() {
  const response = await axios.get('/assessments/results');
  return response.data;
}

export async function startAssessmentSession(id) {
  const response = await axios.post(`/assessments/${id}/start`);
  return response.data;
}

export async function submitSessionAnswer({ sessionId, questionId, selectedOptionId, timeTakenMs }) {
  const response = await axios.post(`/assessments/session/${sessionId}/answer`, {
    question_id: questionId,
    selected_option_id: selectedOptionId,
    time_taken_ms: timeTakenMs
  });
  return response.data;
}

export async function submitAssessmentSession(sessionId) {
  const response = await axios.post(`/assessments/session/${sessionId}/submit`);
  return response.data;
}

// Queries
export function useAssessmentsQuery(filters = {}) {
  return useQuery({
    queryKey: ['assessment', 'list', filters],
    queryFn: () => getAssessments(filters),
  });
}

export function useAssessmentHistoryQuery() {
  return useQuery({
    queryKey: ['assessment', 'results'],
    queryFn: getAssessmentHistory,
    staleTime: 0,
  });
}

// Mutations
export function useStartAssessmentMutation() {
  return useMutation({
    mutationFn: (id) => startAssessmentSession(id),
  });
}

export function useSubmitAnswerMutation() {
  return useMutation({
    mutationFn: submitSessionAnswer,
    // Note: No cache invalidation per requirements for active session
  });
}

export function useSubmitAssessmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => submitAssessmentSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'results'] });
      queryClient.invalidateQueries({ queryKey: ['profile', 'user'] });
    },
  });
}
