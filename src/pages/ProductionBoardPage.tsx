import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Search,
  Send,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import {
  getTodoItems,
  updateTodoDriveUrl,
  updateTodoStatus,
} from "../services/todoService";
import type { CurrentUser, TodoDbItem, TodoDbStatus } from "../types";

type ProductionBoardPageProps = {
  onOpenSidebar: () => void;
  currentUser: CurrentUser;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
};

type ConfirmState = {
  title: string;
  description: string;
  actionLabel: string;
  tone: "blue" | "emerald" | "amber" | "red";
  onConfirm: () => Promise<void>;
};

const boardStatuses: TodoDbStatus[] = [
  "assigned",
  "in_progress",
  "submitted",
  "needs_revision",
  "done",
];

const activeControlStatuses: TodoDbStatus[] = [
  "assigned",
  "in_progress",
  "needs_revision",
];

export function ProductionBoardPage({
  onOpenSidebar,
  currentUser,
}: ProductionBoardPageProps) {
  const isAdmin = currentUser.role === "admin";

  const [items, setItems] = useState<TodoDbItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [submissionItem, setSubmissionItem] = useState<TodoDbItem | null>(null);

  async function loadBoard() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getTodoItems();

      setItems(data);

      setSelectedItemId((currentSelectedId) => {
        if (
          currentSelectedId &&
          data.some((item) => item.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return data[0]?.id ?? "";
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to load production board.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBoard();
  }, [currentUser.id, currentUser.role]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        pageName(item).toLowerCase().includes(query) ||
        assigneeName(item).toLowerCase().includes(query) ||
        statusLabel(item.status).toLowerCase().includes(query)
      );
    });
  }, [items, search]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ??
    filteredItems[0] ??
    null;

  const underReviewCount = items.filter((item) => item.status === "submitted")
    .length;

  const needsRevisionCount = items.filter(
    (item) => item.status === "needs_revision",
  ).length;

  const doneCount = items.filter((item) => item.status === "done").length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  function requestStatusChange(item: TodoDbItem, nextStatus: TodoDbStatus) {
    const approving = nextStatus === "done";

    setConfirm({
      title: approving
        ? "Approve and mark as done?"
        : `Move to ${statusLabel(nextStatus)}?`,
      description: approving
        ? `"${item.title}" will be approved and moved to Ready to Upload.`
        : `"${item.title}" will move from ${statusLabel(
            item.status,
          )} to ${statusLabel(nextStatus)}.`,
      actionLabel: approving
        ? "Approve & Mark Done"
        : `Move to ${statusLabel(nextStatus)}`,
      tone: statusTone(nextStatus),
      onConfirm: () => executeStatusChange(item, nextStatus),
    });
  }

  async function executeStatusChange(
    item: TodoDbItem,
    nextStatus: TodoDbStatus,
  ) {
    try {
      setBusyItemId(item.id);

      await updateTodoStatus(item.id, nextStatus);

      showNotice(
        nextStatus === "done"
          ? "Work approved and moved to Ready to Upload."
          : `Moved to ${statusLabel(nextStatus)}.`,
      );

      setConfirm(null);

      await loadBoard();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to update status.",
        "error",
      );
    } finally {
      setBusyItemId("");
    }
  }

  async function handleSubmitDriveUrl(item: TodoDbItem, driveUrl: string) {
    try {
      setBusyItemId(item.id);

      await updateTodoDriveUrl(item.id, driveUrl);

      showNotice("Drive link submitted for review.");
      setSubmissionItem(null);

      await loadBoard();
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Failed to submit Drive link.",
        "error",
      );
    } finally {
      setBusyItemId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={isAdmin ? "Production Board" : "My Submissions"}
        description={
          isAdmin
            ? "Review employee submissions, request revisions, and approve finished work."
            : "Submit your finished Drive links and track review status."
        }
        onOpenSidebar={onOpenSidebar}
        accent="violet"
        pills={[
          {
            icon: ClipboardList,
            value: items.length,
            label: "Total work",
            accent: "violet",
          },
          {
            icon: Send,
            value: underReviewCount,
            label: "Under Review",
            accent: "blue",
          },
          {
            icon: AlertTriangle,
            value: needsRevisionCount,
            label: "Revision",
            accent: "amber",
          },
          {
            icon: CheckCircle2,
            value: doneCount,
            label: "Ready",
            accent: "emerald",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load board">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="flex min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">
                Status Board
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Work moves from assigned to review, revision, or ready.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5 md:w-[280px]">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search production..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              onClick={() => void loadBoard()}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              title="Refresh board"
            >
              <RefreshCw
                className={["h-4 w-4", loading ? "animate-spin" : ""].join(
                  " ",
                )}
              />
            </button>
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-auto">
            {loading ? (
              <LoadingBoard />
            ) : filteredItems.length === 0 ? (
              <EmptyBoard isAdmin={isAdmin} />
            ) : (
              <div className="grid min-w-[900px] grid-cols-5 gap-3">
                {boardStatuses.map((status) => {
                  const columnItems = filteredItems.filter(
                    (item) => item.status === status,
                  );

                  return (
                    <BoardColumn
                      key={status}
                      status={status}
                      items={columnItems}
                      selectedItemId={selectedItem?.id ?? ""}
                      onSelect={setSelectedItemId}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
          {selectedItem ? (
            <ProductionDetail
              item={selectedItem}
              isAdmin={isAdmin}
              busyItemId={busyItemId}
              onStatusChange={requestStatusChange}
              onSubmit={() => setSubmissionItem(selectedItem)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <ClipboardList className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 font-semibold text-white">
                  Select a work item
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Production details will appear here.
                </p>
              </div>
            </div>
          )}
        </aside>
      </section>

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          busy={Boolean(busyItemId)}
          onClose={() => setConfirm(null)}
        />
      )}

      {submissionItem && (
        <SubmissionModal
          item={submissionItem}
          busy={busyItemId === submissionItem.id}
          onClose={() => setSubmissionItem(null)}
          onSubmit={handleSubmitDriveUrl}
        />
      )}
    </div>
  );
}

function BoardColumn({
  status,
  items,
  selectedItemId,
  onSelect,
}: {
  status: TodoDbStatus;
  items: TodoDbItem[];
  selectedItemId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="min-h-[520px] rounded-xl border border-white/10 bg-[#0B0D10] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <StatusBadge status={status} />

        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-black text-slate-400">
          {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs font-semibold text-slate-600">
            Empty
          </div>
        ) : (
          items.map((item) => (
            <BoardCard
              key={item.id}
              item={item}
              selected={selectedItemId === item.id}
              onClick={() => onSelect(item.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function BoardCard({
  item,
  selected,
  onClick,
}: {
  item: TodoDbItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-lg border p-3 text-left transition",
        selected
          ? "border-violet-500/45 bg-violet-500/[0.08] ring-1 ring-violet-500/30"
          : "border-white/10 bg-[#111318] hover:border-white/20 hover:bg-[#171A21]",
      ].join(" ")}
    >
      <p className="line-clamp-2 text-sm font-black leading-snug text-white">
        {item.title}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-slate-300">
          {pageName(item)}
        </span>

        {item.drive_url && (
          <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] font-bold text-blue-300">
            Link
          </span>
        )}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {item.assign_to_all ? (
          <Users className="h-3.5 w-3.5" />
        ) : (
          <UserRound className="h-3.5 w-3.5" />
        )}
        {assigneeName(item)}
      </p>
    </button>
  );
}

function ProductionDetail({
  item,
  isAdmin,
  busyItemId,
  onStatusChange,
  onSubmit,
}: {
  item: TodoDbItem;
  isAdmin: boolean;
  busyItemId: string;
  onStatusChange: (item: TodoDbItem, status: TodoDbStatus) => void;
  onSubmit: () => void;
}) {
  const busy = busyItemId === item.id;
  const employeeCanSubmit = !isAdmin && canEmployeeSubmit(item);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />

          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
            {pageName(item)}
          </span>
        </div>

        <h2 className="mt-3 break-words text-2xl font-black leading-tight text-white">
          {item.title}
        </h2>

        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
          {item.assign_to_all ? (
            <Users className="h-4 w-4 text-slate-500" />
          ) : (
            <UserRound className="h-4 w-4 text-slate-500" />
          )}
          Assigned to {assigneeName(item)}
        </p>

        {item.due_date && (
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <CalendarDays className="h-4 w-4" />
            Due {formatDate(item.due_date)}
          </p>
        )}
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {item.drive_url && (
            <DriveLinkBlock driveUrl={item.drive_url} highlight={item.status === "submitted"} />
          )}

          {isAdmin && (
            <section className="rounded-xl border border-white/10 bg-[#0B0D10] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                Admin Review Control
              </p>

              {item.status === "submitted" && (
                <div className="mt-3 grid gap-2">
                  <button
                    disabled={busy || !item.drive_url}
                    onClick={() => onStatusChange(item, "done")}
                    className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-left text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Approve & Mark Done
                  </button>

                  <button
                    disabled={busy}
                    onClick={() => onStatusChange(item, "needs_revision")}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-left text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Request Revision
                  </button>
                </div>
              )}

              {item.status !== "submitted" && item.status !== "done" && (
                <div className="mt-3 grid gap-2">
                  {activeControlStatuses.map((status) => (
                    <button
                      key={status}
                      disabled={busy || item.status === status}
                      onClick={() => onStatusChange(item, status)}
                      className={[
                        "rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45",
                        item.status === status
                          ? "border-white/10 bg-white/[0.06] text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white",
                      ].join(" ")}
                    >
                      {statusLabel(status)}
                    </button>
                  ))}
                </div>
              )}

              {item.status === "done" && (
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-200">
                  Approved. This item is now available in Ready to Upload.
                </div>
              )}
            </section>
          )}

          {employeeCanSubmit && (
            <button
              onClick={onSubmit}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit Drive Link
            </button>
          )}

          {!isAdmin && item.assign_to_all && (
            <StatusMessage tone="amber">
              Shared tasks cannot receive individual submissions. Ask admin to
              assign this work directly to one member.
            </StatusMessage>
          )}

          {!isAdmin && item.status === "submitted" && (
            <StatusMessage tone="blue">
              Your work is under review. Wait for admin approval or revision
              request.
            </StatusMessage>
          )}

          {!isAdmin && item.status === "done" && (
            <StatusMessage tone="emerald">
              Approved and moved to Ready to Upload.
            </StatusMessage>
          )}

          <CopyBlock label="Caption" value={item.caption} tone="blue" />
          <CopyBlock label="Prompt A" value={item.prompt_a} tone="violet" />
          <CopyBlock label="Prompt B" value={item.prompt_b} tone="emerald" />

          {item.notes && (
            <section className="rounded-xl border border-amber-500/15 bg-amber-500/[0.055] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-amber-300">
                Notes
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                {item.notes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmissionModal({
  item,
  busy,
  onClose,
  onSubmit,
}: {
  item: TodoDbItem;
  busy: boolean;
  onClose: () => void;
  onSubmit: (item: TodoDbItem, driveUrl: string) => Promise<void>;
}) {
  const [driveUrl, setDriveUrl] = useState(item.drive_url ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setError("");

      if (!driveUrl.trim()) {
        throw new Error("Paste the Google Drive link first.");
      }

      await onSubmit(item, driveUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit.");
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111318] p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
              Submit Work
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white">
              Drive Link
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Paste the finished video Google Drive link for “{item.title}”.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <input
            value={driveUrl}
            onChange={(event) => setDriveUrl(event.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
          />

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {busy ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DriveLinkBlock({
  driveUrl,
  highlight,
}: {
  driveUrl: string;
  highlight: boolean;
}) {
  return (
    <section
      className={[
        "rounded-xl border p-4",
        highlight
          ? "border-blue-500/25 bg-blue-500/[0.08]"
          : "border-white/10 bg-[#0B0D10]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-blue-300">
          Submitted Drive Link
        </p>

        <a
          href={driveUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-black text-white transition hover:bg-blue-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
      </div>

      <p className="mt-3 break-words text-sm leading-7 text-slate-200">
        {driveUrl}
      </p>
    </section>
  );
}

function ConfirmModal({
  confirm,
  busy,
  onClose,
}: {
  confirm: ConfirmState;
  busy: boolean;
  onClose: () => void;
}) {
  const toneStyle = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20",
    emerald:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    amber:
      "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    red: "border-red-500/25 bg-red-500/15 text-red-200 hover:bg-red-500/25",
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111318] p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Confirm Action
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white">
              {confirm.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          {confirm.description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={() => void confirm.onConfirm()}
            disabled={busy}
            className={[
              "flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
              toneStyle[confirm.tone],
            ].join(" ")}
          >
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {busy ? "Working..." : confirm.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "violet" | "emerald";
}) {
  const canCopy = Boolean(value.trim());

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
      <div
        className={[
          "flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3",
          toneHeader(tone),
        ].join(" ")}
      >
        <p className="text-xs font-black uppercase tracking-wide text-white">
          {label}
        </p>

        <button
          onClick={() => void navigator.clipboard.writeText(value)}
          disabled={!canCopy}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <div className="p-4">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
          {value || "Nothing added yet."}
        </p>
      </div>
    </section>
  );
}

function StatusMessage({
  tone,
  children,
}: {
  tone: "blue" | "emerald" | "amber";
  children: string;
}) {
  const styles = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-200",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  };

  return (
    <div
      className={[
        "rounded-xl border p-4 text-sm font-semibold leading-6",
        styles[tone],
      ].join(" ")}
    >
      {children}
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

function LoadingBoard() {
  return (
    <div className="grid min-w-[900px] grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, columnIndex) => (
        <div
          key={columnIndex}
          className="min-h-[520px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function EmptyBoard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <ClipboardList className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">No production work found</p>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? "Create work in To Do List first."
            : "No assigned production work yet."}
        </p>
      </div>
    </div>
  );
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

function canEmployeeSubmit(item: TodoDbItem) {
  if (item.assign_to_all) {
    return false;
  }

  return ["assigned", "in_progress", "needs_revision"].includes(item.status);
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

function statusTone(status: TodoDbStatus): ConfirmState["tone"] {
  switch (status) {
    case "done":
    case "approved":
      return "emerald";
    case "needs_revision":
      return "red";
    case "submitted":
    case "in_progress":
      return "blue";
    default:
      return "amber";
  }
}

function toneHeader(tone: "blue" | "violet" | "emerald") {
  switch (tone) {
    case "blue":
      return "bg-blue-500/10";
    case "violet":
      return "bg-violet-500/10";
    case "emerald":
      return "bg-emerald-500/10";
    default:
      return "bg-white/5";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}