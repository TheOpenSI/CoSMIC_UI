import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import ChatPage from "./pages/ChatPage";
import UsersPage from "./pages/admin_sub_pages/UsersPage";
import ConfigsPage from "./pages/admin_sub_pages/ConfigsPage";
import ModelsPage from "./pages/admin_sub_pages/ModelsPage";
import AnalyticsPage from "./pages/admin_sub_pages/AnalyticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<ChatPage />} />
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
