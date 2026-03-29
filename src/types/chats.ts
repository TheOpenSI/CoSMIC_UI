export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type CachedChat = {
  chatID: string;
  createdAt: string;
  lastMessageCreatedAt: string;
  messages: Message[];
  // title
};
