import api from './api';

export function getHistory() {
  return api.get('/rag/sessions');
}
