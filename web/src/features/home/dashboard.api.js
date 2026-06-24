import api from '@/api/api';

/**
 * Retrieve career recommendations for the user.
 * Triggered as a POST to support force-refresh calculation options.
 */
export async function getCareerRecommendations(forceRefresh = false) {
  return await api.post('/career/recommend', { force_refresh: forceRefresh });
}

/**
 * Retrieve comprehensive user analytics dashboard telemetry.
 */
export async function getAnalyticsDashboard() {
  return await api.get('/analytics/dashboard');
}

/**
 * Retrieve list of user's active learning roadmaps.
 */
export async function getRoadmapStatus() {
  return await api.get('/roadmap/list?status=active');
}

/**
 * Retrieve semantically matching jobs list for the candidate user.
 */
export async function getJobsMatchCount() {
  return await api.post('/jobs/match');
}
