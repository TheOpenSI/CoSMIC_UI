import { Button, Input } from "antd";
import { ChevronDown, CirclePause, Orbit, Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Message } from "../../types/message";
import { BsPersonFill } from "react-icons/bs";
import dayjs from "dayjs";
import { GiPlanetCore } from "react-icons/gi";

const { TextArea } = Input;

export default function MainContent() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userText = message.trim();

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userText },
    ]);

    setMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Hello! This is a test reply.",
        },
      ]);
      setIsLoading(false);
    }, 1200);
  };

  const handleStop = () => setIsLoading(false);

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
            <div className="flex gap-6 flex-col">
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
                          <div className="mt-1 bg-[#0065F4] text-white px-4 py-2 rounded-2xl text-sm">
                            {msg.content}
                          </div>
                        </div>
                      )}
                      {!isUser && (
                        <div className=" flex gap-3 items-start">
                          <div className="bg-black rounded-full p-1.5 mt-1 text-amber-50">
                            <Orbit size={22} />
                          </div>
                          <div className="mt-1 text-gray-800 px-1 py-2 text-sm">
                            {msg.content}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

              {!isLoading && message.trim() && (
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
