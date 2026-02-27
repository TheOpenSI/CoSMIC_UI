import {
  MessageCircleMore,
  UserRound,
  UserKey,
  PanelRightClose,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useSidebarStore } from "../../stores/SidebarStore";

export default function IconRail() {
  const { isOpen } = useSidebarStore((state) => ({
    isOpen: state.isOpen,
    // open: state.open,
    // close: state.close,
  }));
  const navigate = useNavigate();

  const navItems = [
    {
      icon: <MessageCircleMore color="#545A6A" size={18} />,
      label: "Chats",
      path: "/",
    },
    {
      icon: <UserKey color="#545A6A" size={18} />,
      label: "Admin",
      path: "/admin",
    },
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(item.path);
            }}
            className={`flex items-center justify-center rounded-xl cursor-pointer ${
              location.pathname === item.path
                ? "bg-gray-300"
                : "hover:bg-gray-300"
            } ${isOpen ? "px-2.5 py-1.5 flex-col" : "p-2"}`}
          >
            {item.icon}
            {isOpen && (
              <span
                className={`text-[10px] mt-0.5 ${location.pathname === item.path ? "font-bold" : ""}`}
              >
                {item.label}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={(e) => e.stopPropagation()}
        className={`${isOpen ? "p-3.5" : "p-2"} flex items-center justify-center rounded-xl bg-gray-300 cursor-pointer hover:bg-gray-400`}
      >
        <UserRound color="#545A6A" size={18} />
      </button>
    </div>
  );
}
