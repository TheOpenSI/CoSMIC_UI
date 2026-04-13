import { ArrowLeftToLine, Trash2 } from "lucide-react";
import { useSidebarStore } from "../../stores/SidebarStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteChat, loadAllChats, loadChat } from "../../lib/chatCache";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";

dayjs.extend(relativeTime);

export default function ChatHistoryPanel() {
  const collapseChatPanel = useSidebarStore((state) => state.collapseChatPanel);
  const goNone = useSidebarStore((state) => state.goNone);
  const { chatID } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: chats = [] } = useQuery({
    queryKey: ["chats"],
    queryFn: loadAllChats,
  });

  const sortedChats = [...chats].sort(
    (a, b) =>
      new Date(b.lastMessageCreatedAt).getTime() -
      new Date(a.lastMessageCreatedAt).getTime(),
  );

  const { mutate: handleDeleteChat } = useMutation({
    mutationFn: (chatID: string) => deleteChat(chatID),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate("/chat/new", { replace: true });
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const handleNewChat = async () => {
    // case 1: currently inside a chat, check if has message.length or not. If empty dont create new chat uuid, reuse
    if (chatID) {
      const existingChat = await loadChat(chatID);

      // current chat is empty, so reuse it
      if (!existingChat || existingChat.messages.length === 0) {
        navigate(`/chat/${chatID}`, { replace: true });
        goNone();
        return;
      }
    }
    // else if current chat has conversation, move to a fresh one
    navigate(`/chat/${uuidv4()}`, { replace: true });
    goNone();
    return;
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
              key={chat.chatID}
              onClick={() =>
                navigate(`/chat/${chat.chatID}`, { replace: true })
              }
              className="group relative w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#E2E8ED] cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {chat.title}
                  </span>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {chat.messages[1]?.content}
                  </p>
                </div>

                <div className="shrink-0 mt-0.5">
                  <span className="text-xs text-gray-400 whitespace-nowrap group-hover:hidden">
                    {dayjs(chat.lastMessageCreatedAt).fromNow()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.chatID);
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
