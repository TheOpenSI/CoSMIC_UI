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

export type PullProgress = {
  status: string;
  percent: number | null;
  completed: number;
  total: number;
};
