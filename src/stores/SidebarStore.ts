import { create } from "zustand";

type SidebarStore = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
