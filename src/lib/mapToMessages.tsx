import type { ChatDetail, Message } from "../types/chats";
import { v4 as uuidv4 } from "uuid";

export function mapToMessages(details: ChatDetail[]) {
  const messages: Message[] = [];

  details.forEach((item) => {
    // now we take user message
    if (item.user_query) {
      messages.push({
        id: uuidv4(),
        role: "user",
        content: item.user_query,
      });
    }

    // 2. then we take AI message
    if (item.llm_response) {
      messages.push({
        id: uuidv4(),
        role: "assistant",
        content: item.llm_response,
      });
    }
  });

  return messages;
}
