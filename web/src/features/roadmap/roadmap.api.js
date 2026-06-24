import api from '@/api/api';

/**
 * Fetch the list of roadmaps for the logged-in user with an optional status filter.
 */
export async function getRoadmaps({ status, careerId } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (careerId) params.set('career_id', careerId);
  return await api.get(`/roadmaps/list?${params.toString()}`);
}

/**
 * Fetch details of a single roadmap by database ID.
 */
export async function getRoadmapDetails(id) {
  return await api.get(`/roadmaps/${id}`);
}

/**
 * Post a request to generate a personalized career roadmap.
 */
export async function generateRoadmap({ careerId, hoursPerWeek, targetMonths, budgetInr = 0 }) {
  return await api.post('/roadmaps/generate', {
    career_id: careerId,
    hours_per_week: hoursPerWeek,
    target_months: targetMonths,
    budget_inr: budgetInr
  });
}

/**
 * Patch a milestone completion update.
 */
export async function updateMilestone(roadmapId, { milestoneId, completed, note }) {
  return await api.patch(`/roadmaps/${roadmapId}/milestone`, {
    milestone_id: milestoneId,
    completed,
    note
  });
}
