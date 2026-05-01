import { ArrowLeftToLine, Trash2 } from "lucide-react";
import { useSidebarStore } from "../../stores/SidebarStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";

import { deleteChatSession, getAllChatSessions } from "../../api/chat";

dayjs.extend(relativeTime);

export default function ChatHistoryPanel() {
  const collapseChatPanel = useSidebarStore((state) => state.collapseChatPanel);
  const goNone = useSidebarStore((state) => state.goNone);
  const { chatID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: allChats } = useQuery({
    queryKey: ["allUsersAndChatSessions"],
    queryFn: getAllChatSessions,
  });

  const sortedChats = (allChats?.result ?? [])
    .filter((chat) => chat.user_id === "019dcd10-fb71-72d4-8322-a1965859b490") //TODO change this to dynamic when auth is applied
    .sort((a, b) => dayjs(b.create_on).unix() - dayjs(a.create_on).unix());

  console.log(sortedChats);

  const { mutate: handleDeleteChat } = useMutation({
    mutationFn: (chatID: string) => deleteChatSession(chatID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsersAndChatSessions"] });
      // TO DO: when delete the current chat go back to new
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const handleNewChat = () => {
    navigate("/chat", { replace: true });
    goNone();
  };
  return (
    <div className="w-full h-full bg-[#F0F5F9] p-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={handleNewChat}
          className="flex-1 cursor-pointer bg-[#0079FF] hover:bg-[#005FCC] active:bg-[#004BB5] text-white font-bold py-2 text-[15px] rounded-lg transition-colors duration-150"
        >
          New Chat
        </button>
        <button
          onClick={collapseChatPanel}
          className="p-1.5 cursor-pointer hover:bg-[#E2E8ED] rounded-lg"
        >
          <ArrowLeftToLine size={25} color="#545A6A" />
        </button>
      </div>

      <div className="flex flex-col gap-1 overflow-y-auto flex-1">
        {sortedChats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400 mt-10">
            No chats yet
          </div>
        ) : (
          sortedChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className={`group relative w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E2E8ED] cursor-pointer transition-colors ${chatID === chat.id ? "bg-[#E2E8ED]" : ""}`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {chat.name}
                  </span>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {chat.details?.[0]?.user_query ?? ""}
                  </p>
                </div>

                <div className="shrink-0 mt-0.5">
                  <span className="text-xs text-gray-400 whitespace-nowrap group-hover:hidden">
                    {dayjs(chat.create_on).fromNow()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="cursor-pointer hidden group-hover:flex items-center justify-center p-1 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
