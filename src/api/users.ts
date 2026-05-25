import type { AllUsersResponse } from "../types/users";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getAllUsers(): Promise<AllUsersResponse> {
  return fetchWithAuth(`${import.meta.env.VITE_API_DATABASE_URL}/api/v1/users`);
}

export async function deleteOneUser(user_id: string) {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/users/${user_id}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateUserRole(user_id: string, role_id: string) {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/users/${user_id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ role_id }),
    },
  );
}
