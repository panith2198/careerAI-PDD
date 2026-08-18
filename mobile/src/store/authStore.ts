import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  refreshToken: string | null;
  user: unknown | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setToken: (token: string | null, refreshToken?: string | null) => void;
  setSession: (user: unknown | null, token: string, refreshToken?: string | null) => void;
  clearAuth: () => void;
};

const secureStorage = {
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setToken: (token, refreshToken) =>
        set((state) => ({
          token,
          refreshToken: refreshToken || state.refreshToken || token,
          isAuthenticated: Boolean(token),
        })),
      setSession: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken: refreshToken || token,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'careerai-mobile-auth',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
