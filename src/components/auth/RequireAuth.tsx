/// --- Core libraries --- ///
import {
	Navigate,
	Outlet,
	useLocation
} from "react-router-dom";
import { Spin } from "antd";
import { useEffect } from "react";


/// --- Type hints --- ///


/// --- Internal libraries --- ///
import { useAuthStore } from "../../stores/AuthStore";
import { useUserStore } from "../../stores/UserStore";


export default function RequireAuth() {
	const location = useLocation();
	const { user, loading, checkSession } = useAuthStore();
	const fetchUsers = useUserStore((state) => state.fetchUsers);

	useEffect(
		() => {
			void checkSession();
		},
		[checkSession]
	);

	useEffect(
		() => {
			if (user) {
				void fetchUsers(user);
			}
		},
		[
			user,
			fetchUsers
		]
	);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spin size="large" />
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	return <Outlet />;
}
