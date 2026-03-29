import { openDB } from "idb";
import type { CachedChat, Message } from "../types/chats";

const DB_NAME = "cosmic";
const STORE = "chats";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

export async function loadChat(chatID: string): Promise<CachedChat | null> {
  const db = await getDb();
  return (await db.get(STORE, chatID)) ?? null;
}

export async function saveChat(chatID: string, messages: Message[]) {
  const db = await getDb();

  const existing = await db.get(STORE, chatID);

  const chat: CachedChat = {
    chatID,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    lastMessageCreatedAt: new Date().toISOString(),
    messages,
    title:
      existing?.title ??
      messages.find((m) => m.role === "user")?.content.slice(0, 50) ??
      "New chat",
  };

  await db.put(STORE, chat, chatID);
}
