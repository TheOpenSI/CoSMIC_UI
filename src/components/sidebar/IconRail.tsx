import {
  MessageCircleMore,
  PanelRightClose,
  Plus,
  UserRound,
  UserKey,
} from "lucide-react";
import { useSidebar } from "../../hooks/useSidebar";

export default function IconRail() {
  const { isOpen } = useSidebar();

  const navItems = [
    { icon: <MessageCircleMore color="#545A6A" size={18} />, label: "Chats" },
    { icon: <UserKey color="#545A6A" size={18} />, label: "Admin" },
  ];

  return (
    <div
      className={`flex flex-col items-center justify-between h-screen py-3 ${
        isOpen
          ? "border-none bg-[#F0F5F9]"
          : "border-gray-100 bg-white hover:bg-[#f8fbfb] border-r"
      }`}
    >
      <div className="flex flex-col items-center gap-1">
        {!isOpen && (
          <button className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer mb-2">
            <PanelRightClose color="#545A6A" size={18} />
          </button>
        )}
        {!isOpen && (
          <button className="p-2 flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer">
            <Plus color="#545A6A" size={18} />
          </button>
        )}

        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center justify-center rounded-xl hover:bg-gray-300 cursor-pointer ${isOpen ? "px-2 py-1.5 flex-col" : "p-2"}`}
          >
            {item.icon}
            {isOpen && <span className="text-[13px] mt-0.5">{item.label}</span>}
          </button>
        ))}
      </div>

      <button
        className={`${isOpen ? "p-3" : "p-2"} flex items-center justify-center rounded-xl bg-gray-300 cursor-pointer hover:bg-gray-400`}
      >
        <UserRound color="#545A6A" size={18} />
      </button>
    </div>
  );
}
