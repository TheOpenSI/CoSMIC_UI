import type { AllUsersResponse } from "../types/users";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getAllUsers(): Promise<AllUsersResponse> {
  return fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users`);
}

export async function deleteOneUser(user_id: string) {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/${user_id}`,
    {
      method: "DELETE",
    },
  );
}
