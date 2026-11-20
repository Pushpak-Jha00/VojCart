import { create } from "zustand";

const useUIStore = create((set) => ({
  sidebarOpen: false,

  setSidebarOpen: (value) => set({ sidebarOpen: value }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  closeSidebar: () => set({ sidebarOpen: false }),
}));

export default useUIStore;
