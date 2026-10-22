/// --- Core libraries --- ///
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useParams,
} from "react-router-dom";


/// --- Type hints --- ///


/// --- Internal libraries --- ///
import RequireAuth from "./components/auth/RequireAuth";
import RequireAdmin from "./components/auth/RequireAdmin";
import MainLayout from "./layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ChatPage from "./pages/ChatPage";
import UsersPage from "./pages/settings_sub_pages/UsersPage";
import ConfigsPage from "./pages/settings_sub_pages/ConfigsPage";
import ModelsPage from "./pages/settings_sub_pages/ModelsPage";
import DashboardPage from "./pages/settings_sub_pages/DashboardPage";
import { useAuthStore } from "./stores/AuthStore";
import { hasAdminAccess } from "./lib/authorisation";


function ChatPageWrapper() {
	const { chatID } = useParams();
	return <ChatPage key={chatID} />;
}

// Admins can view all settings while regular users can only view the dashboard
function SettingsIndexRedirect() {
	const user = useAuthStore((state) => state.user);
	const target = hasAdminAccess(user?.roles)
		? "/settings/users"
		: "/settings/dashboard";

	return <Navigate to={target} replace />;
}

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Public — the platform redirects straight to Keycloak */}
				<Route path="/login" element={<LoginPage />} />

				{/* Protected — must be logged in */}
				<Route element={<RequireAuth />}>
					<Route element={<MainLayout />}>
						<Route index element={<Navigate to="/chat" replace />} />
						<Route path="/chat" element={<ChatPage />} />
						<Route path="/chat/:chatSessionId" element={<ChatPageWrapper />} />
						<Route path="/settings" element={<SettingsPage />}>
							<Route index element={<SettingsIndexRedirect />} />
							<Route path="dashboard" element={<DashboardPage />} />

							{/* Admin-only sections */}
							<Route element={<RequireAdmin />}>
								<Route path="users" element={<UsersPage />} />
								<Route path="configs" element={<ConfigsPage />} />
								<Route path="models" element={<ModelsPage />} />
							</Route>
						</Route>
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
