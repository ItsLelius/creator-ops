import { PageHeader } from "../../../components/common/PageHeader";
import { StatCard } from "../../../components/common/StatCard";

export function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Overview of tasks, submissions, employees, and production status."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Tasks" value={24} description="All production tasks" />
        <StatCard title="In Progress" value={6} description="Currently being worked on" />
        <StatCard title="Submitted" value={4} description="Waiting for review" />
        <StatCard title="Needs Revision" value={2} description="Requires employee fixes" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-semibold text-white">Online Employees</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3">
            <span>Maria</span>
            <span className="text-sm text-green-400">Online</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3">
            <span>John</span>
            <span className="text-sm text-slate-500">Last seen 12 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}