import api from '@/api/api';

/**
 * Retrieve all chat sessions for the authenticated user.
 */
export async function getChatSessions() {
  return await api.get('/rag/sessions');
}

/**
 * Retrieve all messages in a specific chat session.
 */
export async function getSessionMessages(sessionId) {
  return await api.get(`/rag/sessions/${sessionId}/messages`);
}

/**
 * Create a new chat session.
 */
export async function createChatSession(title) {
  const query = title ? `?title=${encodeURIComponent(title)}` : '';
  return await api.post(`/rag/sessions${query}`);
}

/**
 * Delete a specific chat session.
 */
export async function deleteChatSession(sessionId) {
  return await api.delete(`/rag/sessions/${sessionId}`);
}

/**
 * Clear all chat sessions and messages for the user.
 */
export async function clearAllSessions() {
  return await api.delete('/rag/sessions');
}

/**
 * Send chat message with optional file upload (multipart/form-data) to the /rag/chat endpoint.
 */
export async function sendChatWithFile(query, sessionId, file, collection = 'careers') {
  const formData = new FormData();
  formData.append('query', query);
  formData.append('collection', collection);
  if (sessionId) {
    formData.append('session_id', sessionId.toString());
  }
  if (file) {
    formData.append('file', file);
  }
  return await api.post('/rag/chat', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

