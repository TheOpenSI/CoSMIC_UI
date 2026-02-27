import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import ChatHistoryPanel from "../components/sidebar/ChatHistoryPanel";
import { useSidebarStore } from "../stores/SidebarStore";
import Sidebar from "./Sidebar";

const { Content } = Layout;
const SIDEBAR_WIDTH = 60;
const CHAT_PANEL_WIDTH = 420;

const MainLayout = () => {
  const isOpen = useSidebarStore((s) => s.isOpen);
  const leftWidth = isOpen ? SIDEBAR_WIDTH + CHAT_PANEL_WIDTH : SIDEBAR_WIDTH;

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", background: "#fff" }}>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: leftWidth,
          zIndex: 100,
          display: "flex",
          transition: "width 0.25s ease",
        }}
      >
        <div style={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}>
          <Sidebar />
        </div>

        {isOpen && (
          <div style={{ width: CHAT_PANEL_WIDTH, flexShrink: 0 }}>
            <ChatHistoryPanel />
          </div>
        )}
      </div>

      <Content
        style={{
          marginLeft: leftWidth,
          transition: "margin-left 0.25s ease",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default MainLayout;
