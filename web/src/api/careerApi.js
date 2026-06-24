import api from './api';

export function getCareerList(params) {
  return api.get('/careers', { params });
}

export function getCareerDetail(slug) {
  return api.get(`/careers/${slug}`);
}

export function getCareerPath(from, to) {
  return api.get('/careers/graph', {
    params: { from_role: from, to_role: to }
  });
}

export function getCareerRecommendations(forceRefresh = true) {
  return api.post('/career/recommend', { force_refresh: forceRefresh });
}
