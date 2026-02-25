import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "../providers/SidebarProvider";

const { Content } = Layout;

const MainLayout = () => {
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
        <Content style={{ marginLeft: 48 }}>
          <Outlet />
        </Content>
      </Layout>
    </SidebarProvider>
  );
};

export default MainLayout;
