import {
  Button,
  Checkbox,
  Descriptions,
  Form,
  InputNumber,
  message,
  Modal,
  Select,
  Spin,
} from "antd";
import { useOllamaModelStore } from "../../stores/OllamaModelsStore";
import { useEffect, useState } from "react";
import type {
  ConfigFormValues,
  ConfigPayload,
  ConfigResponse,
} from "../../types/configs";
import { getConfigSettings, updateConfig } from "../../api/configs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";

export default function ConfigsPage() {
  const [form] = Form.useForm();
  const { models, loadModels } = useOllamaModelStore();
  const [sameAsAbove, setSameAsAbove] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const {
    data: config,
    isLoading,
    isError,
  } = useQuery<ConfigResponse>({
    queryKey: ["config"],
    queryFn: getConfigSettings,
  });

  // console.log(config);

  const openModal = () => {
    if (config) {
      // example: "ollama:qwen2.5:7b".split(":") to ["ollama", "qwen2.5", "7b"]
      const [llm, ...modelParts] = config.llm_name?.split(":") ?? [];
      const [qa_llm, ...qaModelParts] =
        config.query_analyser?.llm_name?.split(":") ?? [];
      form.setFieldsValue({
        llm,
        model: modelParts.join(":"),
        quantized: config.is_quantized,
        seed: config.seed,
        topk: config.rag?.topk,
        retrieve_score_threshold: config.rag?.retrieve_score_threshold,
        stockfish_path: config.chess?.stockfish_path,
        qa_llm,
        qa_model: qaModelParts.join(":"),
        qa_quantized: config.query_analyser?.is_quantized,
      });
      setSameAsAbove(config.sameasabove ?? false);
    }
    setModalOpen(true);
  };

  const onSave = async (values: ConfigFormValues) => {
    const payload: ConfigPayload = {
      llm_name: `${values.llm}:${values.model}`,
      is_quantized: values.quantized ?? false,
      seed: values.seed ?? 0,
      service: -1,
      doc_directory: "",
      document_path: "",
      sameasabove: sameAsAbove,
      query_analyser: {
        llm_name: sameAsAbove
          ? `${values.llm}:${values.model}`
          : `${values.qa_llm}:${values.qa_model}`,
        is_quantized: sameAsAbove
          ? (values.quantized ?? false)
          : (values.qa_quantized ?? false),
      },
      chess: {
        stockfish_path: values.stockfish_path ?? "",
      },
      rag: {
        topk: values.topk ?? 1,
        retrieve_score_threshold: values.retrieve_score_threshold ?? 0.7,
        vector_db_path: "backend/data/vector_db_cosmic",
      },
      openai: {
        api_key: "",
      },
    };
    console.log("sending:", JSON.stringify(payload, null, 2));

    try {
      await updateConfig(payload);
      message.success("Config saved!");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["config"] });
    } catch (error) {
      console.log(error);
      message.error("Failed to save config!");
    }
  };

  const handleSameAsAbove = (checked: boolean) => {
    setSameAsAbove(checked);
    if (checked) {
      form.setFieldsValue({
        qa_llm: form.getFieldValue("llm"),
        qa_model: form.getFieldValue("model"),
        qa_quantized: form.getFieldValue("quantized"),
      });
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="text-3xl font-bold">CoSMIC Settings</div>
        <div>Config the parameters of CoSMIC</div>
      </div>

      <div className="flex justify-between gap-1.5 mb-2">
        <div className="text-xl">Current configuration</div>
        <Button onClick={openModal}>Edit configuration</Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-14">
          <Spin indicator={<LoadingOutlined spin />} size="large" />
        </div>
      )}

      {isError && (
        <div className="flex justify-center py-14 text-red-500">
          Failed to load config
        </div>
      )}

      {config && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-lg font-semibold mb-5">General</div>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ width: "50%", background: "#F0F5F9" }}
              contentStyle={{ width: "50%" }}
            >
              <Descriptions.Item label="LLM:Model">
                {config.llm_name}
              </Descriptions.Item>
              <Descriptions.Item label="Quantized">
                {config.is_quantized ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Random Seed for LLM">
                {config.seed}
              </Descriptions.Item>
              <Descriptions.Item label="Services">
                {config.service}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <div className="text-lg font-semibold mb-5">Query Analyser</div>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ width: "50%", background: "#F0F5F9" }}
              contentStyle={{ width: "50%" }}
            >
              <Descriptions.Item label="LLM:Model">
                {config.query_analyser.llm_name}
              </Descriptions.Item>
              <Descriptions.Item label="Quantized">
                {config.query_analyser?.is_quantized ? "Yes" : "No"}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <div className="text-lg font-semibold mb-5">RAG</div>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ width: "50%", background: "#F0F5F9" }}
              contentStyle={{ width: "50%" }}
            >
              <Descriptions.Item label="Top-k">
                {config.rag?.topk}
              </Descriptions.Item>
              <Descriptions.Item label="Retrieve score threshold">
                {config.rag?.retrieve_score_threshold}
              </Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <div className="text-lg font-semibold mb-5">Chess</div>
            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{ width: "50%", background: "#F0F5F9" }}
              contentStyle={{ width: "50%" }}
            >
              <Descriptions.Item label="Stockfish path">
                {config.chess?.stockfish_path || "Not set"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      )}

      <Modal
        title="Edit configuration"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width="80vw"
        styles={{ body: { maxHeight: "75vh", overflowY: "auto" } }}
      >
        <Form form={form} layout="vertical" onFinish={onSave}>
          <div className="flex flex-col gap-1.5">
            <div className="text-lg font-semibold mb-1">General</div>

            <Form.Item
              name="llm"
              label="Choose an LLM"
              style={{ marginBottom: 8 }}
            >
              <Select
                placeholder="Please select one LLM"
                options={[{ value: "ollama", label: "ollama" }]}
              />
            </Form.Item>

            <Form.Item
              name="model"
              label="Select a model"
              style={{ marginBottom: 8 }}
            >
              <Select
                placeholder="Please select one model"
                options={[
                  {
                    label: "Available Models in the machine",
                    options: models.map((model) => ({
                      value: model.model,
                      label: model.model,
                    })),
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="quantized"
              valuePropName="checked"
              label="Quantized"
              style={{ marginBottom: 8 }}
            >
              <Checkbox>Enable quantized model</Checkbox>
            </Form.Item>

            <Form.Item
              name="seed"
              label="Random Seed for LLM"
              style={{ marginBottom: 8 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={1}
                placeholder="Enter an integer value no less than 0"
              />
            </Form.Item>

            <Form.Item name="services" label="Choose the service(s)">
              <Select
                mode="multiple"
                allowClear
                placeholder="Please select services"
                options={[
                  { value: "chess", label: "Chess" },
                  { value: "RAG", label: "RAG" },
                  { value: "vector_database", label: "Vector Database" },
                ]}
              />
            </Form.Item>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-lg font-semibold mb-1">Query Analyser</div>
            <Checkbox
              checked={sameAsAbove}
              onChange={(e) => handleSameAsAbove(e.target.checked)}
            >
              Same as above
            </Checkbox>
            <Form.Item
              name="qa_llm"
              label="Choose an LLM"
              style={{ marginBottom: 8 }}
            >
              <Select
                placeholder="Please select one LLM"
                options={[{ value: "ollama", label: "ollama" }]}
                disabled={sameAsAbove}
              />
            </Form.Item>

            <Form.Item
              name="qa_model"
              label="Select a model"
              style={{ marginBottom: 8 }}
            >
              <Select
                placeholder="Please select one model"
                disabled={sameAsAbove}
                options={[
                  {
                    label: "Available Models in the machine",
                    options: models.map((model) => ({
                      value: model.model,
                      label: model.model,
                    })),
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="qa_quantized"
              valuePropName="checked"
              label="Quantized"
            >
              <Checkbox disabled={sameAsAbove}>Enable quantized model</Checkbox>
            </Form.Item>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-lg font-semibold mb-1">Chess</div>

            <Form.Item
              name="stockfish_path"
              label="Select the Stockfish executable file"
            ></Form.Item>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-lg font-semibold mb-1">RAG</div>
            <Form.Item name="topk" label="Top-k" style={{ marginBottom: 8 }}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={1}
                placeholder="Enter an integer value no less than 0"
              />
            </Form.Item>
            <Form.Item
              name="retrieve_score_threshold"
              label="Retrieve Score Threshold (enter a value between 0 and 1, default is 0.7)"
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={1}
                step={1}
                placeholder="Enter a value between 0 and 1, default is 0.7"
              />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
