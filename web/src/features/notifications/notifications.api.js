import api from '@/api/api';

/**
 * Fetch list of notifications for the logged-in user.
 */
export async function getNotifications(unreadOnly = null) {
  const query = new URLSearchParams();
  if (unreadOnly !== null) {
    query.append('unread_only', unreadOnly);
  }
  return await api.get(`/notifications/list?${query.toString()}`);
}

/**
 * Mark all unread notifications as read.
 */
export async function markAllRead() {
  return await api.patch('/notifications/read-all');
}

/**
 * Update the read status of a specific user notification.
 */
export async function markNotificationRead(id, isRead = true) {
  return await api.patch(`/notifications/${id}/read`, {
    is_read: isRead
  });
}

/**
 * Delete a specific notification record.
 */
export async function deleteNotification(id) {
  return await api.delete(`/notifications/${id}`);
}
