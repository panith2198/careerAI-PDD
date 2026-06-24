import api from '@/api/api';

/**
 * Retrieve comprehensive career dashboard metrics (skills, assessments, roadmaps, career fit trends).
 */
export async function getAnalyticsDashboard() {
  return await api.get('/analytics/dashboard');
}

/**
 * Retrieve timeseries demand trends for a specific skill.
 */
export async function getSkillDemandTrends(skillId, days = 30) {
  const query = new URLSearchParams();
  if (skillId) query.append('skill_id', skillId);
  query.append('days', days);
  
  return await api.get(`/analytics/skills/trend?${query.toString()}`);
}

/**
 * Retrieve user job applications list to compute application conversion funnel data.
 */
export async function getJobApplications() {
  return await api.get('/jobs/applications');
}
