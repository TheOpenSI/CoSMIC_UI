import { ArrowRightToLine, MessageCircleMore, Plus } from "lucide-react";
import { useSidebarStore } from "../stores/SidebarStore";

export default function Sidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const open = useSidebarStore((state) => state.open);

  return (
    <div
      style={{
        width: "full",
        height: "100vh",
        cursor: isOpen ? "default" : "e-resize",
      }}
      onClick={!isOpen ? open : undefined}
    >
      <div
        className={`
      h-screen flex flex-col items-center justify-between py-3
      ${
        isOpen
          ? " bg-[#F0F5F9]"
          : "border-r border-gray-200 hover:bg-[#f8fbfb] cursor-e-resize"
      }
    `}
      >
        <div className="w-full flex flex-col items-center gap-1 ">
          {!isOpen && (
            <button className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer mb-4">
              <ArrowRightToLine color="#545A6A" size={22} />
            </button>
          )}
          {!isOpen && (
            <button className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer ">
              <Plus color="#545A6A" size={22} />
            </button>
          )}

          <button
            className={`p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer  ${isOpen ? "px-2.5 py-1.5 flex-col" : "p-2"}`}
          >
            <MessageCircleMore color="#545A6A" size={isOpen ? 15 : 22} />
            {isOpen && <span className="text-[10px] mt-0.5">Chats</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
