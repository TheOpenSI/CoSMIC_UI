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

export interface PullProgress {
  type: "log" | "progress" | "done" | "error";
  message: string;
  percent: number;
  status: string;
}
