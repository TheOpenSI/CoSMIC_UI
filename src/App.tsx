import { BrowserRouter, Route, Routes } from "react-router-dom";

import ChatPage from "./pages/ChatPage";
import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./layout/MainLayout";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<MainLayout />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
