import api from './api';

export function getJobList(params, page = 1) {
  return api.get('/jobs/list', { params: { ...params, page } });
}

export function getJobDetail(id) {
  return api.get(`/jobs/${id}`);
}

export function applyJob(id, payload) {
  return api.post(`/jobs/${id}/apply`, payload);
}

export function saveJob(id) {
  return api.post(`/jobs/${id}/save`);
}

export function unsaveJob(id) {
  return api.delete(`/jobs/${id}/save`);
}

export function getSavedJobs() {
  return api.get('/jobs/applications', { params: { status: 'saved' } });
}

export function getApplications() {
  return api.get('/jobs/applications');
}

export function getJobMatchScore(id) {
  return api.post('/jobs/match').then((data) => {
    const scores = data?.match_scores || {};
    return scores[String(id)] || 0;
  });
}
