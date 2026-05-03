import type { ConfigPayload, ConfigResponse } from "../types/configs";
import { fetchWithAuth } from "./fetchWithAuth";

// export async function updateConfig(payload: ConfigPayload) {
//   const response = await fetchWithAuth(
//     `${import.meta.env.VITE_API_BASE_URL}/config/update`,
//     {
//       method: "POST",
//       body: JSON.stringify(payload),
//     },
//   );

//   console.log(response);
//   return response;
// }

export async function getConfigSettings(): Promise<ConfigResponse> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/configs/`,
  );
}

export async function updateConfig(payload: ConfigPayload, id: string) {
  const response = await fetchWithAuth(
    `${import.meta.env.VITE_API_DATABASE_URL}/api/v1/configs/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  console.log(response);
  return response;
}
