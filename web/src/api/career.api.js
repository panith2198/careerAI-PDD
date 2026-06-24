import api from './axios';

export async function getCareers({ page = 1, limit = 20, search = '', category = '', sort = 'recommended' } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (category && category !== 'all' && category !== 'All') params.category = category;
  if (sort) params.sort = sort;

  const response = await api.get('/careers', { params });
  return response.data;
}

export async function getCareerDetails(slug) {
  const response = await api.get(`/careers/${slug}`);
  return response.data;
}

export async function generateRecommendations(forceRefresh = true) {
  const response = await api.post('/career/recommend', { force_refresh: forceRefresh });
  return response.data;
}

export async function getCareerGraph(fromRole, toRole) {
  const response = await api.get('/careers/graph', {
    params: { from_role: fromRole, to_role: toRole }
  });
  return response.data;
}

export async function getCareersList() {
  const response = await api.get('/careers', { params: { limit: 100 } });
  return response.data?.items || [];
}
