import MainContent from "../components/main/MainContent";
import Sidebar from "../components/sidebar/Sidebar";

export default function ChatPage() {
  return (
    <div className=" flex ">
      <Sidebar />
      <MainContent />
    </div>
  );
}
