import { Outlet } from "react-router-dom";
import type { SidebarItem } from "../../types/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type AppShellProps = {
  sidebarItems: SidebarItem[];
  roleLabel: string;
};

export function AppShell({ sidebarItems, roleLabel }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar items={sidebarItems} />

        <div className="flex min-h-screen flex-1 flex-col">
          <Header roleLabel={roleLabel} />

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}