export type ServiceEnable = {
  id: string;
  name: string;
  desc: string;
  create_on: string;
  status: boolean;
};

export type AllServicesResponse = {
  success: boolean;
  count: number;
  result: ServiceEnable[];
};
