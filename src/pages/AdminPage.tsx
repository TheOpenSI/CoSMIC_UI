import { ChartCandlestick, Cpu, Settings, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";

export default function AdminPage() {
  const subNavItems = [
    { key: "users", label: "Users", icon: UsersRound, path: "/admin/users" },
    {
      key: "configs",
      label: "Configs",
      icon: Settings,
      path: "/admin/configs",
    },
    { key: "models", label: "Models", icon: Cpu, path: "/admin/models" },
    {
      key: "Dashboard",
      label: "Dashboard",
      icon: ChartCandlestick,
      path: "/admin/DashBoard",
    },
  ];

  return (
    <div className="h-full flex">
      <aside className="w-60 px-4 py-5 overflow-hidden">
        <div className="text-[13px] font-semibold text-[#60768D] mb-0.5 pl-2">
          Admin Panel
        </div>

        <div className="flex flex-col gap-1">
          {subNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block w-full gap-2 px-3 py-2 rounded-lg text-[13px]
     no-underline transition-colors ${
       isActive ? "bg-[#E7E8EB]!" : "hover:bg-[#F1F2F4]!"
     } text-[#111827]`
                }
              >
                <div className=" flex items-center gap-2">
                  <Icon size={15} className="text-[#111827]" />
                  <span className="text-[#111827]">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 px-4 py-5 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
