import {
  Calendar,
  CheckSquare,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Upload,
  Users,
} from "lucide-react";
import type { SidebarItem } from "../types";

export const mainSidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Tasks", icon: CheckSquare },
  { label: "Calendar", icon: Calendar },
  { label: "Ready to Upload", icon: Upload },
  { label: "Content Ideas", icon: Lightbulb },
  { label: "Asset Library", icon: FolderOpen },
  { label: "Employees", icon: Users },
];