import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { deleteTodoItem, getTodoItems } from "../services/todoService";
import type { TodoDbItem } from "../types";

type PublishedContentPageProps = {
  onOpenSidebar: () => void;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
};

type ConfirmState = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => Promise<void>;
};

export function PublishedContentPage({
  onOpenSidebar,
}: PublishedContentPageProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [items, setItems] = useState<TodoDbItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  async function loadUploadedItems() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getTodoItems();
      const uploadedItems = data.filter((item) => item.status === "posted");

      setItems(uploadedItems);

      setSelectedItemId((currentSelectedId) => {
        if (
          currentSelectedId &&
          uploadedItems.some((item) => item.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return uploadedItems[0]?.id ?? "";
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to load uploaded content.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUploadedItems();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        pageName(item).toLowerCase().includes(query) ||
        assigneeName(item).toLowerCase().includes(query)
      );
    });
  }, [items, search]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ??
    filteredItems[0] ??
    null;

  const withLinksCount = items.filter((item) => Boolean(item.drive_url)).length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);

    showNotice(`${label} copied.`);
  }

  function requestDeleteUploaded(item: TodoDbItem) {
    setConfirm({
      title: "Delete uploaded content?",
      description: `"${item.title}" will be permanently deleted from Uploaded Content. This action cannot be undone.`,
      actionLabel: "Delete Content",
      onConfirm: () => executeDeleteUploaded(item),
    });
  }

  async function executeDeleteUploaded(item: TodoDbItem) {
    try {
      setBusyItemId(item.id);

      await deleteTodoItem(item.id);

      const remainingItems = items.filter(
        (currentItem) => currentItem.id !== item.id,
      );

      setItems(remainingItems);
      setSelectedItemId(remainingItems[0]?.id ?? "");
      setConfirm(null);

      showNotice("Uploaded content deleted.");
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Failed to delete uploaded content.",
        "error",
      );
    } finally {
      setBusyItemId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Uploaded Content"
        description="Final archive of uploaded work moved from Ready to Upload."
        onOpenSidebar={onOpenSidebar}
        accent="violet"
        pills={[
          {
            icon: Video,
            value: items.length,
            label: "Uploaded",
            accent: "violet",
          },
          {
            icon: CheckCircle2,
            value: items.length,
            label: "Completed",
            accent: "emerald",
          },
          {
            icon: Upload,
            value: withLinksCount,
            label: "With Drive",
            accent: "blue",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load Uploaded Content">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">
                Uploaded Archive
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Work already uploaded.
              </p>
            </div>

            <button
              onClick={() => void loadUploadedItems()}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw
                className={["h-4 w-4", loading ? "animate-spin" : ""].join(
                  " ",
                )}
              />
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search uploaded content..."
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <LoadingUploadedItems />
            ) : filteredItems.length === 0 ? (
              <EmptyUploadedItems />
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <UploadedCard
                    key={item.id}
                    item={item}
                    selected={selectedItem?.id === item.id}
                    onClick={() => setSelectedItemId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
          {selectedItem ? (
            <UploadedDetail
              item={selectedItem}
              isAdmin={isAdmin}
              busy={busyItemId === selectedItem.id}
              onCopy={copyText}
              onDelete={requestDeleteUploaded}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div>
                <Video className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 font-semibold text-white">
                  Select uploaded content
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Final details will appear here.
                </p>
              </div>
            </div>
          )}
        </main>
      </section>

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          busy={Boolean(busyItemId)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function UploadedCard({
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
        "group relative w-full overflow-hidden rounded-xl border p-4 text-left transition",
        selected
          ? "border-violet-500/45 bg-violet-500/[0.065] ring-1 ring-violet-500/30"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
      ].join(" ")}
    >
      <span className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-violet-400 via-blue-500 to-cyan-600" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-violet-300">
          Uploaded
        </span>

        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
          {pageName(item)}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug text-white">
        {item.title}
      </h3>

      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
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

function UploadedDetail({
  item,
  isAdmin,
  busy,
  onCopy,
  onDelete,
}: {
  item: TodoDbItem;
  isAdmin: boolean;
  busy: boolean;
  onCopy: (value: string, label: string) => Promise<void>;
  onDelete: (item: TodoDbItem) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-[#111318] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-violet-300">
                Uploaded
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                {pageName(item)}
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                Uploaded {formatDate(item.updated_at)}
              </span>

              {item.due_date && (
                <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Due {formatDate(item.due_date)}
                </span>
              )}
            </div>

            <h2 className="mt-3 break-words text-3xl font-black leading-tight text-white">
              {item.title}
            </h2>

            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
              {item.assign_to_all ? (
                <Users className="h-4 w-4 text-slate-500" />
              ) : (
                <UserRound className="h-4 w-4 text-slate-500" />
              )}
              Uploaded from work assigned to {assigneeName(item)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {item.drive_url && (
              <a
                href={item.drive_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-400"
              >
                <ExternalLink className="h-4 w-4" />
                Open Drive
              </a>
            )}

            {isAdmin && (
              <button
                onClick={() => onDelete(item)}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-5xl space-y-5">
          {item.drive_url && (
            <section className="rounded-xl border border-blue-500/20 bg-blue-500/[0.08] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wide text-blue-300">
                  Drive Link
                </p>

                <button
                  onClick={() => void onCopy(item.drive_url, "Drive link")}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>

              <p className="mt-3 break-words text-sm leading-7 text-slate-200">
                {item.drive_url}
              </p>
            </section>
          )}

          <CopyBlock
            label="Caption"
            value={item.caption}
            tone="blue"
            onCopy={onCopy}
          />

          <CopyBlock
            label="Prompt A"
            value={item.prompt_a}
            tone="violet"
            onCopy={onCopy}
          />

          <CopyBlock
            label="Prompt B"
            value={item.prompt_b}
            tone="emerald"
            onCopy={onCopy}
          />

          {item.notes && (
            <section className="rounded-xl border border-amber-500/15 bg-amber-500/[0.055] p-5">
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

function ConfirmModal({
  confirm,
  busy,
  onClose,
}: {
  confirm: ConfirmState;
  busy: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111318] p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Confirm Delete
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
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/15 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {busy ? "Deleting..." : confirm.actionLabel}
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
  onCopy,
}: {
  label: string;
  value: string;
  tone: "blue" | "violet" | "emerald";
  onCopy: (value: string, label: string) => Promise<void>;
}) {
  const canCopy = Boolean(value.trim());

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
      <div
        className={[
          "flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4",
          toneHeader(tone),
        ].join(" ")}
      >
        <p className="text-xs font-black uppercase tracking-wide text-white">
          {label}
        </p>

        <button
          onClick={() => void onCopy(value, label)}
          disabled={!canCopy}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <div className="p-5">
        <p className="whitespace-pre-wrap break-words text-[15px] leading-8 text-slate-200">
          {value || "Nothing added yet."}
        </p>
      </div>
    </section>
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

function LoadingUploadedItems() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[112px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function EmptyUploadedItems() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <Video className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">
          No uploaded content yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Mark content as uploaded from Ready to Upload first.
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