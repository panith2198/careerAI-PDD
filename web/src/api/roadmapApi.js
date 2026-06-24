import api from './api';

export function generateRoadmap(payload) {
  return api.post('/roadmaps/generate', payload);
}

export function getRoadmapList() {
  return api.get('/roadmaps/list');
}

export function getRoadmapById(id) {
  return api.get(`/roadmaps/${id}`);
}

export function updateMilestone(roadmapId, milestoneId, payload) {
  return api.patch(`/roadmaps/${roadmapId}/milestone`, {
    milestone_id: milestoneId,
    ...payload
  });
}
