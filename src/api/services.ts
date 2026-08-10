/// --- Core libraries --- ///


/// --- Type hints --- ///
import type {
  ServicePublic,
  ServicesPublic
} from "../types/services";


/// --- Internal libraries --- ///
import { fetchWithAuth } from "./fetchWithAuth";



export async function getServices(): Promise<ServicesPublic> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/services`,
  );
}


export async function updateService(
  serviceId: number,
  payload: {
    status: boolean;
    memory_capability?: boolean;
  },
): Promise<ServicePublic> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/services/${serviceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
