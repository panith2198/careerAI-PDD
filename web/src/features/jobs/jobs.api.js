import api from '@/api/api';

/**
 * Retrieve paginated active job listings with filter queries.
 */
export async function getJobs({ city = '', workMode = '', jobType = '', careerId = '', page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('limit', limit);
  if (city) query.append('city', city);
  if (workMode && workMode !== 'all') query.append('work_mode', workMode);
  if (jobType && jobType !== 'all') query.append('job_type', jobType);
  if (careerId) query.append('career_id', careerId);

  return await api.get(`/jobs/list?${query.toString()}`);
}

/**
 * Retrieve full details of a specific job listing by database ID.
 */
export async function getJobDetails(id) {
  return await api.get(`/jobs/${id}`);
}

/**
 * Retrieve custom AI-generated interview preparation tips for a job by database ID.
 */
export async function getInterviewTips(id) {
  return await api.get(`/jobs/${id}/tips`);
}

/**
 * Apply to a specific job listing with a resume ID and a cover note.
 */
export async function applyToJob(id, { resumeId, coverNote }) {
  return await api.post(`/jobs/${id}/apply`, {
    resume_id: resumeId,
    cover_note: coverNote
  });
}

/**
 * Save/bookmark a job listing.
 */
export async function saveJob(id) {
  return await api.post(`/jobs/${id}/save`);
}

/**
 * Unsave/remove a job bookmark.
 */
export async function unsaveJob(id) {
  return await api.delete(`/jobs/${id}/save`);
}

/**
 * Fetch the history of job applications submitted by the current user.
 */
export async function getJobApplications({ page = 1, status = '' } = {}) {
  const params = new URLSearchParams();
  params.append('page', page);
  if (status) params.append('status', status);

  return await api.get(`/jobs/applications?${params.toString()}`);
}

/**
 * Fetch AI job semantic match scores for the current user's profile.
 */
export async function getSemanticMatches() {
  return await api.post('/jobs/match');
}

/**
 * Post a new job listing natively.
 */
export async function createJob(jobData) {
  return await api.post('/jobs/create', jobData);
}

/**
 * Trigger background job synchronization.
 */
export async function syncJobs(source = 'indeed') {
  return await api.post('/jobs/sync', { source });
}


