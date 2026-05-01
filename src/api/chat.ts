import type {
  Chat,
  ChatSessionsResponse,
  Message,
  OneChatSessionResponse,
} from "../types/chats";
import { fetchWithAuth } from "./fetchWithAuth";

export async function sendMessage(
  message: string,
  chatHistory: Message[],
  chatID: string | null,
  title: string,
  signal?: AbortSignal,
) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/cosmic`,
    {
      method: "POST",
      signal,
      body: JSON.stringify({
        chat_id: chatID,
        name: title,
        user_message: message,
        body: {
          user: {
            id: "019dcd10-fb71-72d4-8322-a1965859b490",
            role: "admin",
            email: "smanileee@gmail.com",
          },
          messages: chatHistory,
        },
      }),
    },
  );

  console.log(res);
  return res;
}

// {
//   "user_message": "Hello",
//   "body": {
//     "user": {
//       "id": 1,
//       "role": "admin",
//       "email": "smanileee@gmail.com"
//     },
//     "messages": []
//   }
// }

export async function getAllChatSessions(): Promise<ChatSessionsResponse> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/`,
  );
}

export async function getOneChatSession(chatID: string): Promise<Chat> {
  const res: OneChatSessionResponse = await fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/${chatID}`,
  );
  return res.result;
}

export async function deleteChatSession(chatID: string): Promise<void> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/${chatID}`,
    { method: "DELETE" },
  );
}
