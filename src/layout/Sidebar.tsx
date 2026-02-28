import {
  ArrowRightToLine,
  CircleFadingPlus,
  MessagesSquare,
  Undo2,
  UserKey,
  UserRound,
} from "lucide-react";
import { useSidebarStore } from "../stores/SidebarStore";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const open = useSidebarStore((state) => state.open);
  const openChatPanel = useSidebarStore((state) => state.openChatPanel);
  const openAdmin = useSidebarStore((state) => state.openAdmin);
  const active = useSidebarStore((s) => s.active);
  const goNone = useSidebarStore((s) => s.goNone);

  const chatsSelected = active === "chats";
  const adminSelected = active === "admin";

  const handleRailClick = () => {
    if (isOpen) return;

    if (active === "none" || active === "chats") {
      openChatPanel();
      navigate("/");
    }
    if (active === "admin") {
      open();
      navigate("/admin");
      return;
    }
  };

  return (
    <div
      style={{
        width: "full",
        height: "100vh",
        cursor: isOpen ? "default" : "e-resize",
      }}
      onClick={handleRailClick}
    >
      <div
        className={`
      h-screen flex flex-col items-center justify-between py-3
      ${
        isOpen
          ? " bg-[#F0F5F9]"
          : "border-r border-gray-100 hover:bg-[#f8fbfb] cursor-e-resize"
      }
    `}
      >
        <div className="w-full flex flex-col items-center gap-1 ">
          {!isOpen &&
            (active === "none" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openChatPanel();
                  navigate("/");
                }}
                className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer mb-4"
              >
                <ArrowRightToLine color="#545A6A" size={18} />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNone();
                  navigate("/");
                }}
                className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer mb-4"
              >
                <Undo2 color="#545A6A" size={18} />
              </button>
            ))}
          {!isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer "
            >
              <CircleFadingPlus color="#545A6A" size={18} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              openChatPanel();
              navigate("/");
            }}
            className={`p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer  ${isOpen ? "px-2.5 py-1.5 flex-col " : "p-2"}${chatsSelected ? "bg-gray-300" : "hover:bg-gray-300"}`}
          >
            <MessagesSquare color="#545A6A" size={18} />
            {isOpen && <span className="text-[10px] mt-0.5">Chats</span>}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openAdmin();
              navigate("/admin");
            }}
            className={`
    flex items-center justify-center rounded-xl cursor-pointer
    ${isOpen ? "px-2.5 py-1.5 flex-col" : "p-2"}
    ${adminSelected ? "bg-gray-300" : "hover:bg-gray-300"}
  `}
          >
            <UserKey color="#545A6A" size={18} />
            {isOpen && <span className="text-[10px] mt-0.5">Admin</span>}
          </button>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className={`${isOpen ? "p-3.5" : "p-2"} flex items-center justify-center rounded-xl bg-gray-300 cursor-pointer hover:bg-gray-400`}
        >
          <UserRound color="#545A6A" size={18} />
        </button>
      </div>
    </div>
  );
}
