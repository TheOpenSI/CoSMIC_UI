import { ArrowLeftToLine, Search } from "lucide-react";
import { useSidebarStore } from "../../stores/SidebarStore";

export default function ChatHistoryPanel() {
  const collapseChatPanel = useSidebarStore((state) => state.collapseChatPanel);

  const chats = [
    {
      id: 1,
      title: "Machine Learning",
      preview:
        "it looks like its the best algorithms of all time. It is good to kn...",
      time: "23m",
      active: true,
    },
    {
      id: 2,
      title: "Machine Learning 20",
      preview:
        "it looks like its the best algorithms of all time. It is good to kn....",
      time: "1h",
      active: false,
    },
  ];
  return (
    <div className="w-full h-full bg-[#F0F5F9] p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button className="flex-1 cursor-pointer bg-[#0079FF] text-white font-bold py-2 text-[15px] rounded-lg">
          New Chat
        </button>
        <button
          onClick={collapseChatPanel}
          className="p-1.5 cursor-pointer hover:bg-[#E2E8ED] rounded-lg"
        >
          <ArrowLeftToLine size={25} color="#545A6A" />
        </button>
      </div>
      <div className="flex items-center gap-2 bg-[#E2E8ED] rounded-lg px-2 py-2">
        <Search color="#8C8C8C" />
        <input
          type="text"
          placeholder="Search Chats"
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="p-2 rounded-lg hover:bg-[#E2E8ED] cursor-pointer"
          >
            <div className="flex justify-between items-center ">
              <span className="font-semibold text-gray-900 text-sm">
                {chat.title}
              </span>
              <span className="text-xs text-gray-900">• {chat.time}</span>
            </div>
            <p className="text-xs text-gray-900 truncate mt-0.5">
              {chat.preview}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
