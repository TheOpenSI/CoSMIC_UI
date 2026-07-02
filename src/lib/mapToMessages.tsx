import type { ChatDetail, Message } from "../types/chats";
import { v4 as uuidv4 } from "uuid";

export function mapToMessages(details: ChatDetail[]) {
  const messages: Message[] = [];

  details.forEach((item) => {
    // now we take user message
    if (item.user_query) {
      // Extract file reference to show the attachment chip
      const match = item.user_query.match(/^<files>(.*?)<\/files>([\s\S]*)$/);
      let content = item.user_query;
      let fileName: string | undefined;
      if (match) {
        const ref = match[1].split(",")[0] ?? "";
        const underscore = ref.indexOf("_");
        fileName = underscore > -1 ? ref.slice(underscore + 1) : ref;
        content = match[2];
      }
      messages.push({
        id: uuidv4(),
        role: "user",
        content,
        fileName,
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
