import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { OllamaModelsResponse, PullProgress } from "../types/models";
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

export async function pullOllamaModels(
  modelName: string,
  onProgress: (data: PullProgress) => void,
) {
  await fetchEventSource(`${import.meta.env.VITE_API_BASE_URL}/models/pull`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: modelName }),

    onmessage(event) {
      const data: PullProgress = JSON.parse(event.data);
      // console.log(event);
      // console.log(data);
      if (data.type === "error") {
        throw new Error(data.message);
      }
      onProgress(data);
    },

    onerror(err) {
      console.error("Stream error:", err);
      throw err;
    },
  });
}
