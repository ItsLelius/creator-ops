import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage } from "../features/auth/LoginPage";
import { AppShell } from "../components/layout/AppShell";
import { adminSidebarItems, employeeSidebarItems } from "../constants/sidebar";
import { AdminDashboardPage } from "../features/admin/dashboard/AdminDashboardPage";
import { EmployeeDashboardPage } from "../features/employee/dashboard/EmployeeDashboardPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-slate-400">This page UI will be built next.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AppShell sidebarItems={adminSidebarItems} roleLabel="Admin" />,
    children: [
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "tasks", element: <PlaceholderPage title="Tasks" /> },
      { path: "calendar", element: <PlaceholderPage title="Calendar" /> },
      { path: "ready-to-upload", element: <PlaceholderPage title="Ready to Upload" /> },
      { path: "content-ideas", element: <PlaceholderPage title="Content Ideas" /> },
      { path: "assets", element: <PlaceholderPage title="Asset Library" /> },
      { path: "employees", element: <PlaceholderPage title="Employees" /> },
      { path: "settings", element: <PlaceholderPage title="Settings" /> },
    ],
  },
  {
    path: "/employee",
    element: <AppShell sidebarItems={employeeSidebarItems} roleLabel="Employee" />,
    children: [
      { path: "dashboard", element: <EmployeeDashboardPage /> },
      { path: "tasks", element: <PlaceholderPage title="My Tasks" /> },
      { path: "calendar", element: <PlaceholderPage title="My Calendar" /> },
      { path: "assets", element: <PlaceholderPage title="Asset Library" /> },
      { path: "profile", element: <PlaceholderPage title="My Profile" /> },
    ],
  },
]);