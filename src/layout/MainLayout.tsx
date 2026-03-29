import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";

import { useSidebarStore } from "../stores/SidebarStore";
// import Sidebar from "./Sidebar";
// import ChatHistoryPanel from "../components/sidebar/ChatHistoryPanel";
import { useEffect } from "react";

const { Content } = Layout;

// const RAIL_COLLAPSED = 48;
// const RAIL_EXPANDED = 60;
// const CHAT_PANEL_WIDTH = 320;

const MainLayout = () => {
  // const isOpen = useSidebarStore((s) => s.isOpen);
  // const active = useSidebarStore((s) => s.active);
  const openAdmin = useSidebarStore((s) => s.openAdmin);
  const openChatPanel = useSidebarStore((s) => s.openChatPanel);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      openAdmin();
    } else {
      openChatPanel();
    }
  }, [location.pathname, openAdmin, openChatPanel]);

  // const showChatsPanel = active === "chats";
  // const railWidth = isOpen ? RAIL_EXPANDED : RAIL_COLLAPSED;
  // const leftWidth = railWidth + (showChatsPanel ? CHAT_PANEL_WIDTH : 0);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", background: "#fff" }}>
      {/* <div
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
        <div style={{ width: railWidth, flexShrink: 0 }}>
          <Sidebar />
        </div>

        {showChatsPanel && (
          <div style={{ width: CHAT_PANEL_WIDTH, flexShrink: 0 }}>
            <ChatHistoryPanel />
          </div>
        )}
      </div> */}

      <Content
        style={{
          // marginLeft: leftWidth,
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
