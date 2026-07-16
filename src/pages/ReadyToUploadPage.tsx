import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
  RefreshCw,
  Search,
  Send,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { getTodoItems, updateTodoStatus } from "../services/todoService";
import type { TodoDbItem } from "../types";

type ReadyToUploadPageProps = {
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

export function ReadyToUploadPage({ onOpenSidebar }: ReadyToUploadPageProps) {
  const [items, setItems] = useState<TodoDbItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  async function loadReadyItems() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getTodoItems();
      const readyItems = data.filter((item) => item.status === "done");

      setItems(readyItems);

      setSelectedItemId((currentSelectedId) => {
        if (
          currentSelectedId &&
          readyItems.some((item) => item.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return readyItems[0]?.id ?? "";
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to load ready uploads.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReadyItems();
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
  const missingLinksCount = items.filter((item) => !item.drive_url).length;

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

  function requestMarkUploaded(item: TodoDbItem) {
    setConfirm({
      title: "Mark as uploaded?",
      description: `"${item.title}" will move from Ready to Upload to Uploaded Content.`,
      actionLabel: "Mark Uploaded",
      onConfirm: () => executeMarkUploaded(item),
    });
  }

  async function executeMarkUploaded(item: TodoDbItem) {
    try {
      setBusyItemId(item.id);

      await updateTodoStatus(item.id, "posted");

      const remainingItems = items.filter(
        (currentItem) => currentItem.id !== item.id,
      );

      setItems(remainingItems);
      setSelectedItemId(remainingItems[0]?.id ?? "");
      setConfirm(null);

      showNotice("Moved to Uploaded Content.");
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Failed to mark as uploaded.",
        "error",
      );
    } finally {
      setBusyItemId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Ready to Upload"
        description="Approved work from Production Board. Open the Drive link, copy the publishing assets, then mark it uploaded."
        onOpenSidebar={onOpenSidebar}
        accent="emerald"
        pills={[
          {
            icon: Upload,
            value: items.length,
            label: "Ready items",
            accent: "emerald",
          },
          {
            icon: Link2,
            value: withLinksCount,
            label: "With link",
            accent: "blue",
          },
          {
            icon: AlertTriangle,
            value: missingLinksCount,
            label: "Missing link",
            accent: "amber",
          },
          {
            icon: CheckCircle2,
            value: items.length,
            label: "Approved",
            accent: "emerald",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load Ready to Upload">
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
                Approved Queue
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Done tasks waiting for upload.
              </p>
            </div>

            <button
              onClick={() => void loadReadyItems()}
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
              placeholder="Search ready items..."
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <LoadingReadyItems />
            ) : filteredItems.length === 0 ? (
              <EmptyReadyItems />
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <ReadyCard
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
            <ReadyDetail
              item={selectedItem}
              busyItemId={busyItemId}
              onCopy={copyText}
              onMarkUploaded={requestMarkUploaded}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div>
                <Upload className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 font-semibold text-white">
                  Select a ready item
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Drive link and publishing copy will appear here.
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

function ReadyCard({
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
          ? "border-emerald-500/45 bg-emerald-500/[0.065] ring-1 ring-emerald-500/30"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
      ].join(" ")}
    >
      <span className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-emerald-400 via-green-500 to-cyan-600" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300">
          Ready
        </span>

        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
          {pageName(item)}
        </span>

        {item.drive_url ? (
          <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-black text-blue-300">
            Link
          </span>
        ) : (
          <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-black text-amber-300">
            No Link
          </span>
        )}
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

function ReadyDetail({
  item,
  busyItemId,
  onCopy,
  onMarkUploaded,
}: {
  item: TodoDbItem;
  busyItemId: string;
  onCopy: (value: string, label: string) => Promise<void>;
  onMarkUploaded: (item: TodoDbItem) => void;
}) {
  const busy = busyItemId === item.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-[#111318] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-emerald-300">
                Ready
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                {pageName(item)}
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                Approved {formatDate(item.updated_at)}
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
              Created from work assigned to {assigneeName(item)}
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

            <button
              onClick={() => onMarkUploaded(item)}
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Uploaded
            </button>
          </div>
        </div>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-5xl space-y-5">
          {!item.drive_url && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-semibold leading-6 text-amber-200">
              This item is marked ready, but no Drive link is attached.
            </div>
          )}

          {item.drive_url && (
            <section className="rounded-xl border border-blue-500/20 bg-blue-500/[0.08] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-wide text-blue-300">
                  Submitted Drive Link
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
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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

function LoadingReadyItems() {
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

function EmptyReadyItems() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <Upload className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">No ready uploads yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Approve work in Production Board first.
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