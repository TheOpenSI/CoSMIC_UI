export type ConfigFormValues = {
  llm: string;
  model: string;
  quantized: boolean;
  seed: number;
  services: number[];
  qa_llm: string;
  qa_model: string;
  qa_quantized: boolean;
  stockfish_path?: string;
  topk: number;
  retrieve_score_threshold: number;
};
export type ConfigPayload = {
  llm_name: string;
  is_quantized: boolean;
  seed: number;
  service: number[];
  doc_directory: string;
  document_path: string;
  sameasabove: boolean;
  query_analyser: {
    llm_name: string;
    is_quantized: boolean;
  };
  rag: {
    topk: number;
    retrieve_score_threshold: number;
    vector_db_path: string;
  };
  chess: {
    stockfish_path: string;
  };
  openai: {
    api_key: string;
  };
};
