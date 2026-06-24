import api from './api';

export function getDashboard() {
  return api.get('/analytics/dashboard');
}

export function getSkillTrend(params = {}) {
  const skill_id = params.skillId || params.skill_id;
  const days = params.days || 30;
  return api.get('/analytics/skills/trend', {
    params: { skill_id, days }
  });
}

export function getJobTrend() {
  return api.get('/jobs/applications');
}
