/// --- Core libraries --- ///
import {
    Button,
    Checkbox,
    Form,
    Input,
    InputNumber,
    message,
    Select,
    Switch,
} from "antd";
import { useOllamaModelStore } from "../../stores/OllamaModelsStore";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";


/// --- Type hints --- ///
import type { AllServicesResponse } from "../../types/services";
import type {
    ConfigFormValues,
    ConfigPayload,
    ConfigResponse,
} from "../../types/configs";


/// --- Internal libraries --- ///
import {
    getConfigSettings,
    updateConfig
} from "../../api/configs";
import {
    getAllServices,
    updateService
} from "../../api/services";



export default function ConfigsPage() {
    const [form] = Form.useForm();
    const { models, loadModels } = useOllamaModelStore();
    const [sameAsAbove, setSameAsAbove] = useState(false);
    const queryClient = useQueryClient();

    useEffect(
        () => { loadModels(); },
        [loadModels]
    );

    const {
        data: config,
        // isLoading,
        // isError,
    } = useQuery<ConfigResponse>({
        queryKey: ["config"],
        queryFn: getConfigSettings,
    });

    // console.log(config?.result[0]);

    const { data: services } = useQuery<AllServicesResponse>({
        queryKey: ["services"],
        queryFn: getAllServices,
        select: (data) => ({
            ...data, // has other data like success and count
            result: [...data.result].sort((a, b) => a.id - b.id), // order based on 1-5
        }),
    });

    // console.log(services?.result);

    useEffect(
        () => {
            if (!config) return;

            const general = config.result[0].details.general;
            const queryAnalyser = config.result[0].details.query_analyser;

            form.setFieldsValue({
                general_provider: general.provider,
                general_model: general.model,
                general_is_quantised: general.is_quantised,
                general_seed: general.seed,
                general_default_knowledge_path: general.default_knowledge_path,
                general_temp_knowledge_path: general.temp_knowledge_path,
                general_api_key: general.api_key,

                analyser_provider: queryAnalyser.provider,
                analyser_model: queryAnalyser.model,
                analyser_is_quantised: queryAnalyser.is_quantised,
                analyser_seed: queryAnalyser.seed,
                analyser_default_knowledge_path: queryAnalyser.default_knowledge_path,
                analyser_temp_knowledge_path: queryAnalyser.temp_knowledge_path,
                analyser_api_key: queryAnalyser.api_key,
            });
        },
        [config, form]
    );

    const onSave = async (values: ConfigFormValues) => {
        const configId = config?.result[0].id;
        if (!configId) return;

        const payload: ConfigPayload = {
            name: "Default Configuration",
            details: {
                general: {
                    provider: values.general_provider,
                    model: values.general_model,
                    is_quantised: values.general_is_quantised,
                    seed: values.general_seed,
                    default_knowledge_path: values.general_default_knowledge_path,
                    temp_knowledge_path: values.general_temp_knowledge_path,
                    api_key: values.general_api_key,
                },
                query_analyser: {
                    provider: values.analyser_provider,
                    model: values.analyser_model,
                    is_quantised: values.analyser_is_quantised,
                    seed: values.analyser_seed,
                    default_knowledge_path: values.analyser_default_knowledge_path,
                    temp_knowledge_path: values.analyser_temp_knowledge_path,
                    api_key: values.analyser_api_key,
                },
            },
        };

        try {
            await updateConfig(payload, configId);
            message.success("Config saved!");
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
                analyser_provider: form.getFieldValue("general_provider"),
                analyser_model: form.getFieldValue("general_model"),
                analyser_is_quantised: form.getFieldValue("general_is_quantised"),
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
                        name="general_provider"
                        label="Choose an LLM"
                        style={{ marginBottom: 8 }}
                    >
                        <Select
                            placeholder="Please select one LLM"
                            options={[{ value: "ollama", label: "ollama" }]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="general_model"
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
                        name="general_is_quantised"
                        valuePropName="checked"
                        label="Quantized"
                        style={{ marginBottom: 8 }}
                    >
                        <Checkbox>Enable quantized model</Checkbox>
                    </Form.Item>

                    <Form.Item
                        name="general_seed"
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

                    <Form.Item label="Choose the service(s)">
                        <div className="grid grid-cols-2 gap-2">
                            {services?.result.map((service) => (
                                <div
                                    key={service.id}
                                    className={`flex items-center justify-between border rounded-lg px-3 py-2 ${service.status
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <span className="capitalize">
                                        {service.name.split("_").join(" ")}
                                    </span>

                                    <Switch
                                        defaultChecked={service.status}
                                        onChange={async (checked) => {
                                            await updateService(service.id, {
                                                status: checked,
                                            });

                                            message.success("Service updated!");
                                            queryClient.invalidateQueries({ queryKey: ["services"] });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="general_default_knowledge_path"
                        label="Default Knowledge Path"
                        initialValue="/app/data/default/"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="general_temp_knowledge_path"
                        label="Temp Knowledge Path"
                        initialValue="/app/data/temp/"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item name="general_api_key" label="API Key" initialValue={null}>
                        <Input disabled placeholder="Null" />
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
                        name="analyser_provider"
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
                        name="analyser_model"
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
                        name="analyser_is_quantised"
                        valuePropName="checked"
                        label="Quantized"
                    >
                        <Checkbox disabled={sameAsAbove}>Enable quantized model</Checkbox>
                    </Form.Item>

                    <Form.Item
                        name="analyser_default_knowledge_path"
                        label="Default Knowledge Path"
                        initialValue="/app/data/default/"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="analyser_default_knowledge_path"
                        label="Temp Knowledge Path"
                        initialValue="/app/data/temp/"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="analyser_api_key"
                        label="API Key"
                        initialValue={null}
                    >
                        <Input disabled placeholder="Null" />
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
