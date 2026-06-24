import { updateMilestone } from './roadmap.api';

/**
 * Toggle milestone completion status in the backend.
 */
export async function toggleMilestone({ roadmapId, milestoneId, completed }) {
  return await updateMilestone(roadmapId, { milestoneId, completed });
}
