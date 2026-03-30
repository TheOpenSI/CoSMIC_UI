import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cpu, HardDriveDownload, PackagePlus, Trash2 } from "lucide-react";
import {
  deleteOneModel,
  getOllamaModels,
  getPullStatus,
  pullOllamaModel,
} from "../../api/models";
import { Button, Input, message, Modal, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useDownloadStore } from "../../stores/downloadStore";

export default function ModelsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { jobId, setJobId, modelName, setModelName } = useDownloadStore();

  const { data, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getOllamaModels,
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setModelName("");
  };
  const showModal = () => {
    setIsModalOpen(true);
  };

  const { mutate: handleDelete } = useMutation({
    mutationFn: (model: string) => deleteOneModel(model),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      message.success("Model deleted!");
    },
    onError: (error) => {
      console.log(error);
      message.error("Delete failed");
    },
  });

  // 1. start the pulling and get the job id from backend
  const { mutate: handleDownload } = useMutation({
    mutationFn: (modelName: string) => pullOllamaModel(modelName),

    onSuccess: (data) => {
      console.log("full data:", data);
      setJobId(data);
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.log(error);
      message.error("Download failed");
    },
  });

  // 2. get the polling progress from pulling api

  const { data: pullStatus } = useQuery({
    queryKey: ["pullStatus", jobId],
    queryFn: () => getPullStatus(jobId as string),
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "done" || status === "error") return false;
      return 2000;
    },
  });

  // 3. react to status changes
  useEffect(() => {
    if (pullStatus?.status === "done") {
      queryClient.invalidateQueries({ queryKey: ["models"] });
      message.success("Model downloaded!");
      setTimeout(() => {
        setJobId(null);
        setModelName("");
      }, 0);
    }
    if (pullStatus?.status === "error") {
      message.error(pullStatus.error || "Download failed");
      setTimeout(() => {
        setJobId(null);
        setModelName("");
      }, 0);
    }
  }, [
    pullStatus?.status,
    pullStatus?.error,
    queryClient,
    setJobId,
    setModelName,
  ]);

  // before user clicking refresh
  useEffect(() => {
    if (!jobId) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [jobId]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="text-3xl font-bold">Models</div>
        <div>View, pull, and delete your models</div>
      </div>

      <div className="flex flex-col gap-1 mt-3">
        <div className="flex justify-between">
          <div>
            Total models count:{" "}
            <span className="text-[#0079FF]">{data?.total}</span>
          </div>
          <button
            onClick={showModal}
            disabled={!!jobId}
            className="flex items-center justify-center gap-1 text-[#8C8C8C] hover:text-[#0079FF] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-[#8C8C8C]"
          >
            <PackagePlus size={15} /> <span>Add new model</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Spin indicator={<LoadingOutlined spin />} size="large" />
          </div>
        ) : (
          data?.models?.map((model) => (
            <div
              key={model.id}
              className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:border-[#0079FF] hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 w-60">
                <Cpu size={16} className="text-[#0079FF] shrink-0" />
                <span
                  title={model.model}
                  className="font-semibold text-sm truncate cursor-default max-w-sm"
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
                onClick={() => handleDelete(model.model)}
                type="text"
                danger
                size="small"
                icon={<Trash2 size={13} />}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
      {jobId && (
        <div className="flex flex-col gap-2">
          <div className="border border-[#0079FF] rounded-xl p-4 flex flex-col gap-2 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu
                  size={16}
                  className="text-[#0079FF] shrink-0 animate-pulse"
                />
                <span className=" truncate max-w-sm font-semibold text-sm shrink-0 animate-pulse">
                  {modelName}
                </span>
              </div>
              <span className="text-sm text-[#0079FF] font-medium">
                Status: {pullStatus?.status}
              </span>
            </div>

            <hr className="border-blue-200" />

            <span className="text-xs text-[#0079FF]">
              {pullStatus?.logs?.at(-1)}
              {/* get only the latest message */}
            </span>
          </div>
        </div>
      )}

      <Modal
        title="Add New Model"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <div className="flex flex-col gap-2">
          <div>Enter Ollama Model</div>
          <div>
            <Input
              placeholder="e.g. mistral:7b"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
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
            onClick={() => {
              handleDownload(modelName);
            }}
          >
            Download Model
          </Button>
        </div>
      </Modal>
    </div>
  );
}
