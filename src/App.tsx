import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Plus,
  Search,
  Settings,
  Upload,
  Users,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Tasks", icon: CheckSquare },
  { label: "Calendar", icon: Calendar },
  { label: "Ready to Upload", icon: Upload },
  { label: "Content Ideas", icon: Lightbulb },
  { label: "Asset Library", icon: FolderOpen },
  { label: "Employees", icon: Users },
  { label: "Settings", icon: Settings },
];

const tasks = [
  {
    title: "Buffalo Bacon Ranch Chicken Cheese Sticks",
    brand: "Maya's Kitchen",
    status: "Submitted",
    assignee: "Maria",
    due: "Today, 6:00 PM",
  },
  {
    title: "Chicken Broccoli Alfredo Garlic Bread Bowl",
    brand: "Maya's Kitchen",
    status: "In Progress",
    assignee: "John",
    due: "Tomorrow",
  },
  {
    title: "Peach Cobbler Ice Cream Remake",
    brand: "Maya's Kitchen",
    status: "Needs Revision",
    assignee: "Maria",
    due: "Jul 14",
  },
  {
    title: "Maya CTA Cookbook Scene",
    brand: "Maya's Kitchen",
    status: "Ready to Upload",
    assignee: "Adi",
    due: "Jul 15",
  },
];

const employees = [
  { name: "Maria", status: "Online", color: "bg-emerald-400" },
  { name: "John", status: "Last seen 12m ago", color: "bg-slate-500" },
];

function statusStyle(status: string) {
  switch (status) {
    case "In Progress":
      return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    case "Submitted":
      return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    case "Needs Revision":
      return "bg-red-500/10 text-red-300 border-red-500/20";
    case "Ready to Upload":
      return "bg-violet-500/10 text-violet-300 border-violet-500/20";
    default:
      return "bg-slate-500/10 text-slate-300 border-slate-500/20";
  }
}

function App() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-72 border-r border-white/5 bg-[#111318] p-5 lg:block">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-sm font-bold shadow-lg shadow-blue-500/20">
                AS
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Adi Studios</h1>
                <p className="text-xs text-slate-500">Production Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    item.active
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/5 bg-[#171A21] p-4">
            <p className="text-xs font-medium text-slate-400">Workspace</p>
            <p className="mt-1 text-sm font-semibold text-white">
              Maya's Kitchen
            </p>
            <p className="mt-3 text-xs text-slate-500">
              4 active production tasks this week.
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-5 lg:p-8">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#111318] p-4 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back, Adi</p>
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-[#0B0D10] px-3 py-2 md:flex">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  placeholder="Search tasks..."
                  className="w-48 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
                />
              </div>

              <button className="rounded-xl border border-white/5 bg-[#171A21] p-2.5 text-slate-300 hover:bg-white/5">
                <Bell className="h-4 w-4" />
              </button>

              <button className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400">
                <Plus className="h-4 w-4" />
                New Task
              </button>
            </div>
          </header>

          {/* Stats */}
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value="24"
              label="All production tasks"
              icon={<CheckSquare className="h-5 w-5" />}
              accent="blue"
            />
            <StatCard
              title="Submitted"
              value="4"
              label="Waiting for review"
              icon={<Upload className="h-5 w-5" />}
              accent="amber"
            />
            <StatCard
              title="Needs Revision"
              value="2"
              label="Needs employee fixes"
              icon={<AlertTriangle className="h-5 w-5" />}
              accent="red"
            />
            <StatCard
              title="Ready to Upload"
              value="7"
              label="Approved content"
              icon={<CheckCircle2 className="h-5 w-5" />}
              accent="violet"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            {/* Tasks Table */}
            <section className="rounded-3xl border border-white/5 bg-[#111318] p-5 shadow-2xl shadow-black/20">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Production Tasks
                  </h3>
                  <p className="text-sm text-slate-500">
                    Current content being generated and reviewed.
                  </p>
                </div>

                <button className="rounded-xl border border-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">
                  View all
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#171A21] text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Brand</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned</th>
                      <th className="px-4 py-3">Due</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {tasks.map((task) => (
                      <tr
                        key={task.title}
                        className="bg-[#111318] transition hover:bg-white/[0.03]"
                      >
                        <td className="max-w-[320px] px-4 py-4">
                          <p className="font-medium text-white">{task.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Script, Prompt A, Prompt B, Caption
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {task.brand}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={[
                              "rounded-full border px-2.5 py-1 text-xs font-medium",
                              statusStyle(task.status),
                            ].join(" ")}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {task.assignee}
                        </td>
                        <td className="px-4 py-4 text-slate-400">{task.due}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right Panel */}
            <aside className="space-y-6">
              <section className="rounded-3xl border border-white/5 bg-[#111318] p-5 shadow-2xl shadow-black/20">
                <h3 className="text-lg font-bold text-white">
                  Online Employees
                </h3>
                <div className="mt-4 space-y-3">
                  {employees.map((employee) => (
                    <div
                      key={employee.name}
                      className="flex items-center justify-between rounded-2xl bg-[#171A21] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-bold">
                          {employee.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {employee.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {employee.status}
                          </p>
                        </div>
                      </div>

                      <span
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          employee.color,
                        ].join(" ")}
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/5 bg-[#111318] p-5 shadow-2xl shadow-black/20">
                <h3 className="text-lg font-bold text-white">Today</h3>

                <div className="mt-4 space-y-3">
                  <TimelineItem
                    time="6:00 PM"
                    title="Review chicken sticks submission"
                    color="bg-amber-400"
                  />
                  <TimelineItem
                    time="8:00 PM"
                    title="Prepare ready-to-upload captions"
                    color="bg-violet-400"
                  />
                  <TimelineItem
                    time="Tomorrow"
                    title="Assign next Maya remake task"
                    color="bg-blue-400"
                  />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  label,
  icon,
  accent,
}: {
  title: string;
  value: string;
  label: string;
  icon: React.ReactNode;
  accent: "blue" | "amber" | "red" | "violet";
}) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-300",
    amber: "bg-amber-500/10 text-amber-300",
    red: "bg-red-500/10 text-red-300",
    violet: "bg-violet-500/10 text-violet-300",
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#111318] p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
        </div>

        <div className={["rounded-2xl p-3", colors[accent]].join(" ")}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function TimelineItem({
  time,
  title,
  color,
}: {
  time: string;
  title: string;
  color: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#171A21] p-3">
      <div className="mt-1 flex flex-col items-center">
        <span className={["h-3 w-3 rounded-full", color].join(" ")} />
        <span className="mt-2 h-full w-px bg-white/10" />
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {time}
        </div>
        <p className="mt-1 text-sm font-medium text-white">{title}</p>
      </div>
    </div>
  );
}

export default App;