import { Button, Table } from "antd";
import { useEffect, useState } from "react";
import { deleteOneModel, getOllamaModels } from "../../api/models";
import type { OllamaModel } from "../../types/models";
import "../../styles/table.css";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PackagePlus } from "lucide-react";
import { message } from "antd";

export default function ModelsPage() {
  const [ollaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [totalModels, setTotalModels] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await getOllamaModels();
      setOllamaModels(data.models);
      setTotalModels(data.total);
    } catch (error) {
      console.error("Failed to load models:", error);
      message.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadModels();
  }, []);

  const handleDelete = async (model: string) => {
    try {
      await deleteOneModel(model);
      message.success("Model deleted");
      await loadModels();
    } catch (error) {
      console.error(error);
      message.error("Delete failed");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },

    {
      title: "Size",
      dataIndex: "size",
      key: "size",
    },
    {
      title: "Modified At",
      dataIndex: "modified_at",
      key: "modified_at",
      render: (value: string) => dayjs(value).format("DD MMM YYYY, HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: OllamaModel) => (
        <Button
          type="text"
          danger
          onClick={() => {
            handleDelete(record.model);
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="text-3xl font-bold">Models</div>
        <div>View, create and delete your models</div>
      </div>
      <div className=" flex flex-col gap-1">
        <div className="flex justify-between ">
          <div>
            Total models count:{" "}
            <span className="text-[#0079FF]">{totalModels}</span>
          </div>
          <button className="flex items-center justify-center gap-1 mr-1 text-[#8C8C8C] hover:text-[#0079FF] cursor-pointer">
            <PackagePlus size={15} /> <span>Add new model</span>
          </button>
        </div>
        <Table
          columns={columns}
          dataSource={ollaModels}
          loading={{
            spinning: loading,
            indicator: <LoadingOutlined spin />,
          }}
          rowKey={(record) => record.id}
          className="models-table"
          pagination={{
            pageSize: 8,
            hideOnSinglePage: true,
          }}
        />
      </div>
    </div>
  );
}
