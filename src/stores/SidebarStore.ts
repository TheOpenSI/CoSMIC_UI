import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ActivePanel = "none" | "chats" | "admin";

type SidebarStore = {
  isOpen: boolean;
  open: () => void;

  active: ActivePanel;
  openAdmin: () => void;
  openChatPanel: () => void;
  collapseChatPanel: () => void;

  goNone: () => void;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: false,
      open: () => set({ isOpen: true }),

      active: "none",
      openAdmin: () => set({ active: "admin", isOpen: true }),
      openChatPanel: () => set({ active: "chats", isOpen: true }),

      collapseChatPanel: () => set({ active: "none", isOpen: false }),
      goNone: () => set({ active: "none", isOpen: false }),
    }),
    {
      name: "sidebar-store",
      // to make the sidebar working correctly, otherwise opens "chat panel" when users click admin page
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
