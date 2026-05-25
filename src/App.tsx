import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ChatPage from "./pages/ChatPage";
import UsersPage from "./pages/admin_sub_pages/UsersPage";
import ConfigsPage from "./pages/admin_sub_pages/ConfigsPage";
import ModelsPage from "./pages/admin_sub_pages/ModelsPage";
import AnalyticsPage from "./pages/admin_sub_pages/AnalyticsPage";
import { useUserStore } from "./stores/UserStore";
import { useEffect } from "react";

function ChatPageWrapper() {
  const { chatID } = useParams();
  return <ChatPage key={chatID} />;
}

export default function App() {
  const { fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatID" element={<ChatPageWrapper />} />
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="configs" element={<ConfigsPage />} />
            <Route path="models" element={<ModelsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
