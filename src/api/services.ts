import type { AllServicesResponse, ServiceEnable } from "../types/services";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getAllServices(): Promise<AllServicesResponse> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/services`,
  );
}

export async function updateService(
  serviceId: number,
  payload: {
    status: boolean;
  },
): Promise<ServiceEnable> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/services/${serviceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
