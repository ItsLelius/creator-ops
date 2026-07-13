import { useMemo, useState } from "react";
import { ArrowLeft, CheckSquare, FolderOpen, Plus, Search } from "lucide-react";
import { FolderCard } from "../components/cards/FolderCard";
import { ProductionCard } from "../components/cards/ProductionCard";
import { PageHeader } from "../components/common/PageHeader";
import { SmoothSelect } from "../components/common/SmoothSelect";
import { tasks } from "../data/mockData";
import type { TaskStatus } from "../types";

type TasksPageProps = {
  onOpenSidebar: () => void;
};

export function TasksPage({ onOpenSidebar }: TasksPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const activeTasks = tasks.filter((task) => task.status !== "posted");

  const folders = useMemo(() => {
    const brands = Array.from(new Set(activeTasks.map((task) => task.brand)));

    return brands.map((brand) => ({
      brand,
      count: activeTasks.filter((task) => task.brand === brand).length,
    }));
  }, [activeTasks]);

  const selectedBrandTasks = activeTasks.filter((task) => {
    const matchesBrand = selectedBrand ? task.brand === selectedBrand : false;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesBrand && matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Tasks"
        description="Create, assign, review, and track active production work."
        onOpenSidebar={onOpenSidebar}
        pills={[
          {
            icon: CheckSquare,
            value: activeTasks.length,
            label: "Active tasks",
            accent: "blue",
          },
          {
            icon: FolderOpen,
            value: folders.length,
            label: "Page folders",
            accent: "violet",
          },
        ]}
      />

      {!selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Task Folders</h2>
              <p className="mt-1 text-sm text-slate-400">
                Open a page to view its production tasks.
              </p>
            </div>

            <button className="hidden items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 sm:flex">
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.brand}
                  title={folder.brand}
                  count={folder.count}
                  label="active tasks"
                  onClick={() => {
                    setSelectedBrand(folder.brand);
                    setSearch("");
                    setStatusFilter("all");
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-4 flex shrink-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to task folders
              </button>

              <h2 className="truncate text-xl font-bold text-white">
                {selectedBrand} Tasks
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {selectedBrandTasks.length} active task
                {selectedBrandTasks.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <button className="flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400">
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                className="w-full bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
              />
            </div>

            <SmoothSelect
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as "all" | TaskStatus)}
              options={[
                { label: "All Active", value: "all" },
                { label: "To Generate", value: "to_generate" },
                { label: "In Progress", value: "in_progress" },
                { label: "Submitted", value: "submitted" },
                { label: "Needs Revision", value: "needs_revision" },
                { label: "Approved", value: "approved" },
                { label: "Ready to Upload", value: "ready_to_upload" },
              ]}
            />
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {selectedBrandTasks.map((task) => (
                <ProductionCard
                  key={task.id}
                  title={task.title}
                  subtitle={task.brand}
                  status={task.status}
                  assignee={task.assignee}
                  due={task.due}
                  detail={task.detail}
                />
              ))}
            </div>

            {selectedBrandTasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-10 text-center">
                <p className="font-semibold text-white">No tasks found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}