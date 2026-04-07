import type { Role } from "./roles";

export type User = {
  id: string;
  name: string;
  email: string;
  role_id: string;
  create_on: string;
  role: Role;
};
export type AllUsersResponse = {
  success: boolean;
  result: User[];
  count: number;
};
