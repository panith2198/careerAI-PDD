import api from '@/api/api';

/**
 * Upload a PDF resume.
 * Uses FormData for multipart/form-data upload.
 */
export async function uploadResume(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);

  // Perform upload via Axios instance to ensure headers and refresh token interceptors are automatically applied
  return await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentComplete);
      }
    },
  });
}

/**
 * Fetch status of an active asynchronous resume parsing task.
 */
export async function getResumeStatus(id) {
  return await api.get(`/resume/${id}/status`);
}

/**
 * Fetch full structured detail analysis of a parsed resume.
 */
export async function getResumeDetails(id) {
  return await api.get(`/resume/${id}`);
}

/**
 * Fetch user upload history and scores list.
 */
export async function getResumeHistory({ page = 1 } = {}) {
  return await api.get(`/resume/history?page=${page}`);
}

/**
 * Delete a resume upload record.
 */
export async function deleteResume(id) {
  return await api.delete(`/resume/${id}`);
}
