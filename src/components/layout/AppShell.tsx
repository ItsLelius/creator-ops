import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  children: ReactNode;
};

export function AppShell({
  isSidebarOpen,
  onCloseSidebar,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0D10] text-slate-100">
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />

      <main className="h-screen flex-1 overflow-y-auto p-4 sm:p-5 lg:p-8">
        {children}
      </main>
    </div>
  );
}