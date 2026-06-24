import api from '@/api/api';

/**
 * Retrieve the AI transition path between two careers.
 */
export async function getCareerGraph(fromRole, toRole) {
  const query = new URLSearchParams();
  query.append('from_role', fromRole);
  query.append('to_role', toRole);
  return await api.get(`/careers/graph?${query.toString()}`);
}

/**
 * Retrieve specific career details by slug.
 */
export async function getCareerDetails(slug) {
  return await api.get(`/careers/${slug}`);
}

/**
 * Retrieve list of all careers to populate role selectors.
 */
export async function getCareersList() {
  const data = await api.get('/careers?limit=100');
  return data?.items || [];
}
