import api from './axios';

export async function getUserProfile() {
  const response = await api.get('/users/me');
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.put('/users/me', data);
  return response.data;
}

export async function addSkill(skillData) {
  const response = await api.post('/users/me/skills', skillData);
  return response.data;
}

export async function removeSkill(userSkillId) {
  const response = await api.delete(`/users/me/skills/${userSkillId}`);
  return response.data;
}

export async function changePassword(passwordData) {
  const response = await api.post('/users/me/password', passwordData);
  return response.data;
}

export async function uploadAvatar(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/users/me/avatar', formData, {
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
  return response.data;
}
