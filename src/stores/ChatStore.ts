import { create } from "zustand";
import type { Message } from "../types/chats";

type ChatStore = {
  messagesByChat: { [chatID: string]: Message[] };
  loadingByChat: { [chatID: string]: boolean };
  optimisticTitleByChat: { [chatID: string]: string };
  setMessages: (chatID: string, messages: Message[]) => void;
  setLoading: (chatID: string, loading: boolean) => void;
  setOptimisticTitle: (chatID: string, title: string) => void;
  resetChat: (chatID: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messagesByChat: {},
  loadingByChat: {},
  optimisticTitleByChat: {},
  setMessages: (chatID, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatID]: messages,
      },
    })),
  setLoading: (chatID, loading) =>
    set((state) => ({
      loadingByChat: {
        ...state.loadingByChat,
        [chatID]: loading,
      },
    })),
  setOptimisticTitle: (chatID, title) =>
    set((state) => ({
      optimisticTitleByChat: {
        ...state.optimisticTitleByChat,
        [chatID]: title,
      },
    })),
  resetChat: (chatID) =>
    set((state) => {
      const messagesByChat = { ...state.messagesByChat };
      const loadingByChat = { ...state.loadingByChat };
      const optimisticTitleByChat = { ...state.optimisticTitleByChat };
      delete messagesByChat[chatID];
      delete loadingByChat[chatID];
      delete optimisticTitleByChat[chatID];
      return { messagesByChat, loadingByChat, optimisticTitleByChat };
    }),
}));
