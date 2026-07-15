import type { ReactNode } from "react";
import type { CurrentUser, PageKey, SidebarItem } from "../../types";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  sidebarItems: SidebarItem[];
  currentUser: CurrentUser;
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({
  isSidebarOpen,
  onCloseSidebar,
  activePage,
  onPageChange,
  sidebarItems,
  currentUser,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0D10] text-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={onCloseSidebar}
        activePage={activePage}
        onPageChange={onPageChange}
        items={sidebarItems}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      <main className="h-screen min-w-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-8">
        {children}
      </main>
    </div>
  );
}