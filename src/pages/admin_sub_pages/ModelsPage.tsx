import { Table } from "antd";
import { useEffect, useState } from "react";
import { getOllamaModels } from "../../api/models";
import type { OllamaModel } from "../../types/models";
import "../../styles/table.css";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function ModelsPage() {
  const [ollaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [totalModels, setTotalModels] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const data = await getOllamaModels();
        setOllamaModels(data.models);
        setTotalModels(data.total);
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

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
      dataIndex: "",
      key: "x",
      render: () => <a>Delete</a>,
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
          <div>Total models count: {totalModels}</div>
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
