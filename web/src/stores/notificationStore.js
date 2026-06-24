import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  // Unread badge count
  unreadCount: 0,
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrement: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
  setUnreadCount: (count) => set({ unreadCount: count }), // Helper to set count directly

  // Notification Preferences (for SettingsPage compatibility)
  jobAlerts: true,
  aiRecommendations: true,
  emailUpdates: false,
  setSettings: (settings) => set((state) => ({ ...state, ...settings })),
  toggleSetting: (key) => set((state) => ({ [key]: !state[key] }))
}));

export default useNotificationStore;
