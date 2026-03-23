import { create } from "zustand";

type DownloadStore = {
  jobId: string | null;
  modelName: string;
  setJobId: (id: string | null) => void;
  setModelName: (name: string) => void;
};

export const useDownloadStore = create<DownloadStore>((set) => ({
  jobId: null,
  modelName: "",
  setJobId: (id) => set({ jobId: id }),
  setModelName: (name) => set({ modelName: name }),
}));
