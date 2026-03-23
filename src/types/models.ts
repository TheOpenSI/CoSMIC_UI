export type OllamaModel = {
  model: string;
  id: string;
  size: string;
  modified_at: string;
  family: string;
};
export type OllamaModelsResponse = {
  models: OllamaModel[];
  total: number;
};

export type OllamaModelPullStatusResponse = {
  status: "running" | "done" | "error";
  logs: string[];
  error: string | null;
};
