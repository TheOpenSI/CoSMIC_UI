export type ServicePublic = {
    id: number;
    name: string;
    desc: string;
    status: boolean;
    memory_capability: boolean;
    create_on: string;
};


export type ServicesPublic = {
    success: boolean;
    count: number;
    result: ServicePublic[];
};
