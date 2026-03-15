import type { ConfigPayload } from "../types/configs";
import { fetchWithAuth } from "./fetchWithAuth";

export async function updateConfig(payload: ConfigPayload) {
  const response = await fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/config/update`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  console.log(response);
  return response;
}
