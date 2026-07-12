import type { Task } from "../../types";
import {
  darkStatusBadge,
  darkStatusIconStyle,
  getStatusIcon,
  statusLabel,
} from "../../utils/status";

export function TodayTaskRow({ task }: { task: Task }) {
  const StatusIcon = getStatusIcon(task.status);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#171A21] p-3">
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          darkStatusIconStyle(task.status),
        ].join(" ")}
      >
        <StatusIcon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{task.title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {task.brand} • {task.assignee}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-slate-300">{task.due}</p>

        <span
          className={[
            "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            darkStatusBadge(task.status),
          ].join(" ")}
        >
          {statusLabel(task.status)}
        </span>
      </div>
    </div>
  );
}