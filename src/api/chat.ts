/// --- Core libraries --- ///
import { v7 as uuidv7 } from "uuid";


/// --- Type hints --- ///
import type {
    Chat,
    ChatSessionsResponse,
    Message,
    OneChatSessionResponse,
} from "../types/chats";


/// --- Internal libraries --- ///
import { useUserStore } from "../stores/UserStore";
import { fetchWithAuth } from "./fetchWithAuth";



export async function sendMessage(
    message: string,
    chatHistory: Message[],
    chatID: string | null,
    title: string,
    signal?: AbortSignal,
) {
    // Grab pre-cached user data from React `useState()`
    const {
        selectedUser,
        selectedUserRole
    } = useUserStore.getState();

    // NOTE:
    // Example payload in YAML style:
    //
    //	user_message: "<user query>",
    //		body:
    //			user:
    //				id: "<user UUID (version 7)>",
    //				role: "<user role>",
    //				email: "<user email>",
	//				inquiry_cycle_id: "<inquiry cycle UUID (version 7)>"
    //			messages: []
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
						role: selectedUserRole,
                        email: selectedUser?.email,
						// TODO:
						// this's temporary solution. Once starting on the PR that unified one
						// payload format only (right now it's 2), this will get modify (the whole
						// thing, not just this field)
						inquiry_cycle_id: uuidv7(),
                    },
                    messages: chatHistory,
                }
            })
        }
    );

    // console.log(res);
    return res;
}


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

export async function sendOneDeletedChatSession(chat_id: string,user_id: string) {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/memory/session/delete`,
    {
      method: "POST",
      body: JSON.stringify({ chat_id, user_id }),
    },
  );
}

export async function createChatSession(
    title: string,
    userId: string,
): Promise<{ created: { id: string } }> {
    return fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/`,
        {
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                name: title,
                details: [],
            }),
        },
    );
}
