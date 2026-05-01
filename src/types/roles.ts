export type Role = {
  id: string;
  name: string;
  desc: string;
  create_on: string;
};

export type AllRolesResponse = {
  success: boolean;
  count: number;
  result: Role[];
};
