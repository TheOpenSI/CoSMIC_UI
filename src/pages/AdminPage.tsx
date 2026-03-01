import { ChartCandlestick, Cpu, Settings, UsersRound } from "lucide-react";
import { useState } from "react";
import UsersPage from "./admin_sub_pages/UsersPage";
import ConfigsPage from "./admin_sub_pages/ConfigsPage";
import ModelsPage from "./admin_sub_pages/ModelsPage";
import AnalyticsPage from "./admin_sub_pages/AnalyticsPage";

export default function AdminPage() {
  const [active, setActive] = useState<
    "users" | "configs" | "models" | "analytics"
  >("users");

  const subNavItems = [
    {
      key: "users",
      label: "Users",
      icon: UsersRound,
      onClick: () => setActive("users"),
    },
    {
      key: "configs",
      label: "Configs",
      icon: Settings,
      onClick: () => setActive("configs"),
    },
    {
      key: "models",
      label: "Models",
      icon: Cpu,
      onClick: () => setActive("models"),
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: ChartCandlestick,
      onClick: () => setActive("analytics"),
    },
  ];

  const pages = {
    users: <UsersPage />,
    configs: <ConfigsPage />,
    models: <ModelsPage />,
    analytics: <AnalyticsPage />,
  };

  return (
    <div className="h-full flex">
      <aside className="w-60 px-4 py-5">
        <div className="text-[13px] font-semibold text-[#60768D] mb-0.5 pl-2">
          Admin Panel
        </div>

        <div className="flex flex-col gap-1">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.key;

            return (
              <button
                key={item.key}
                onClick={item.onClick}
                className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-[15px] transition-colors ${
                  selected ? "bg-[#E7E8EB]" : "hover:bg-[#F1F2F4]"
                } text-[#111827]`}
              >
                <Icon size={15} className="text-[#111827]" />
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 px-4 py-5">{pages[active]}</main>
    </div>
  );
}
