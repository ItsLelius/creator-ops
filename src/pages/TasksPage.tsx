import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckSquare,
  CircleDot,
  FolderOpen,
  Search,
} from "lucide-react";
import { FolderCard } from "../components/cards/FolderCard";
import { ProductionCard } from "../components/cards/ProductionCard";
import { PageHeader } from "../components/common/PageHeader";
import { SmoothSelect } from "../components/common/SmoothSelect";
import type { Task, TaskStatus } from "../types";

type TasksPageProps = {
  onOpenSidebar: () => void;
};

const tasks: Task[] = [];

export function TasksPage({ onOpenSidebar }: TasksPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== "posted");
  }, []);

  const folders = useMemo(() => {
    const brands = Array.from(new Set(activeTasks.map((task) => task.brand)));

    return brands
      .map((brand) => ({
        brand,
        count: activeTasks.filter((task) => task.brand === brand).length,
      }))
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [activeTasks]);

  const selectedBrandTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activeTasks.filter((task) => {
      const matchesBrand = selectedBrand ? task.brand === selectedBrand : false;

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.brand.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      return matchesBrand && matchesSearch && matchesStatus;
    });
  }, [activeTasks, selectedBrand, search, statusFilter]);

  function resetFolderView() {
    setSelectedBrand(null);
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Tasks"
        description="Browse active production work by page folder, status, and search."
        onOpenSidebar={onOpenSidebar}
        accent="blue"
        pills={[
          {
            icon: CheckSquare,
            value: activeTasks.length,
            label: "Active",
            accent: "blue",
          },
          {
            icon: FolderOpen,
            value: folders.length,
            label: "Folders",
            accent: "violet",
          },
        ]}
      />

      {!selectedBrand ? (
        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Task Folders
              </p>

              <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                Page folders
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Open a page folder to view its active production tasks.
              </p>
            </div>
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {folders.length === 0 ? (
              <EmptyState
                title="No task folders yet"
                description="Task folders will appear here once production tasks are available."
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
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
            )}
          </div>
        </section>
      ) : (
        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex shrink-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <button
                onClick={resetFolderView}
                className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to folders
              </button>

              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Selected Folder
              </p>

              <h2 className="mt-2 truncate text-2xl font-black tracking-tight text-white">
                {selectedBrand}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {selectedBrandTasks.length} active task
                {selectedBrandTasks.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_240px]">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5 transition focus-within:border-blue-500/60">
              <Search className="h-4 w-4 shrink-0 text-slate-600" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks..."
                className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-300 outline-none placeholder:text-slate-700"
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
            {selectedBrandTasks.length === 0 ? (
              <EmptyState
                title="No tasks found"
                description="Try changing your search or status filter."
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
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
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-600">
          <CircleDot className="h-5 w-5" />
        </div>

        <p className="mt-4 font-black text-white">{title}</p>

        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}