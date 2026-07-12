import { PageHeader } from "../../../components/common/PageHeader";
import { StatCard } from "../../../components/common/StatCard";

export function EmployeeDashboardPage() {
  return (
    <div>
      <PageHeader
        title="My Dashboard"
        description="Your assigned work, submissions, and revision tasks."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Tasks" value={8} description="Assigned to you" />
        <StatCard title="In Progress" value={3} description="Currently working" />
        <StatCard title="Submitted" value={1} description="Waiting for admin review" />
        <StatCard title="Needs Revision" value={1} description="Needs changes" />
      </div>
    </div>
  );
}