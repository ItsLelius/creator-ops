import {
  Calendar,
  CheckSquare,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Upload,
  Users,
  Video,
} from "lucide-react";
import type { SidebarItem } from "../types";

export const mainSidebarItems: SidebarItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "tasks", label: "Tasks", icon: CheckSquare },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "ready", label: "Ready to Upload", icon: Upload },
  { key: "published", label: "Published Content", icon: Video },
  { key: "ideas", label: "Content Ideas", icon: Lightbulb },
  { key: "assets", label: "Asset Library", icon: FolderOpen },
  { key: "employees", label: "Employees", icon: Users },
];