import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  LoaderCircle,
  Upload,
} from "lucide-react";
import type { TaskStatus } from "../types";

export function getStatusIcon(status: TaskStatus): LucideIcon {
  switch (status) {
    case "in_progress":
      return LoaderCircle;
    case "submitted":
      return Upload;
    case "needs_revision":
      return AlertTriangle;
    case "ready_to_upload":
      return CheckCircle2;
    default:
      return CircleDot;
  }
}

export function darkStatusIconStyle(status: TaskStatus) {
  switch (status) {
    case "in_progress":
      return "bg-blue-500/10 text-blue-300";
    case "submitted":
      return "bg-amber-500/10 text-amber-300";
    case "needs_revision":
      return "bg-red-500/10 text-red-300";
    case "ready_to_upload":
      return "bg-violet-500/10 text-violet-300";
    default:
      return "bg-slate-500/10 text-slate-300";
  }
}

export function darkStatusBadge(status: TaskStatus) {
  switch (status) {
    case "in_progress":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "submitted":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "needs_revision":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "ready_to_upload":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

export function statusLabel(status: TaskStatus) {
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
      return "Ready to Upload";
    case "posted":
      return "Posted";
    default:
      return status;
  }
}