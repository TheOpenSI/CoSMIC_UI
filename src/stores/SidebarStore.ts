import { create } from "zustand";

type ActivePanel = "none" | "chats" | "admin";

type SidebarStore = {
  isOpen: boolean;
  open: () => void;

  active: ActivePanel;
  openAdmin: () => void;
  openChatPanel: () => void;
  collapseChatPanel: () => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),

  active: "none",
  openAdmin: () => set({ active: "admin" }),
  openChatPanel: () => set({ active: "chats", isOpen: true }),

  collapseChatPanel: () => set({ active: "none", isOpen: false }),
}));
