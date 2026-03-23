export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export type AllUsersResponse = {
  success: boolean;
  result: User[];
  count: number;
};
