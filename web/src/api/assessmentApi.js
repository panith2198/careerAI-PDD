import api from './api';

export function getAssessmentList(params) {
  return api.get('/assessments/list', { params });
}

export function startSession(id) {
  return api.post(`/assessments/${id}/start`);
}

export function submitAnswer(sessionId, payload) {
  return api.post(`/assessments/session/${sessionId}/answer`, payload);
}

export function submitSession(sessionId) {
  return api.post(`/assessments/session/${sessionId}/submit`);
}

export function getResults() {
  return api.get('/assessments/results');
}

export function getSkillGap(sessionId) {
  return api.get('/assessments/results').then((results) => {
    const list = Array.isArray(results) ? results : (results?.items || []);
    return list.find((r) => r.session_id === sessionId || r.id === sessionId) || null;
  });
}
