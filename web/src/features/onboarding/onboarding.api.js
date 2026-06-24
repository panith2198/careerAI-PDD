import api from '@/api/api';

/**
 * Update current user's profile with career interests, preferred work mode, and expected salary.
 * @param {Object} payload 
 * @param {Array<string>} payload.career_interests
 * @param {string} payload.preferred_work_mode
 * @param {number} payload.expected_salary
 */
export async function updateUserProfile(payload) {
  return await api.put('/users/me', {
    career_interests: payload.career_interests,
    preferred_work_mode: payload.preferred_work_mode,
    expected_salary: payload.expected_salary,
  });
}
