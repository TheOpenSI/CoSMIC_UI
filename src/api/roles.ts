import type { AllRolesResponse } from "../types/roles";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getAllRoles(): Promise<AllRolesResponse> {
  return fetchWithAuth(`${import.meta.env.VITE_API_DATABASE_URL}/api/v1/roles`);
}
