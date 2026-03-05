import {
  ArrowRightToLine,
  CircleFadingPlus,
  Undo2,
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={chatsSelected ? "#111827" : "#545A6A"}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-messages-square-icon lucide-messages-square"
            >
              <path
                d="M16 10a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 14.286V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                fill={chatsSelected ? "#111827" : "none"}
              />
              <path d="M20 9a2 2 0 0 1 2 2v10.286a.71.71 0 0 1-1.212.502l-2.202-2.202A2 2 0 0 0 17.172 19H10a2 2 0 0 1-2-2v-1" />
            </svg>
            {isOpen && (
              <span
                className={`text-[10px] mt-0.5 ${chatsSelected ? "font-bold" : ""}`}
              >
                Chats
              </span>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openAdmin();
              navigate("/admin");
            }}
            className={`
              flex items-center justify-center rounded-xl cursor-pointer
              ${isOpen ? "px-2 py-1.5 flex-col" : "p-2"}
              ${adminSelected ? "bg-gray-300" : "hover:bg-gray-300"}
            `}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height=""
              viewBox="0 0 24 24"
              fill="none"
              stroke={adminSelected ? "#111827" : "#545A6A"}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-user-key-icon lucide-user-key"
            >
              <path d="M20 11v6" />
              <path d="M20 13h2" />
              <path d="M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 2.072.578" />
              <circle cx="10" cy="7" r="4" />
              <circle
                cx="20"
                cy="19"
                r="2"
                fill={adminSelected ? "#111827" : "none"}
              />
            </svg>
            {isOpen && (
              <span
                className={`text-[10px] mt-0.5 ${adminSelected ? "font-bold" : ""}`}
              >
                Admin
              </span>
            )}
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
