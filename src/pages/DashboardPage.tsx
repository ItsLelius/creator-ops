import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  LoaderCircle,
  Upload,
} from "lucide-react";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { TodayTaskRow } from "../components/dashboard/TodayTaskRow";
import { StatusProgress } from "../components/dashboard/StatusProgress";
import { ActivityRow } from "../components/dashboard/ActivityRow";
import { EmployeeRow } from "../components/dashboard/EmployeeRow";
import { employees, recentActivity, tasks } from "../data/mockData";

type DashboardPageProps = {
  onOpenSidebar: () => void;
};

export function DashboardPage({ onOpenSidebar }: DashboardPageProps) {
  const dashboardStats = useMemo(() => {
    return {
      total: tasks.length,
      toGenerate: tasks.filter((task) => task.status === "to_generate").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      submitted: tasks.filter((task) => task.status === "submitted").length,
      needsRevision: tasks.filter((task) => task.status === "needs_revision")
        .length,
      readyToUpload: tasks.filter((task) => task.status === "ready_to_upload")
        .length,
      dueToday: tasks.filter((task) => task.dueGroup === "Today").length,
      onlineEmployees: employees.filter(
        (employee) => employee.status === "Online",
      ).length,
    };
  }, []);

  const todayTasks = tasks.filter((task) => task.dueGroup === "Today");

  return (
    <>
      <DashboardHeader
        onOpenSidebar={onOpenSidebar}
        dueToday={dashboardStats.dueToday}
        onlineCount={dashboardStats.onlineEmployees}
      />

      <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Tasks"
          value={dashboardStats.total}
          label="All production work"
          icon={<CheckSquare className="h-5 w-5" />}
          accent="slate"
        />

        <StatCard
          title="In Progress"
          value={dashboardStats.inProgress}
          label="Being worked on"
          icon={<LoaderCircle className="h-5 w-5" />}
          accent="blue"
        />

        <StatCard
          title="Submitted"
          value={dashboardStats.submitted}
          label="Waiting for review"
          icon={<Upload className="h-5 w-5" />}
          accent="amber"
        />

        <StatCard
          title="Needs Revision"
          value={dashboardStats.needsRevision}
          label="Needs employee fixes"
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="red"
        />

        <StatCard
          title="Ready to Upload"
          value={dashboardStats.readyToUpload}
          label="Approved content"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="violet"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/5 bg-[#111318] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Today</h3>
              <p className="text-sm text-slate-500">
                Tasks that need attention today.
              </p>
            </div>

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              {todayTasks.length} due today
            </span>
          </div>

          <div className="scroll-panel max-h-[228px] space-y-3 overflow-y-auto pr-1">
            {todayTasks.map((task) => (
              <TodayTaskRow key={task.id} task={task} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#111318] p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Status Overview</h3>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
              {dashboardStats.total} total
            </span>
          </div>

          <div className="space-y-3">
            <StatusProgress
              label="To Generate"
              value={dashboardStats.toGenerate}
              total={tasks.length}
              color="bg-slate-400"
            />

            <StatusProgress
              label="In Progress"
              value={dashboardStats.inProgress}
              total={tasks.length}
              color="bg-blue-500"
            />

            <StatusProgress
              label="Submitted"
              value={dashboardStats.submitted}
              total={tasks.length}
              color="bg-amber-400"
            />

            <StatusProgress
              label="Needs Revision"
              value={dashboardStats.needsRevision}
              total={tasks.length}
              color="bg-red-400"
            />

            <StatusProgress
              label="Ready to Upload"
              value={dashboardStats.readyToUpload}
              total={tasks.length}
              color="bg-violet-500"
            />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/5 bg-[#111318] p-5">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest production movements.
          </p>

          <div className="scroll-panel mt-5 max-h-[228px] space-y-3 overflow-y-auto pr-1">
            {recentActivity.map((activity, index) => (
              <ActivityRow key={activity} activity={activity} index={index} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-[#111318] p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Online Employees</h3>

            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              {dashboardStats.onlineEmployees} online
            </span>
          </div>

          <p className="text-sm text-slate-500">Live team presence.</p>

          <div className="scroll-panel mt-4 max-h-[204px] space-y-3 overflow-y-auto pr-1">
            {employees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}