import api from './api';

export function getProfile() {
  return api.get('/users/me');
}

export function updateProfile(payload) {
  return api.put('/users/me', payload);
}

export function addSkill(payload) {
  return api.post('/users/me/skills', payload);
}

export function removeSkill(skillId) {
  return api.delete(`/users/me/skills/${skillId}`);
}

export function uploadAvatar(formData, onProgress) {
  return api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    }
  });
}

export function searchSkills(query) {
  return api.get('/skills/search', { params: { query } });
}
