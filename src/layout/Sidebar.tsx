import { Layout } from "antd";
import IconRail from "../components/sidebar/IconRail";
import { useSidebar } from "../hooks/useSidebar";

const { Sider } = Layout;

export default function Sidebar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <Sider
      width={isOpen ? 60 : 48}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        zIndex: 100,
        background: "transparent",
        cursor: "e-resize",
      }}
      onClick={toggle}
    >
      <IconRail />
    </Sider>
  );
}
