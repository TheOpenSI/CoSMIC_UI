import { Button, Input } from "antd";
import { CirclePause, Paperclip, Send } from "lucide-react";
import { useState } from "react";

const { TextArea } = Input;

export default function MainContent() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    console.log(message);

    // calling api needed!
    setTimeout(() => {
      setIsLoading(false);
      setMessage("");
    }, 3000);
  };

  const handleStop = () => {
    setIsLoading(false);
  };
  return (
    <div className="relative h-screen w-full ">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className=" text-5xl">Welcome, smanile</div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center ">
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
              {isLoading ? (
                <Button
                  danger
                  type="primary"
                  onClick={handleStop}
                  className="flex items-center justify-center gap-2"
                >
                  Stop <CirclePause size={15} />
                </Button>
              ) : message.trim() ? (
                <Button
                  type="primary"
                  onClick={handleSend}
                  className="flex items-center justify-center gap-2"
                >
                  Send <Send size={15} />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
