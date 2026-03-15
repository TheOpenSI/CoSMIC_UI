import { Button, Input, Modal } from "antd";
import { useEffect, useState } from "react";
import { deleteOneModel, pullOllamaModels } from "../../api/models";

import { HardDriveDownload, PackagePlus, Trash2, Cpu } from "lucide-react";
import { message } from "antd";
import dayjs from "dayjs";
import { useOllamaModelStore } from "../../stores/OllamaModelsStore";

export default function ModelsPage() {
  const {
    models: ollaModels,
    total: totalModels,
    loading,
    loadModels,
  } = useOllamaModelStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelName, setModelName] = useState("");

  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState("");

  useEffect(() => {
    loadModels();
  }, [loadModels]);

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

  const handleDownload = async () => {
    if (!modelName.trim()) return;

    const name = modelName.trim();
    setIsModalOpen(false);
    setModelName("");
    setDownloadingModel(name);

    try {
      await pullOllamaModels(name, (data) => {
        if (data.type === "log") {
          setDownloadStatus(data.message!);
        }
      });

      message.success("Model downloaded!");
      await loadModels();
    } catch (error) {
      console.log(error);
      message.error("Download failed!");
    } finally {
      setDownloadingModel(null);
      setDownloadStatus("");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setModelName("");
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="text-3xl font-bold">Models</div>
        <div>View, pull, and delete your models</div>
      </div>
      <div className=" flex flex-col gap-1 mt-3">
        <div className="flex justify-between ">
          <div>
            Total models count:{" "}
            <span className="text-[#0079FF]">{totalModels}</span>
          </div>
          <button
            className="flex items-center justify-center gap-1  text-[#8C8C8C] hover:text-[#0079FF] cursor-pointer"
            onClick={showModal}
          >
            <PackagePlus size={15} /> <span>Add new model</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-gray-300 text-sm">
          Loading...
        </div>
      ) : ollaModels.length === 0 && !downloadingModel ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300 gap-2">
          <Cpu size={32} />
          <span className="text-sm">No models yet</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Model cards */}
          {ollaModels.map((model) => (
            <div
              key={model.id}
              className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-[#0079FF] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 w-60">
                <Cpu size={16} className="text-[#0079FF] shrink-0" />
                <span
                  title={model.model}
                  className="font-semibold text-sm truncate cursor-default"
                >
                  {model.model}
                </span>
              </div>

              <div className="flex gap-8 text-xs text-gray-400">
                <div className="flex flex-col gap-0.5">
                  <span>ID</span>
                  <span className="text-gray-600">{model.id}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>Size</span>
                  <span className="text-gray-600">{model.size}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>Modified at</span>
                  <span className="text-gray-600">
                    {dayjs(model.modified_at).format("DD MMM YYYY, HH:mm")}
                  </span>
                </div>
              </div>

              <Button
                type="text"
                danger
                size="small"
                onClick={() => handleDelete(model.model)}
                icon={<Trash2 size={13} />}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Downloading card */}
      {downloadingModel && (
        <div className="border border-[#0079FF] rounded-xl p-4 flex items-center justify-between bg-blue-50">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-[#0079FF] shrink-0 animate-pulse" />
            <span className="font-semibold text-sm">{downloadingModel}</span>
          </div>

          <span className="text-sm text-[#0079FF] font-medium">
            {downloadStatus}
          </span>
        </div>
      )}

      {/* Modal */}
      <Modal
        title="Add New Model"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <div className="flex flex-col gap-2">
          <div>Enter Ollama Model</div>
          <div>
            <Input
              placeholder="e.g. mistral:7b"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              onPressEnter={handleDownload}
            />
            <span className="text-[11px] mt-1">
              To access the available model names for downloading,{" "}
              <a target="_blank" href="https://ollama.com/library">
                click here
              </a>
              .
            </span>
          </div>
          <Button
            type="primary"
            icon={<HardDriveDownload size={17} />}
            className="mt-3"
            block
            onClick={handleDownload}
            disabled={!modelName.trim()}
          >
            Download Model
          </Button>
        </div>
      </Modal>
    </div>
  );
}
