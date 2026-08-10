export type User = {
  id: string;
  name: string;
  email: string;
  role_id: string;
  create_on: string;
};

export type AllUsersResponse = {
  success: boolean;
  result: User[];
  count: number;
};
