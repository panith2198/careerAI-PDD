import api from './axios';

export async function getJobs({ city = '', workMode = '', careerId = '', page = 1, limit = 10 } = {}) {
  const params = { page, limit };
  if (city) params.city = city;
  if (workMode && workMode !== 'all') params.work_mode = workMode;
  if (careerId) params.career_id = careerId;

  const response = await api.get('/jobs/list', { params });
  return response.data;
}

export async function getJobDetails(id) {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
}

export async function getInterviewTips(id) {
  const response = await api.get(`/jobs/${id}/tips`);
  return response.data;
}

export async function applyToJob(id, { resumeId, coverNote }) {
  const response = await api.post(`/jobs/${id}/apply`, {
    resume_id: resumeId,
    cover_note: coverNote
  });
  return response.data;
}

export async function saveJob(id) {
  const response = await api.post(`/jobs/${id}/save`);
  return response.data;
}

export async function unsaveJob(id) {
  const response = await api.delete(`/jobs/${id}/save`);
  return response.data;
}

export async function getJobApplications({ page = 1, status = '' } = {}) {
  const params = { page };
  if (status) params.status = status;

  const response = await api.get('/jobs/applications', { params });
  return response.data;
}

export async function getSemanticMatches() {
  const response = await api.post('/jobs/match');
  return response.data;
}

export async function toggleSaveJob(id, isSaved) {
  if (isSaved) {
    return await unsaveJob(id);
  } else {
    return await saveJob(id);
  }
}
