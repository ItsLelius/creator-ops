import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CircleDot,
  LoaderCircle,
  Upload,
  User,
  Video,
} from "lucide-react";
import type { TaskStatus } from "../../types";

type ProductionCardProps = {
  title: string;
  subtitle?: string;
  status: TaskStatus;
  statusText?: string;
  assignee?: string;
  due?: string;
  platform?: string;
  detail?: string;
  selected?: boolean;
  onClick?: () => void;
};

export function ProductionCard({
  title,
  subtitle,
  status,
  statusText,
  assignee,
  due,
  platform,
  detail,
  selected = false,
  onClick,
}: ProductionCardProps) {
  const StatusIcon = getStatusIcon(status);

  return (
    <button
      onClick={onClick}
      className={[
        "group relative flex min-h-[180px] min-w-0 flex-col overflow-hidden rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-blue-500 bg-blue-500/[0.06] ring-1 ring-blue-500/50"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171d]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute inset-x-0 top-0 h-0.5",
          statusAccent(status),
        ].join(" ")}
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusBadge(status),
          ].join(" ")}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {statusText ?? statusLabel(status)}
        </span>
      </div>

      {subtitle && (
        <p className="mb-2 truncate text-xs font-semibold text-slate-500">
          {subtitle}
        </p>
      )}

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
        {title}
      </h3>

      {detail && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {detail}
        </p>
      )}

      <div className="mt-auto space-y-2 border-t border-white/5 pt-3 text-xs text-slate-400">
        {assignee && (
          <div className="flex min-w-0 items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{assignee}</span>
          </div>
        )}

        {due && (
          <div className="flex min-w-0 items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{due}</span>
          </div>
        )}

        {platform && (
          <div className="flex min-w-0 items-center gap-1.5">
            <Video className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="truncate">{platform}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function getStatusIcon(status: TaskStatus) {
  switch (status) {
    case "in_progress":
      return LoaderCircle;
    case "submitted":
      return Upload;
    case "needs_revision":
      return AlertTriangle;
    case "approved":
    case "ready_to_upload":
    case "posted":
      return CheckCircle2;
    default:
      return CircleDot;
  }
}

function statusAccent(status: TaskStatus) {
  switch (status) {
    case "in_progress":
      return "bg-blue-500/70";
    case "submitted":
      return "bg-amber-400/70";
    case "needs_revision":
      return "bg-red-400/70";
    case "approved":
      return "bg-emerald-500/70";
    case "ready_to_upload":
      return "bg-violet-500/70";
    case "posted":
      return "bg-green-500/70";
    default:
      return "bg-slate-400/70";
  }
}

function statusBadge(status: TaskStatus) {
  switch (status) {
    case "in_progress":
      return "bg-blue-500/10 text-blue-300";
    case "submitted":
      return "bg-amber-500/10 text-amber-300";
    case "needs_revision":
      return "bg-red-500/10 text-red-300";
    case "approved":
      return "bg-emerald-500/10 text-emerald-300";
    case "ready_to_upload":
      return "bg-violet-500/10 text-violet-300";
    case "posted":
      return "bg-green-500/10 text-green-300";
    default:
      return "bg-slate-500/10 text-slate-300";
  }
}

function statusLabel(status: TaskStatus) {
  switch (status) {
    case "to_generate":
      return "To Generate";
    case "in_progress":
      return "In Progress";
    case "submitted":
      return "Submitted";
    case "needs_revision":
      return "Needs Revision";
    case "approved":
      return "Approved";
    case "ready_to_upload":
      return "Ready";
    case "posted":
      return "Posted";
    default:
      return status;
  }
}