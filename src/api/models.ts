import type {
  OllamaModelsResponse,
  OllamaModelPullStatusResponse,
} from "../types/models";
import { fetchWithAuth } from "./fetchWithAuth";

export async function getOllamaModels(): Promise<OllamaModelsResponse> {
  return fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/v1/models`);
}

export async function deleteOneModel(model: string) {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/models/${model}`,
    {
      method: "DELETE",
    },
  );
}

// export async function pullOllamaModels(model: string) {
//   const response = await fetchWithAuth(
//     `${import.meta.env.VITE_API_BASE_URL}/models/pull`,
//     {
//       method: "POST",
//       body: JSON.stringify({ model: model }),
//     },
//   );

//   console.log(response);
//   return response;
// }

export async function pullOllamaModel(modelName: string) {
  const response = await fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/models/pull`,
    {
      method: "POST",
      body: JSON.stringify({ model: modelName }),
    },
  );
  localStorage.setItem("activeDownloadJob", response.job_id);
  return response.job_id;
}

export async function getPullStatus(
  jobId: string,
): Promise<OllamaModelPullStatusResponse> {
  return fetchWithAuth(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/models/pull/${jobId}`,
  );
}
