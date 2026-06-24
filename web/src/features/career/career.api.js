import api from '@/api/api';

/**
 * Retrieve list of careers with filtering, searching, and sorting.
 */
export async function getCareers({ page = 1, limit = 20, search = '', category = '', sort = 'recommended' } = {}) {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('limit', limit);
  if (search) query.append('search', search);
  if (category && category !== 'all' && category !== 'All') query.append('category', category);
  if (sort) query.append('sort', sort);

  return await api.get(`/careers?${query.toString()}`);
}

/**
 * Retrieve specific career details by slug.
 */
export async function getCareerDetails(slug) {
  return await api.get(`/careers/${slug}`);
}
