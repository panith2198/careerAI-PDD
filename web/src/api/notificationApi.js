import api from './api';

export function getNotifications(params = {}) {
  const unreadOnly = params.unreadOnly !== undefined ? params.unreadOnly : params.unread_only;
  
  const queryParams = {};
  if (unreadOnly !== undefined && unreadOnly !== null) {
    queryParams.unread_only = unreadOnly;
  }
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;

  return api.get('/notifications/list', { params: queryParams });
}

export function markRead(id) {
  return api.patch(`/notifications/${id}/read`, { is_read: true });
}

export function markAllRead() {
  return api.patch('/notifications/read-all');
}

export function getUnreadCount() {
  return api.get('/notifications/list', { params: { unread_only: true } }).then((data) => {
    return data?.total || (data?.items || []).length;
  });
}
