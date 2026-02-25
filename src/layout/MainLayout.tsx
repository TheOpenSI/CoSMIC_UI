import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "#FFFFFF",
      }}
    >
      <Sidebar />
      <Content style={{ marginLeft: 48 }}>
        <div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;
