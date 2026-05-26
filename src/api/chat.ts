import { useUserStore } from "../stores/UserStore";
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
  const selectedUser = useUserStore.getState().selectedUser; //outside of tsx use getState

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
            id: selectedUser?.id,
            role: selectedUser?.role.name,
            email: selectedUser?.email,
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

export async function createChatSession(title: string, userId: string): Promise<any> {
  const payload = {
    user_id: userId,
    name: title,
    details: [],
  };
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
