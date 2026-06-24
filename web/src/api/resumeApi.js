import api from './api';

export function uploadResume(formData, onUploadProgress) {
  return api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });
}

export function getParseStatus(id) {
  return api.get(`/resume/${id}/status`);
}

export function getResumeDetail(id) {
  return api.get(`/resume/${id}`);
}

export function getResumeHistory() {
  return api.get('/resume/history');
}

export function deleteResume(id) {
  return api.delete(`/resume/${id}`);
}
