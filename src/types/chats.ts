// Shared role constants (mirror `cosmic-db/cores/globals.py`)
export const USER_ROLE = "user" as const;
export const LLM_ROLE = "assistant" as const;


/**
 * UI view models
 */


// A message as rendered in the chat transcript
export type ChatMessage = {
	id:			string;
	role:		typeof USER_ROLE | typeof LLM_ROLE;
	content:	string;
	// Attached filename shown as a chip above the user bubble
	fileName?:	string;
};


/**
 * Chatboxes API / CoSMIC payload models
 */


// A complete chat history (user-only & assistant-only fields) as stored by the DB
export type ChatHistory = {
	inquiry_cycle_id:	string;
	user_role:			string;
	user_query:			string;
	query_create_on:	string;
	llm_role:			string;
	llm_response:		string;
	response_create_on: string;
	input_token:		number;
	output_token:		number;
};


//  Inquiry cycle with user-only fields, which will be fulfilled  by CoSMIC
export type ChatHistoryDraft = {
	inquiry_cycle_id:	string;
	user_role:			typeof USER_ROLE;
	user_query:			string;
	query_create_on:	string;
};


export type ChatSession = {
	id:			string;
	user_id:	string;
	name:		string;
	details:	ChatHistory[];
	create_on:	string;
};


export type ChatSessionOneResponse = {
	success:	boolean;
	result:		ChatSession;
};


export type ChatSessionAllResponse = {
	success:	boolean;
	count:		number;
	result:		ChatSession[];
};


// Partial chat session payload sent to `POST /api/v1/cosmic` endpoint
export type CosmicPayload = {
	chat_session_id:	string | null;
	user_id:			string;
	name:				string;
	details:			(ChatHistory | ChatHistoryDraft)[];
};


// Response returned by `POST /api/v1/cosmic` endpoint
export type CosmicResponse = {
	status:				string;
	result:				string;
	chat_session_id:	string;
};
