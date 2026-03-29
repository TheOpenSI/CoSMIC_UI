import { Button, Input, Spin } from "antd";
import { ChevronDown, CirclePause, Orbit, Paperclip, Send } from "lucide-react";

import { v4 as uuidv4 } from "uuid";

import { BsPersonFill } from "react-icons/bs";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/chats";
import { sendMessage } from "../api/chat";
import ReactMarkdown from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import { loadChat, saveChat } from "../lib/chatCache";
import { useQuery } from "@tanstack/react-query";
import { LoadingOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { chatID } = useParams();
  const navigate = useNavigate();
  const isDraftChat = !chatID || chatID === "new";

  const { data: chat, isLoading: isChatLoading } = useQuery({
    queryKey: ["chat", chatID],
    queryFn: async () => {
      if (!chatID || chatID === "new") return null;
      return await loadChat(chatID);
    },
    enabled: !!chatID && chatID !== "new",
  });

  useEffect(() => {
    if (chat) {
      setMessages(chat.messages);
    } else if (chatID === "new") {
      setMessages([]);
    }
  }, [chat, chatID]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userText = message.trim();
    abortControllerRef.current = new AbortController();

    let currentChatId = chatID;

    if (isDraftChat) {
      currentChatId = uuidv4();
    }

    // chatHistory (putting each message into messages[]): current messages + new user message
    // 1. if new message from user, push the new message into the array
    const updatedHistory: Message[] = [
      ...messages,
      { id: uuidv4(), role: "user", content: userText },
    ];

    await saveChat(currentChatId as string, updatedHistory);
    setMessages(updatedHistory);
    setMessage("");
    setIsLoading(true);

    if (isDraftChat) {
      navigate(`/chat/${currentChatId}`);
    }

    // 2. then we wait for AI to reply
    try {
      const aiReply = await sendMessage(
        userText,
        updatedHistory,
        abortControllerRef.current.signal,
      );

      // 3. after that, push AI reply into messages
      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     id: uuidv4(),
      //     role: "assistant",
      //     content: aiReply,
      //   },
      // ]);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: aiReply,
      };

      const finalMessages = [...updatedHistory, assistantMessage];
      setMessages(finalMessages);
      await saveChat(currentChatId as string, finalMessages);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);

      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     id: uuidv4(),
      //     role: "assistant",
      //     content: "Something went wrong.",
      //   },
      // ]);
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Something went wrong.",
      };

      const errorMessages = [...updatedHistory, errorMessage];

      setMessages(errorMessages);
      await saveChat(currentChatId as string, errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span>{chat?.title}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      )}
      <div className="flex-1  overflow-y-auto ">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 ">
          {isChatLoading ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <Spin
                indicator={
                  <LoadingOutlined spin style={{ color: "#DBDCDF" }} />
                }
                size="small"
              />{" "}
            </div>
          ) : isDraftChat && messages.length === 0 ? (
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="text-5xl">Welcome, smanile</div>
            </div>
          ) : (
            <div className="flex gap-6 flex-col ">
              <span className="text-gray-400 text-sm flex justify-center">
                {dayjs().format("D MMM YYYY")}
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
            styles={{
              textarea: {
                padding: 0,
              },
            }}
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
              {isLoading && (
                <Button
                  danger
                  type="primary"
                  onClick={handleStop}
                  className="flex items-center justify-center gap-2"
                >
                  Stop <CirclePause size={15} />
                </Button>
              )}

              {!isLoading && (
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
