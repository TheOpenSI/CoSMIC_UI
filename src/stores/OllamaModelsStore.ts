import { create } from "zustand";
import type { OllamaModel, OllamaModelsResponse } from "../types/models";
import { getOllamaModels } from "../api/models";

const CACHE_KEY = "cachedOllamaModelsData";

type OllamaModelStore = {
  models: OllamaModel[];
  total: number;
  loading: boolean;
  loadModels: () => Promise<void>;
};

const getModelsFromCache = (): OllamaModelsResponse => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    // console.log(cached);
    return cached ? JSON.parse(cached) : { models: [], total: 0 };
  } catch {
    return { models: [], total: 0 };
  }
};
const cache = getModelsFromCache();

export const useOllamaModelStore = create<OllamaModelStore>((set) => ({
  models: cache.models,
  total: cache.total,
  loading: false,
  loadModels: async () => {
    set({ loading: true });
    try {
      const data = await getOllamaModels();
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ models: data.models, total: data.total }),
      );
      set({ models: data.models, total: data.total });
    } catch {
      // do nothing
    } finally {
      set({ loading: false });
    }
  },
}));
