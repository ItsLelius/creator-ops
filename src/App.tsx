import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { PublishedContentPage } from "./pages/PublishedContentPage";
import { ReadyToUploadPage } from "./pages/ReadyToUploadPage";
import { TasksPage } from "./pages/TasksPage";
import type { PageKey } from "./types";
import { CalendarPage } from "./pages/CalendarPage";
import { ContentIdeasPage } from "./pages/ContentIdeasPage";
import { AssetLibraryPage } from "./pages/AssetLibraryPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageKey>("tasks");

  function openSidebar() {
    setSidebarOpen(true);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage onOpenSidebar={openSidebar} />;

      case "tasks":
        return <TasksPage onOpenSidebar={openSidebar} />;

      case "ready":
        return <ReadyToUploadPage onOpenSidebar={openSidebar} />;

      case "published":
        return <PublishedContentPage onOpenSidebar={openSidebar} />;

      case "calendar":
        return <CalendarPage onOpenSidebar={openSidebar} />;

      case "ideas":
        return <ContentIdeasPage onOpenSidebar={openSidebar} />;

      case "assets":
        return <AssetLibraryPage onOpenSidebar={openSidebar} />;

      case "employees":
        return (
          <ComingSoonPage
            title="Employees"
            description="Employee accounts, roles, online status, and assigned work summaries will appear here."
          />
        );

      default:
        return (
          <ComingSoonPage
            title="Coming Soon"
            description="This page will be built after the main production flow."
          />
        );
    }
  }

  return (
    <AppShell
      isSidebarOpen={sidebarOpen}
      onCloseSidebar={closeSidebar}
      activePage={currentPage}
      onPageChange={setCurrentPage}
    >
      <div key={currentPage} className="page-transition h-full min-h-0">
        {renderPage()}
      </div>
    </AppShell>
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
    <div className="flex h-full min-h-0 flex-col">
      <header className="mb-5 shrink-0">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </header>

      <section className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-[#111318] p-6">
        <div className="text-center">
          <p className="text-lg font-bold text-white">Coming Soon</p>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            We will build this page after Tasks, Ready to Upload, and Published
            Content are finalized.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;