import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      isMobileSidebarOpen: false,
      isSidebarCollapsed: false,
      
      openSidebar: () => set({ isMobileSidebarOpen: true }),
      closeSidebar: () => set({ isMobileSidebarOpen: false }),
      toggleSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      
      toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (isCollapsed) => set({ isSidebarCollapsed: isCollapsed }),
      
      reset: () => set({ isMobileSidebarOpen: false })
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ isSidebarCollapsed: state.isSidebarCollapsed })
    }
  )
);

export default useUiStore;
