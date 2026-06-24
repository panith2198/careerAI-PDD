import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    () => ({
      theme: 'dark',
      toggle: () => {},
      setTheme: () => {},
      toggleTheme: () => {}
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => () => {
        if (typeof window !== 'undefined') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      }
    }
  )
);

// Apply initial dark class immediately in case hydration hasn't occurred yet
if (typeof window !== 'undefined') {
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');
}

export default useThemeStore;
