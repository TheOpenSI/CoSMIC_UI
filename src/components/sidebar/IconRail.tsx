import {
  MessageCircleMore,
  PanelRightClose,
  Plus,
  UserRound,
  UserKey,
} from "lucide-react";

export default function IconRail() {
  const navItems = [
    { icon: <Plus color="#545A6A" size={18} />, label: "New Chat" },
    { icon: <MessageCircleMore color="#545A6A" size={18} />, label: "Chats" },
    { icon: <UserKey color="#545A6A" size={18} />, label: "Admin Panel" },
  ];

  return (
    <div className="flex flex-col items-center justify-between w-12 h-screen border-r border-gray-100 hover:bg-[#f8fbfb] py-3">
      <div className="flex flex-col items-center gap-1">
        <button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-300 cursor-pointer mb-2">
          <PanelRightClose color="#545A6A" size={18} />
        </button>

        {navItems.map((item) => (
          <button
            key={item.label}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-300 cursor-pointer"
          >
            {item.icon}
          </button>
        ))}
      </div>

      <button className="w-9 h-9 flex items-center justify-center rounded-md bg-gray-100 cursor-pointer hover:bg-gray-300">
        <UserRound color="#545A6A" size={18} />
      </button>
    </div>
  );
}
