import { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppShell
      isSidebarOpen={sidebarOpen}
      onCloseSidebar={() => setSidebarOpen(false)}
    >
      <DashboardPage onOpenSidebar={() => setSidebarOpen(true)} />
    </AppShell>
  );
}

export default App;