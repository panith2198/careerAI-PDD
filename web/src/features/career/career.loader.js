import { getCareerDetails } from './career.api';

export async function careerLoader({ params }) {
  const { slug } = params;
  if (!slug) {
    throw new Response('Slug is required', { status: 400 });
  }
  try {
    const data = await getCareerDetails(slug);
    return data;
  } catch (error) {
    throw new Response(error.message || 'Failed to load career data', { status: 500 });
  }
}

export default careerLoader;
