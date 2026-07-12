import type { Employee, Task } from "../types";

export const tasks: Task[] = [
  {
    id: "1",
    title: "Buffalo Bacon Ranch Chicken Cheese Sticks",
    brand: "Maya's Kitchen",
    status: "submitted",
    assignee: "Maria",
    due: "Today, 6:00 PM",
    dueGroup: "Today",
  },
  {
    id: "2",
    title: "Chicken Broccoli Alfredo Garlic Bread Bowl",
    brand: "Maya's Kitchen",
    status: "in_progress",
    assignee: "John",
    due: "Tomorrow",
    dueGroup: "Tomorrow",
  },
  {
    id: "3",
    title: "Peach Cobbler Ice Cream Remake",
    brand: "Maya's Kitchen",
    status: "needs_revision",
    assignee: "Maria",
    due: "Today, 8:00 PM",
    dueGroup: "Today",
  },
  {
    id: "4",
    title: "Maya CTA Cookbook Scene",
    brand: "Maya's Kitchen",
    status: "ready_to_upload",
    assignee: "Adi",
    due: "This Week",
    dueGroup: "This Week",
  },
  {
    id: "5",
    title: "King Ranch Chicken Casserole",
    brand: "Maya's Kitchen",
    status: "to_generate",
    assignee: "All Employees",
    due: "Tomorrow",
    dueGroup: "Tomorrow",
  },
];

export const employees: Employee[] = [
  {
    id: "1",
    name: "Maria",
    role: "Employee",
    status: "Online",
    lastSeen: "Now",
  },
  {
    id: "2",
    name: "John",
    role: "Employee",
    status: "Offline",
    lastSeen: "12 minutes ago",
  },
];

export const recentActivity = [
  "Maria submitted Buffalo Bacon Ranch Chicken Cheese Sticks.",
  "Peach Cobbler Ice Cream Remake needs revision.",
  "Maya CTA Cookbook Scene moved to Ready to Upload.",
];