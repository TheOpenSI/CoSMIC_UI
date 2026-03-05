import type { Message } from "../types/message";
import { fetchWithAuth } from "./fetchWithAuth";

export async function sendMessage(
  message: string,
  chatHistory: Message[],
  signal?: AbortSignal,
) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/cosmic`,
    {
      method: "POST",
      signal,
      body: JSON.stringify({
        user_message: message,
        body: {
          user: {
            id: 1,
            role: "admin",
            email: "smanileee@gmail.com",
          },
          messages: chatHistory,
        },
      }),
    },
  );

  console.log(res.result);
  return res.result;
}
