import type { OllamaModelsResponse } from "../types/models";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getOllamaModels(): Promise<OllamaModelsResponse> {
  const response = await fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/models`,
  );

  console.log(response);
  return response;
}
