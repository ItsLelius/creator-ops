import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { adminSidebarItems, employeeSidebarItems } from "./constants/sidebar";
import { useAuth } from "./context/AuthContext";
import { AssetLibraryPage } from "./pages/AssetLibraryPage";
import { BrandPagesPage } from "./pages/BrandPagesPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ContentIdeasPage } from "./pages/ContentIdeasPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductionBoardPage } from "./pages/ProductionBoardPage";
import { PublishedContentPage } from "./pages/PublishedContentPage";
import { ReadyToUploadPage } from "./pages/ReadyToUploadPage";
import { ToDoListPage } from "./pages/ToDoListPage";
import type { CurrentUser, PageKey, SidebarItem } from "./types";

function App() {
  const { currentUser, loading, signOut } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageKey>("dashboard");

  const sidebarItems = useMemo<SidebarItem[]>(() => {
    if (!currentUser) {
      return [];
    }

    return currentUser.role === "admin"
      ? adminSidebarItems
      : employeeSidebarItems;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || sidebarItems.length === 0) {
      return;
    }

    const currentPageAllowed = sidebarItems.some(
      (item) => item.key === currentPage,
    );

    if (!currentPageAllowed) {
      setCurrentPage(sidebarItems[0].key);
    }
  }, [currentPage, currentUser, sidebarItems]);

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  async function handleLogout() {
    await signOut();
    setSidebarOpen(false);
    setCurrentPage("dashboard");
  }

  function renderPage(user: CurrentUser) {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onOpenSidebar={openSidebar} />;

      case "brandPages":
        return <BrandPagesPage onOpenSidebar={openSidebar} />;

      case "todo":
        return (
          <ToDoListPage
            onOpenSidebar={openSidebar}
            currentUser={user}
          />
        );

      case "production":
        return (
          <ProductionBoardPage
            onOpenSidebar={openSidebar}
            currentUser={user}
          />
        );

      case "calendar":
        return <CalendarPage onOpenSidebar={openSidebar} />;

      case "ready":
        return <ReadyToUploadPage onOpenSidebar={openSidebar} />;

      case "published":
        return <PublishedContentPage onOpenSidebar={openSidebar} />;

      case "ideas":
        return <ContentIdeasPage onOpenSidebar={openSidebar} />;

      case "assets":
        return <AssetLibraryPage onOpenSidebar={openSidebar} />;

      case "employees":
        return <EmployeesPage onOpenSidebar={openSidebar} />;

      case "profile":
        return (
          <ProfilePage
            currentUser={user}
            onOpenSidebar={openSidebar}
          />
        );

      default:
        return (
          <ComingSoonPage
            title="Coming Soon"
            description="This page will be built after the main studio workflow."
          />
        );
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <AppShell
      isSidebarOpen={sidebarOpen}
      onCloseSidebar={closeSidebar}
      activePage={currentPage}
      onPageChange={setCurrentPage}
      sidebarItems={sidebarItems}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      <div key={currentPage} className="page-transition h-full min-h-0">
        {renderPage(currentUser)}
      </div>
    </AppShell>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0D10] p-6 text-slate-100">
      <div className="rounded-xl border border-white/10 bg-[#111318] p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#0B0D10] text-sm font-black text-white">
          AS
        </div>

        <p className="text-lg font-black text-white">Loading Adi Studios...</p>
        <p className="mt-2 text-sm text-slate-500">
          Checking your secure session.
        </p>
      </div>
    </main>
  );
}

function ProfilePage({
  currentUser,
  onOpenSidebar,
}: {
  currentUser: CurrentUser;
  onOpenSidebar: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-6 rounded-xl border border-white/10 bg-[#111318] p-6">
        <button
          onClick={onOpenSidebar}
          className="mb-4 rounded-lg border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          Open Menu
        </button>

        <p className="text-sm font-black uppercase tracking-wide text-slate-500">
          My Profile
        </p>

        <h1 className="mt-2 text-4xl font-black text-white">
          {currentUser.name}
        </h1>

        <p className="mt-2 text-sm text-slate-400">{currentUser.email}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#111318] p-6">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">
            Role
          </p>

          <p className="mt-3 text-2xl font-black capitalize text-white">
            {currentUser.role === "admin" ? "Admin" : "Member"}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            This profile comes from Supabase. Later, this page can support
            profile settings and account preferences.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111318] p-6">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">
            Permissions
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {currentUser.role === "admin"
              ? "Admin can access all pages, manage team members, create work, assign content, review submissions, and manage publishing."
              : "Member can only access assigned work, personal submissions, shared assets, and their profile."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="max-w-md rounded-xl border border-white/10 bg-[#111318] p-8 text-center">
        <p className="text-2xl font-black text-white">{title}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default App;