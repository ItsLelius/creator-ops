import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  RefreshCw,
  Send,
  Upload,
  UserRound,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import {
  getAssignablePeople,
  getTodoItems,
  type TeamMemberOption,
} from "../services/todoService";
import type { TodoDbItem, TodoDbStatus } from "../types";

type DashboardPageProps = {
  onOpenSidebar: () => void;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
};

export function DashboardPage({ onOpenSidebar }: DashboardPageProps) {
  const [items, setItems] = useState<TodoDbItem[]>([]);
  const [team, setTeam] = useState<TeamMemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setNotice(null);

      const [todoItems, teamMembers] = await Promise.all([
        getTodoItems(),
        getAssignablePeople(),
      ]);

      setItems(todoItems);
      setTeam(teamMembers);
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to load dashboard.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    const activeItems = items.filter(isActiveWork);
    const dueToday = items.filter(isDueToday);

    return {
      total: items.length,
      active: activeItems.length,
      assigned: items.filter((item) => item.status === "assigned").length,
      inProgress: items.filter((item) => item.status === "in_progress").length,
      underReview: items.filter((item) => item.status === "submitted").length,
      needsRevision: items.filter((item) => item.status === "needs_revision")
        .length,
      readyToUpload: items.filter((item) => item.status === "done").length,
      dueToday: dueToday.length,
      teamMembers: team.length,
    };
  }, [items, team]);

  const todayItems = useMemo(() => {
    return items
      .filter((item) => isDueToday(item) && item.status !== "done")
      .slice(0, 8);
  }, [items]);

  const reviewItems = useMemo(() => {
    return items.filter((item) => item.status === "submitted").slice(0, 8);
  }, [items]);

  const readyItems = useMemo(() => {
    return items.filter((item) => item.status === "done").slice(0, 8);
  }, [items]);

  const recentItems = useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 8);
  }, [items]);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Dashboard"
        description="Live studio overview from your real To Do, Production Board, and Ready to Upload workflow."
        onOpenSidebar={onOpenSidebar}
        accent="blue"
        pills={[
          {
            icon: ClipboardList,
            value: dashboardStats.total,
            label: "Total work",
            accent: "blue",
          },
          {
            icon: Send,
            value: dashboardStats.underReview,
            label: "Under Review",
            accent: "violet",
          },
          {
            icon: Upload,
            value: dashboardStats.readyToUpload,
            label: "Ready",
            accent: "emerald",
          },
          {
            icon: UserRound,
            value: dashboardStats.teamMembers,
            label: "Team",
            accent: "amber",
          },
        ]}
      />

      {notice && (
        <div className="mb-4">
          <NoticeCard tone={notice.type} title="Dashboard">
            {notice.message}
          </NoticeCard>
        </div>
      )}

      <section className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Active Work"
          value={dashboardStats.active}
          label="Still in To Do"
          icon={<ClipboardList className="h-5 w-5" />}
          accent="blue"
        />

        <StatCard
          title="Assigned"
          value={dashboardStats.assigned}
          label="Waiting to start"
          icon={<CalendarDays className="h-5 w-5" />}
          accent="slate"
        />

        <StatCard
          title="In Progress"
          value={dashboardStats.inProgress}
          label="Being worked on"
          icon={<LoaderCircle className="h-5 w-5" />}
          accent="amber"
        />

        <StatCard
          title="Under Review"
          value={dashboardStats.underReview}
          label="Submitted links"
          icon={<Send className="h-5 w-5" />}
          accent="violet"
        />

        <StatCard
          title="Needs Revision"
          value={dashboardStats.needsRevision}
          label="Needs fixes"
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="red"
        />

        <StatCard
          title="Ready"
          value={dashboardStats.readyToUpload}
          label="Ready to upload"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
        />
      </section>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Today"
          description="Active work due today."
          action={
            <button
              onClick={() => void loadDashboard()}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              title="Refresh dashboard"
            >
              <RefreshCw
                className={["h-4 w-4", loading ? "animate-spin" : ""].join(
                  " ",
                )}
              />
            </button>
          }
        >
          {loading ? (
            <LoadingRows />
          ) : todayItems.length === 0 ? (
            <EmptyState message="No active work due today." />
          ) : (
            <div className="space-y-3">
              {todayItems.map((item) => (
                <TaskRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Status Overview"
          description="Current work distribution."
          badge={`${dashboardStats.total} total`}
        >
          <div className="space-y-3">
            <StatusProgress
              label="Assigned"
              value={dashboardStats.assigned}
              total={dashboardStats.total}
              barClassName="bg-blue-500"
            />

            <StatusProgress
              label="In Progress"
              value={dashboardStats.inProgress}
              total={dashboardStats.total}
              barClassName="bg-amber-400"
            />

            <StatusProgress
              label="Under Review"
              value={dashboardStats.underReview}
              total={dashboardStats.total}
              barClassName="bg-violet-500"
            />

            <StatusProgress
              label="Needs Revision"
              value={dashboardStats.needsRevision}
              total={dashboardStats.total}
              barClassName="bg-red-400"
            />

            <StatusProgress
              label="Ready"
              value={dashboardStats.readyToUpload}
              total={dashboardStats.total}
              barClassName="bg-emerald-500"
            />
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel
          title="Under Review"
          description="Employee submissions waiting for approval."
          badge={`${reviewItems.length} shown`}
        >
          {loading ? (
            <LoadingRows />
          ) : reviewItems.length === 0 ? (
            <EmptyState message="No submitted work waiting for review." />
          ) : (
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <TaskRow key={item.id} item={item} compact />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Ready to Upload"
          description="Approved work already moved to upload queue."
          badge={`${readyItems.length} shown`}
        >
          {loading ? (
            <LoadingRows />
          ) : readyItems.length === 0 ? (
            <EmptyState message="No ready uploads yet." />
          ) : (
            <div className="space-y-3">
              {readyItems.map((item) => (
                <TaskRow key={item.id} item={item} compact />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Recent Movement"
          description="Latest updated work items."
          badge={`${recentItems.length} shown`}
        >
          {loading ? (
            <LoadingRows />
          ) : recentItems.length === 0 ? (
            <EmptyState message="No work activity yet." />
          ) : (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <TaskRow key={item.id} item={item} compact showUpdated />
              ))}
            </div>
          )}
        </Panel>
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
  value: number;
  label: string;
  icon: React.ReactNode;
  accent: "blue" | "violet" | "amber" | "red" | "emerald" | "slate";
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#111318] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-black text-white">{value}</p>

          <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
        </div>

        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            accentBox(accent),
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

function Panel({
  title,
  description,
  badge,
  action,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#111318] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        {action ? (
          action
        ) : badge ? (
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-slate-300">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="scroll-panel max-h-[260px] overflow-y-auto pr-1">
        {children}
      </div>
    </section>
  );
}

function TaskRow({
  item,
  compact = false,
  showUpdated = false,
}: {
  item: TodoDbItem;
  compact?: boolean;
  showUpdated?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0B0D10] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />

            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
              {pageName(item)}
            </span>
          </div>

          <p className="line-clamp-2 text-sm font-black leading-snug text-white">
            {item.title}
          </p>

          {!compact && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              {item.assign_to_all ? "Everyone" : assigneeName(item)}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-bold text-slate-500">
            {showUpdated
              ? `Updated ${formatDate(item.updated_at)}`
              : item.due_date
                ? `Due ${formatDate(item.due_date)}`
                : "No due date"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusProgress({
  label,
  value,
  total,
  barClassName,
}: {
  label: string;
  value: number;
  total: number;
  barClassName: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-300">{label}</span>
        <span className="text-xs font-black text-slate-500">
          {value} / {total}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={["h-full rounded-full", barClassName].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TodoDbStatus }) {
  return (
    <span
      className={[
        "rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
        statusStyle(status),
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
  );
}

function NoticeCard({
  tone,
  title,
  children,
}: {
  tone: "success" | "error";
  title: string;
  children: string;
}) {
  const style =
    tone === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  return (
    <div className={["rounded-xl border p-4", style].join(" ")}>
      <p className="text-sm font-black capitalize">{title}</p>
      <p className="mt-1 text-sm font-semibold opacity-90">{children}</p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[84px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-6 text-center">
      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}

function isActiveWork(item: TodoDbItem) {
  return ["assigned", "in_progress", "needs_revision"].includes(item.status);
}

function isDueToday(item: TodoDbItem) {
  return item.due_date === todayDateString();
}

function todayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function pageName(item: TodoDbItem) {
  return item.content_page?.name ?? item.brand;
}

function assigneeName(item: TodoDbItem) {
  if (item.assign_to_all) {
    return "Everyone";
  }

  return item.assignee?.name ?? "Unassigned";
}

function statusLabel(status: TodoDbStatus) {
  switch (status) {
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In Progress";
    case "submitted":
      return "Under Review";
    case "needs_revision":
      return "Needs Revision";
    case "approved":
      return "Approved";
    case "done":
      return "Ready";
    default:
      return status;
  }
}

function statusStyle(status: TodoDbStatus) {
  switch (status) {
    case "assigned":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "in_progress":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "submitted":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "needs_revision":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "done":
      return "border-green-500/20 bg-green-500/10 text-green-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function accentBox(accent: "blue" | "violet" | "amber" | "red" | "emerald" | "slate") {
  switch (accent) {
    case "blue":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "violet":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "amber":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "red":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "emerald":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    default:
      return "border-white/10 bg-white/[0.04] text-slate-300";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}