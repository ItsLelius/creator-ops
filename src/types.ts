import type { LucideIcon } from "lucide-react";

export type PageKey =
  | "dashboard"
  | "tasks"
  | "calendar"
  | "ready"
  | "published"
  | "ideas"
  | "assets"
  | "employees";

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
  detail: string;
};

export type Employee = {
  id: string;
  name: string;
  role: "Admin" | "Employee";
  status: "Online" | "Offline";
  lastSeen: string;
};

export type SidebarItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};

export type UploadDetails = {
  caption: string;
  driveUrl: string;
  platform: string;
  schedule: string;
  hashtags: string;
  notes: string;
};

export type PublishedContent = {
  id: string;
  title: string;
  brand: string;
  platform: string;
  postedDate: string;
  publicUrl: string;
  driveUrl: string;
  caption: string;
  hashtags: string;
  postedBy: string;
};

export type CalendarPostStatus = "scheduled" | "ready" | "posted" | "missed";

export type CalendarPost = {
  id: string;
  title: string;
  brand: string;
  platform: string;
  date: string;
  dayLabel: string;
  times: string[];
  status: CalendarPostStatus;
  linkedTaskId?: string;
};

export type ContentIdea = {
  id: string;
  title: string;
  brand: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  hook: string;
  notes: string;
  createdAt: string;
};

export type AssetType = "pdf" | "image" | "doc";

export type AssetItem = {
  id: string;
  title: string;
  brand: string;
  category: string;
  type: AssetType;
  fileUrl: string;
  description: string;
  uploadedAt: string;
};