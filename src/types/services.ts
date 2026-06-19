export type ServiceEnable = {
    id: number;
    name: string;
    desc: string;
    status: boolean;
    memory_capability: boolean;
    create_on: string;
};


export type AllServicesResponse = {
    success: boolean;
    count: number;
    result: ServiceEnable[];
};
