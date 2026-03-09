import type { OllamaModelsResponse } from "../types/models";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getOllamaModels(): Promise<OllamaModelsResponse> {
  const response = await fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/models`,
  );

  console.log(response);
  return response;
}

export async function deleteOneModel(model: string) {
  return fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/models/${model}`, {
    method: "DELETE",
  });
}
