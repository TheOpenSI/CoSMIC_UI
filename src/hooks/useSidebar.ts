import { useContext } from "react";
import { SidebarContext } from "../context/SidebarContext";

export function useSidebar() {
  return useContext(SidebarContext);
}
