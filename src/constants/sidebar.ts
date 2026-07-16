import {
  Calendar,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  Layers,
  Lightbulb,
  ListTodo,
  Upload,
  UserCircle,
  Users,
  Video,
} from "lucide-react";
import type { SidebarItem } from "../types";

export const adminSidebarItems: SidebarItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "brandPages", label: "Brand Pages", icon: Layers },
  { key: "todo", label: "To Do List", icon: ListTodo },
  { key: "production", label: "Production Board", icon: ClipboardList },
  { key: "calendar", label: "Calendar", icon: Calendar },
  { key: "ready", label: "Ready to Upload", icon: Upload },
  { key: "published", label: "Uploaded Content", icon: Video },
  { key: "ideas", label: "Content Ideas", icon: Lightbulb },
  { key: "assets", label: "Asset Library", icon: FolderOpen },
  { key: "employees", label: "Team", icon: Users },
];

export const employeeSidebarItems: SidebarItem[] = [
  { key: "todo", label: "My To Do List", icon: ListTodo },
  { key: "production", label: "My Submissions", icon: ClipboardList },
  { key: "assets", label: "Asset Library", icon: FolderOpen },
  { key: "profile", label: "My Profile", icon: UserCircle },
];