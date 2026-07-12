import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Upload,
  Lightbulb,
  FolderOpen,
  Users,
  Settings,
  User,
} from "lucide-react";

import type { SidebarItem } from "../types/navigation";

export const adminSidebarItems: SidebarItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Tasks", path: "/admin/tasks", icon: CheckSquare },
  { label: "Calendar", path: "/admin/calendar", icon: Calendar },
  { label: "Ready to Upload", path: "/admin/ready-to-upload", icon: Upload },
  { label: "Content Ideas", path: "/admin/content-ideas", icon: Lightbulb },
  { label: "Asset Library", path: "/admin/assets", icon: FolderOpen },
  { label: "Employees", path: "/admin/employees", icon: Users },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export const employeeSidebarItems: SidebarItem[] = [
  { label: "My Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
  { label: "My Tasks", path: "/employee/tasks", icon: CheckSquare },
  { label: "My Calendar", path: "/employee/calendar", icon: Calendar },
  { label: "Asset Library", path: "/employee/assets", icon: FolderOpen },
  { label: "My Profile", path: "/employee/profile", icon: User },
];