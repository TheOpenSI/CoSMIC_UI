import { Button, Checkbox, Form, InputNumber, message, Select } from "antd";
import { useOllamaModelStore } from "../../stores/OllamaModelsStore";
import { useEffect, useState } from "react";
import type { ConfigFormValues, ConfigPayload } from "../../types/configs";
import { updateConfig } from "../../api/configs";

export default function ConfigsPage() {
  const [form] = Form.useForm();
  const { models, loadModels } = useOllamaModelStore();
  const [sameAsAbove, setSameAsAbove] = useState(false);

  useEffect(() => {
    if (models.length === 0) {
      loadModels();
    }
  }, [models.length, loadModels]);
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
        topk: values.topk ?? 10,
        retrieve_score_threshold: values.retrieve_score_threshold ?? 0.7,
        vector_db_path: "backend/data/vector_db_cosmic",
      },
      openai: {
        api_key: "",
      },
    };
    console.log("sending:", JSON.stringify(payload, null, 2)); // 👈 check this

    try {
      await updateConfig(payload);
      message.success("Config saved!");
      form.resetFields();
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

      <Form form={form} layout="vertical" onFinish={onSave}>
        {/* General */}
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

        {/*Query Analyser */}
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

        {/* Chess */}
        <div className="flex flex-col gap-1.5">
          <div className="text-lg font-semibold mb-1">Chess</div>

          <Form.Item
            name="stockfish_path"
            label="Select the Stockfish executable file"
          ></Form.Item>
        </div>

        {/* RAG */}
        <div className="flex flex-col gap-1.5">
          <div className="text-lg font-semibold mb-1">RAG</div>
          <Form.Item name="topk" label="Top-k" style={{ marginBottom: 8 }}>
            <InputNumber style={{ width: "100%" }} min={0} step={1} />
          </Form.Item>
          <Form.Item
            name="retrieve_score_threshold"
            label="Retrieve Score Threshold (enter a value between 0 and 1, default is 0.7)"
          >
            <InputNumber style={{ width: "100%" }} min={0} step={1} />
          </Form.Item>
        </div>

        {/* Save Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
