/// --- Core libraries --- ///
import { create } from "zustand";
import {
	createJSONStorage,
	persist
} from "zustand/middleware";


/// --- Type hints --- ///


/// --- Internal libraries --- ///


type ActivePanel = "none" | "chats" | "settings";

type SidebarStore = {
	isOpen: boolean;
	open: () => void;

	active: ActivePanel;
	openSettings: () => void;
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
			openSettings: () => set({ active: "settings", isOpen: true }),
			openChatPanel: () => set({ active: "chats", isOpen: true }),

			collapseChatPanel: () => set({ active: "none", isOpen: false }),
			goNone: () => set({ active: "none", isOpen: false }),
		}),
		{
			name: "sidebar-store",
			// to make the sidebar working correctly, otherwise opens "chat panel" when
			// users click settings page
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
