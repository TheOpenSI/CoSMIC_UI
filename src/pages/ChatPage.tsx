import { Button, Input, Spin } from "antd";
import { CirclePause, Orbit, Paperclip, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { BsPersonFill } from "react-icons/bs";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/chats";
import { getOneChatSession, sendMessage } from "../api/chat";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";
import { mapToMessages } from "../lib/mapToMessages";
import { useChatStore } from "../stores/ChatStore";

const { TextArea } = Input;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const { chatID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const chatKey = chatID ?? "new";

  const {
    messagesByChat,
    loadingByChat,
    optimisticTitleByChat,
    setMessages,
    setLoading,
    setOptimisticTitle,
  } = useChatStore();

  const messages = messagesByChat[chatKey] ?? [];
  const isLoading = loadingByChat[chatKey] ?? false;
  const optimisticTitle = optimisticTitleByChat[chatKey] ?? "";

  const { data: currentChat, isLoading: isChatLoading } = useQuery({
    queryKey: ["chat", chatID],
    queryFn: () => getOneChatSession(chatID!),
    enabled: !!chatID,
  });

  useEffect(() => {
    if (!currentChat) {
      setMessages(chatKey, []);
      return;
    }

    if (loadingByChat[chatKey]) return;

    const savedMessages = mapToMessages(currentChat.details);
    setOptimisticTitle(chatKey, "");
    if (savedMessages.length > 0) {
      setMessages(chatKey, savedMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userText = message.trim();
    abortControllerRef.current = new AbortController();

    const updatedHistory: Message[] = [
      ...messages,
      { id: uuidv4(), role: "user", content: userText },
    ];

    setMessages(chatKey, updatedHistory);
    setMessage("");
    setLoading(chatKey, true);
    setOptimisticTitle(chatKey, userText.slice(0, 40));

    try {
      const title =
        messages.length === 0
          ? userText.slice(0, 40)
          : currentChat?.name || "New chat";

      const data = await sendMessage(
        userText,
        messages,
        chatID ?? null,
        title,
        abortControllerRef.current.signal,
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.result,
      };

      const finalMessages = [...updatedHistory, assistantMessage];
      setMessages(chatKey, finalMessages);
      queryClient.invalidateQueries({ queryKey: ["allUsersAndChatSessions"] });

      if (!chatID && data.chat_id) {
        setMessages(data.chat_id, finalMessages);
        setOptimisticTitle(data.chat_id, "");
        navigate(`/chat/${data.chat_id}`, { replace: true });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setOptimisticTitle(chatKey, "");
        setLoading(chatKey, false);
        return;
      }
      console.error(err);
      setOptimisticTitle(chatKey, "");

      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Something went wrong. Retry again.",
      };
      setMessages(chatKey, [...updatedHistory, errorMessage]);
    } finally {
      setLoading(chatKey, false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setLoading(chatKey, false);
    setOptimisticTitle(chatKey, "");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span>{currentChat?.name || optimisticTitle || "New chat"}</span>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isChatLoading ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <Spin
                indicator={
                  <LoadingOutlined spin style={{ color: "#DBDCDF" }} />
                }
                size="small"
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="text-5xl">Welcome to CoSMIC</div>
            </div>
          ) : (
            <div className="flex gap-6 flex-col">
              <span className="text-gray-400 text-sm flex justify-center">
                {currentChat?.create_on
                  ? dayjs(currentChat.create_on).format("D MMM YYYY")
                  : dayjs().format("D MMM YYYY")}
              </span>
              <div>
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className="flex gap-2 mb-6">
                      {isUser ? (
                        <div className="flex gap-3 items-start">
                          <div className="bg-[#E6E7EB] rounded-full p-2 mt-1">
                            <BsPersonFill color="#6B7281" size={20} />
                          </div>
                          <div className="mt-1 bg-[#0079FF] text-white px-4 py-2 rounded-2xl text-sm max-w-172">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 items-start">
                          <div className="bg-black rounded-full p-1.5 mt-1 text-amber-50">
                            <Orbit size={22} />
                          </div>
                          <div className="mt-1 text-gray-800 px-1 py-2 text-sm max-w-172 prose prose-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex gap-3 items-start mb-6">
                    <Spin
                      indicator={
                        <LoadingOutlined spin style={{ color: "#DBDCDF" }} />
                      }
                      size="small"
                    />
                    <span>Cosmic is thinking...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div className="bg-[#F0F5F9] rounded-2xl p-4 w-full max-w-3xl">
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can I help you today..."
            autoSize={{ minRows: 1, maxRows: 8 }}
            variant="borderless"
            styles={{ textarea: { padding: 0 } }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="relative flex items-center mt-5">
            <button className="cursor-pointer">
              <Paperclip size={18} />
            </button>
            <div className="absolute -right-2">
              {isLoading ? (
                <Button
                  danger
                  type="primary"
                  onClick={handleStop}
                  className="flex items-center justify-center gap-2"
                >
                  Stop <CirclePause size={15} />
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleSend}
                  className="flex items-center justify-center gap-2"
                >
                  Send <Send size={15} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
