import api from '@/api/api';

/**
 * Trigger AI career recommendations calculation.
 */
export async function generateRecommendations(forceRefresh = true) {
  return await api.post('/career/recommend', { force_refresh: forceRefresh });
}
