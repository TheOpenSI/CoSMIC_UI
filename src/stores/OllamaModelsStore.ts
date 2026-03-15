import { create } from "zustand";
import type { OllamaModel } from "../types/models";
import { getOllamaModels } from "../api/models";

type OllamaModelStore = {
  models: OllamaModel[];
  total: number;
  loading: boolean;
  loadModels: () => Promise<void>;
};

export const useOllamaModelStore = create<OllamaModelStore>((set) => ({
  models: [],
  total: 0,
  loading: false,
  loadModels: async () => {
    set({ loading: true });
    try {
      const data = await getOllamaModels();
      set({ models: data.models, total: data.total });
    } finally {
      set({ loading: false });
    }
  },
}));
