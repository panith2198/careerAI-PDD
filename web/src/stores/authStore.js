import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setToken: (token, refreshToken) => set((state) => ({
        token,
        refreshToken: refreshToken || state.refreshToken || token,
        isAuthenticated: !!token
      })),
      
      clearAuth: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),

      // Compatibility methods for existing codebase
      login: (user, token) => set({ user, token, refreshToken: token, isAuthenticated: true }),
      logout: () => set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
      initializeSession: () => {} // Persist middleware handles hydration automatically
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
