/// --- Core libraries --- ///
import {
	ChartCandlestick,
	Cpu,
	Settings,
	UsersRound
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";


/// --- Type hints --- ///


/// --- Internal libraries --- ///
import { useAuthStore } from "../stores/AuthStore";
import { hasAdminAccess } from "../lib/authorisation";


export default function SettingsPage() {
	const user = useAuthStore((state) => state.user);
	const isAdmin = hasAdminAccess(user?.roles);

	const subNavItems = [
		...(
			isAdmin
				? [
					{
						key: "users",
						label: "Users",
						icon: UsersRound,
						path: "/settings/users",
					},
					{
						key: "configs",
						label: "Configs",
						icon: Settings,
						path: "/settings/configs",
					},
					{
						key: "models",
						label: "Models",
						icon: Cpu,
						path: "/settings/models",
					},
				]
				: []
		),
		{
			key: "dashboard",
			label: "Dashboard",
			icon: ChartCandlestick,
			path: "/settings/dashboard",
		},
	];

	return (
		<div className="h-full flex">
			<aside className="w-60 px-4 py-5 overflow-hidden">
				<div className="text-[13px] font-semibold text-[#60768D] mb-0.5 pl-2">Settings</div>

				<div className="flex flex-col gap-1">
					{
						subNavItems.map(
							(item) => {
								const Icon = item.icon;

								return (
									<NavLink
										key={item.key}
										to={item.path}
										className={
											({ isActive }) =>
											`block w-full gap-2 px-3 py-2 rounded-lg text-[13px]
											no-underline transition-colors ${
												isActive
													? "bg-[#E7E8EB]!"
													: "hover:bg-[#F1F2F4]!"
											} text-[#111827]`
										}
									>
										<div className=" flex items-center gap-2">
											<Icon size={15} className="text-[#111827]" />
											<span className="text-[#111827]">{item.label}</span>
										</div>
									</NavLink>
								);
							}
						)
					}
				</div>
			</aside>

			<main className="flex-1 px-4 py-5 overflow-auto"><Outlet /></main>
		</div>
	);
}
