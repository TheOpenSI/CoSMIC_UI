import { Layout } from "antd";
import IconRail from "../components/sidebar/IconRail";

const { Sider } = Layout;

export default function Sidebar() {
  return (
    <Sider
      width={48}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        zIndex: 100,
        background: "transparent",
      }}
    >
      <IconRail />
    </Sider>
  );
}
