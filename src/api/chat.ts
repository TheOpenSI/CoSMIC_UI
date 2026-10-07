/// --- Core libraries --- ///


/// --- Type hints --- ///
import type {
    ChatSession,
    ChatSessionAllResponse,
    CosmicPayload,
    CosmicResponse,
	ChatSessionOneResponse,
} from "../types/chats";


/// --- Internal libraries --- ///
import { useUserStore } from "../stores/UserStore";
import { fetchWithAuth } from "./fetchWithAuth";


/**
 * Send the partial chat session payload to CoSMIC.
 *
 * CoSMIC owns session creation, so a brand new chat passes omitted chat session
 * ID for any attachment has already been uploaded (see `api/upload.ts`) before
 * this call.
 */
export async function sendMessage(
	chatSessionId:	string | null,
	title:			string,
    details:		CosmicPayload["details"],
    signal?:		AbortSignal,
): Promise<CosmicResponse> {
    const { selectedUser } = useUserStore.getState();

    if (!selectedUser?.id) {
        throw new Error("No user is selected.");
    }

    const payload: CosmicPayload = {
		chat_session_id: chatSessionId,
        user_id: selectedUser.id,
        name: title,
        details,
    };

    return fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/cosmic`,
        {
            method: "POST",
            signal,
            body: JSON.stringify(payload),
        }
    );
}


export async function getAllChatSession(): Promise<ChatSessionAllResponse> {
    return fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/`,
    );
}


/**
 * TODO:
 * This's not a good approach at all. We've created a ticket to address this
 * method.
 *
 * Pre-create an empty chatbox so an attachment can be uploaded against a
 * session id before the first message is sent. An empty `details` list is
 * valid on the Chatboxes API.
 *
 */
export async function createChatSession(
    title:	string,
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


export async function getOneChatSession(chatSessionId: string): Promise<ChatSession> {
    const res: ChatSessionOneResponse = await fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/${chatSessionId}`,
    );
    return res.result;
}


export async function deleteChatSession(chatSessionId: string): Promise<void> {
    return fetchWithAuth(
        `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/chatboxes/${chatSessionId}`,
        { method: "DELETE" },
    );
}


// Tell CoSMIC to drop the on-disk/vector memory held for a deleted session
export async function deleteNotifyChatSession(
	chatSessionId: string,
	userId: string,
): Promise<void> {
    return fetchWithAuth(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/memory/session/delete`,
        {
            method: "POST",
            body: JSON.stringify({
				chat_session_id: chatSessionId,
				user_id: userId
			}),
        },
    );
}
