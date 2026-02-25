import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "../providers/SidebarProvider";
import ChatHistoryPanel from "../components/sidebar/ChatHistoryPanel";
import { useSidebar } from "../hooks/useSidebar";

const { Content } = Layout;

const MainLayout = () => {
  const { isOpen } = useSidebar();
  return (
    <SidebarProvider>
      <Layout
        style={{
          height: "100vh",
          overflow: "hidden",
          background: "#FFFFFF",
        }}
      >
        <Sidebar />

        <div
          style={{
            position: "fixed",
            left: 48,
            top: 0,
            width: isOpen ? 320 : 0,
            height: "100vh",
            overflow: "hidden",
            transition: "width 200ms ease",
            zIndex: 15,
            background: "#F0F5F9",
            borderRight: isOpen ? "1px solid #f0f0f0" : "none",
          }}
        >
          <ChatHistoryPanel />
        </div>
        <Content style={{ marginLeft: 48 }}>
          <Outlet />
        </Content>
      </Layout>
    </SidebarProvider>
  );
};

export default MainLayout;
