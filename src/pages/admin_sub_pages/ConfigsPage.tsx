import { Button, Checkbox, InputNumber, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function ConfigsPage() {
  return (
    <div className="flex flex-col">
      <div className="text-xl font-bold mb-4">CoSMIC Settings</div>
      <div className=" flex flex-col gap-7">
        {/* General */}
        <div className=" flex flex-col gap-1.5">
          <div className="text-lg font-semibold mb-1">General</div>
          <div className="flex flex-col gap-1.5">
            <div>Choose an LLM</div>
            <Select
              className="cosmic-select"
              placeholder="Please select one LLM"
              style={{
                width: "100%",
              }}
              options={[
                { value: "ollama", label: "ollama" },
                { value: "openai", label: "openai" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div>Select a model</div>
            <Select
              placeholder="Please select one model"
              className="cosmic-select"
              style={{
                width: "100%",
              }}
              options={[
                {
                  label: "Available Models in the machine",
                  options: [
                    { value: "qwen2.5", label: "qwen2.5" },
                    { value: "phi3.5", label: "phi3.5" },
                  ],
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div>Quantized</div>
            <Checkbox>Enable quantized model</Checkbox>
          </div>
          <div className="flex flex-col gap-1.5">
            <div>Random Seed for LLM</div>
            <InputNumber
              className="cosmic-input"
              style={{ width: "100%" }}
              min={0}
              step={1}
              placeholder="Enter an integer value no less than 0"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div>Choose the service(s)</div>
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select services"
              options={[
                { value: "chess", label: "chess" },
                { value: "RAG", label: "RAG" },
              ]}
            />
          </div>
        </div>

        {/* Query Analyser */}
        <div className=" flex flex-col gap-1.5">
          <div className="text-lg font-semibold mb-1">Query Analyser</div>

          <Checkbox>Same as the above</Checkbox>

          <div className="flex flex-col gap-1.5">
            <div>Choose an LLM</div>
            <Select
              className="cosmic-select"
              placeholder="Please select one LLM"
              style={{
                width: "100%",
              }}
              options={[
                { value: "ollama", label: "ollama" },
                { value: "openai", label: "openai" },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div>Select a model</div>
            <Select
              placeholder="Please select one model"
              className="cosmic-select"
              style={{
                width: "100%",
              }}
              options={[
                {
                  label: "Available Models in the machine",
                  options: [
                    { value: "qwen2.5", label: "qwen2.5" },
                    { value: "phi3.5", label: "phi3.5" },
                  ],
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div>Quantized</div>
            <Checkbox>Enable quantized model</Checkbox>
          </div>
        </div>

        {/* Chess */}
        <div className=" flex flex-col gap-1.5">
          <div className="text-lg font-semibold mb-1">Chess</div>
          <div className="flex flex-col gap-1.5">
            <div>Select the Stockfish executable file</div>
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
        </div>
        <div className=" flex flex-col gap-1.5">
          <div className="text-lg font-semibold mb-1">RAG</div>
          <div className="flex flex-col gap-1.5">
            <div>Top-K</div>
            <InputNumber
              className="cosmic-input"
              style={{ width: "100%" }}
              min={0}
              step={1}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div>
              Retrieve Score Threshold (enter a value between 0 and 1, default
              is 0.7)
            </div>
            <InputNumber
              className="cosmic-input"
              style={{ width: "100%" }}
              min={0}
              step={1}
            />
          </div>
          <div className="flex flex-col mt-4 ">
            <Button type="primary">Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
