import api from '@/api/api';

/**
 * Retrieve active assessments list with optional career and skill filters.
 */
export async function getAssessments({ careerId, skillId } = {}) {
  const params = new URLSearchParams();
  if (careerId) params.append('career_id', careerId);
  if (skillId) params.append('skill_id', skillId);

  return await api.get(`/assessments/list?${params.toString()}`);
}

/**
 * Retrieve the historical results of completed assessments for the current user.
 */
export async function getAssessmentHistory() {
  return await api.get('/assessments/results');
}
