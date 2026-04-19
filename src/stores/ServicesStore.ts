import { create } from "zustand";
import { getAllServices } from "../api/services";
import type { ServiceEnable } from "../types/services";

const CACHE_KEY = "cachedServices";

export type ServicesStore = {
  services_enable: ServiceEnable[];
  // count: number;
  // success: boolean;
  loading: boolean;
  error: string | null;
  loadServices: () => Promise<void>;
};

const getServicesFromCache = (): ServiceEnable[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};
const cachedServices = getServicesFromCache();

export const useServicesStore = create<ServicesStore>((set) => ({
  // initial states
  services_enable: cachedServices,
  loading: false,
  error: null,

  // function to update state
  loadServices: async () => {
    set({ loading: true });
    try {
      const data = await getAllServices();
      localStorage.setItem(CACHE_KEY, JSON.stringify(data.result));
      set({ services_enable: data.result, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load services";
      // console.error("Failed to load services:", error);
      set({
        error: message,
        services_enable: cachedServices, // fallback to cached if api fails to fetch
        loading: false,
      });
    }
  },
}));
