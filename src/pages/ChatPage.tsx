import { Button, Input, Spin } from "antd";
import { ChevronDown, CirclePause, Orbit, Paperclip, Send } from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

import { BsPersonFill } from "react-icons/bs";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import type { Message } from "../types/message";
import { sendMessage } from "../api/chat";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userText = message.trim();
    abortControllerRef.current = new AbortController();

    // chatHistory (putting each message into messages[]): current messages + new user message
    // 1. if new message from user, push the new message into the array
    const updatedHistory: Message[] = [
      ...messages,
      { id: uuidv4(), role: "user", content: userText },
    ];

    setMessages(updatedHistory);
    setMessage("");
    setIsLoading(true);

    // 2. then we wait for AI to reply
    try {
      const aiReply = await sendMessage(
        userText,
        updatedHistory,
        abortControllerRef.current.signal,
      );

      // 3. after that, push AI reply into messages
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: aiReply,
        },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    }

    setIsLoading(false);
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
            <span>Learning Machine Learning</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        </div>
      )}
      <div className="flex-1  overflow-y-auto ">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 ">
          {messages.length === 0 && (
            <div className="min-h-[70vh] flex items-center justify-center ">
              <div className="text-5xl">Welcome, smanile</div>
            </div>
          )}
          {messages.length > 0 && (
            <div className="flex gap-6 flex-col ">
              <div className="flex items-center gap-16">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">
                  {dayjs().format("D MMM YYYY")}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div>
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={msg.id} className="flex gap-2 mb-6">
                      {isUser && (
                        <div className=" flex gap-3 items-start">
                          <div className="bg-[#E6E7EB] rounded-full p-2 mt-1">
                            <BsPersonFill color="#6B7281" size={20} />
                          </div>
                          <div className="mt-1 bg-[#0079FF] text-white px-4 py-2 rounded-2xl text-sm wrap-break-word max-w-172">
                            {msg.content}
                          </div>
                        </div>
                      )}
                      {!isUser && (
                        <div className=" flex gap-3 items-start">
                          <div className="bg-black rounded-full p-1.5 mt-1 text-amber-50">
                            <Orbit size={22} />
                          </div>
                          <div className="mt-1 text-gray-800 px-1 py-2 text-sm wrap-break-word max-w-172 prose prose-sm">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex gap-3 items-start mb-6">
                    <div className="mt-2 flex items-center gap-2 text-gray-400 text-sm">
                      <Spin
                        indicator={
                          <LoadingOutlined spin style={{ color: "#DBDCDF" }} />
                        }
                        size="small"
                      />
                      <span>Cosmic is thinking...</span>
                    </div>
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
            onPressEnter={(e) => {
              e.preventDefault();
              handleSend();
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
