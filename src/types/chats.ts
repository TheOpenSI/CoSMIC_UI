export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
export type OneChatSessionResponse = {
  success: boolean;
  result: Chat;
};

export type ChatSessionsResponse = {
  success: boolean;
  count: number;
  result: Chat[];
};

export type Chat = {
  id: string;
  user_id: string;
  name: string;
  details: ChatDetail[];
  create_on: string;
  user: ChatUser;
};

export type ChatUser = {
  id: string;
  role_id: string;
  name: string;
  email: string | null;
  create_on: string;
  role: UserRole;
};

export type ChatDetail = {
  user_role: string;
  user_query: string;
  query_create_on: string;
  llm_role: string;
  llm_response: string;
  response_create_on: string;
};

export type UserRole = {
  id: string;
  name: string;
  desc: string;
  create_on: string;
};
