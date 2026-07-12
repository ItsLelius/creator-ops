import type { LucideIcon } from "lucide-react";

export type TaskStatus =
  | "to_generate"
  | "in_progress"
  | "submitted"
  | "needs_revision"
  | "approved"
  | "ready_to_upload"
  | "posted";

export type DueGroup = "Today" | "Tomorrow" | "This Week";

export type Task = {
  id: string;
  title: string;
  brand: string;
  status: TaskStatus;
  assignee: string;
  due: string;
  dueGroup: DueGroup;
};

export type Employee = {
  id: string;
  name: string;
  role: "Admin" | "Employee";
  status: "Online" | "Offline";
  lastSeen: string;
};

export type SidebarItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export type StatAccent = "blue" | "amber" | "red" | "violet" | "slate";