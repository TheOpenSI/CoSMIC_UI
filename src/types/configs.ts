export type ConfigFormValues = {
  general_provider: string;
  general_model: string;
  general_is_quantised: boolean;
  general_seed: number;
  general_default_knowledge_path: string;
  general_temp_knowledge_path: string;
  general_api_key: string | null;

  analyser_provider: string;
  analyser_model: string;
  analyser_is_quantised: boolean;
  analyser_seed: number;
  analyser_default_knowledge_path: string;
  analyser_temp_knowledge_path: string;
  analyser_api_key: string | null;
};

export type ConfigPayload = {
  name: string;
  details: {
    general: {
      provider: string;
      model: string;
      is_quantised: boolean;
      seed: number;
      default_knowledge_path: string;
      temp_knowledge_path: string;
      api_key: string | null;
    };
    query_analyser: {
      provider: string;
      model: string;
      is_quantised: boolean;
      seed: number;
      default_knowledge_path: string;
      temp_knowledge_path: string;
      api_key: string | null;
    };
  };
};

export type ConfigProviderSettings = {
  provider: string;
  model: string;
  is_quantised: boolean;
  seed: number;
  default_knowledge_path: string;
  temp_knowledge_path: string;
  api_key: string | null;
};

export type ConfigDetails = {
  general: ConfigProviderSettings;
  query_analyser: ConfigProviderSettings;
};

export type ConfigItem = {
  name: string;
  details: ConfigDetails;
  id: string;
  create_on: string;
};

export type ConfigResponse = {
  success: boolean;
  count: number;
  result: ConfigItem[];
};
