import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Archive,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe2,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import {
  createContentPage,
  deleteContentPage,
  getContentPages,
  setContentPageStatus,
  updateContentPage,
  type CreateContentPageInput,
  type UpdateContentPageInput,
} from "../services/contentPageService";
import type { ContentPageDbItem, ContentPageStatus } from "../types";

type BrandPagesPageProps = {
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
  tone: "amber" | "emerald" | "red";
  onConfirm: () => Promise<void>;
};

type PageFormModalProps =
  | {
      mode: "create";
      onClose: () => void;
      onSubmit: (input: CreateContentPageInput) => Promise<void>;
    }
  | {
      mode: "edit";
      page: ContentPageDbItem;
      onClose: () => void;
      onSubmit: (input: UpdateContentPageInput) => Promise<void>;
    };

export function BrandPagesPage({ onOpenSidebar }: BrandPagesPageProps) {
  const [pages, setPages] = useState<ContentPageDbItem[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyPageId, setBusyPageId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPageDbItem | null>(
    null,
  );
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  async function loadPages() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getContentPages();

      setPages(data);

      setSelectedPageId((currentSelectedId) => {
        if (
          currentSelectedId &&
          data.some((page) => page.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return data[0]?.id ?? "";
      });
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load brand pages.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPages();
  }, []);

  const filteredPages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return pages;
    }

    return pages.filter((page) => {
      return (
        page.name.toLowerCase().includes(query) ||
        page.platform.toLowerCase().includes(query) ||
        page.niche.toLowerCase().includes(query) ||
        page.status.toLowerCase().includes(query)
      );
    });
  }, [pages, search]);

  const selectedPage =
    pages.find((page) => page.id === selectedPageId) ??
    filteredPages[0] ??
    pages[0] ??
    null;

  const activeCount = pages.filter((page) => page.status === "active").length;
  const archivedCount = pages.filter((page) => page.status === "archived")
    .length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  async function handleCreatePage(input: CreateContentPageInput) {
    await createContentPage(input);

    showNotice("Brand page created successfully.");
    setCreateModalOpen(false);

    await loadPages();
  }

  async function handleUpdatePage(input: UpdateContentPageInput) {
    await updateContentPage(input);

    showNotice("Brand page updated successfully.");
    setEditingPage(null);
    setSelectedPageId(input.id);

    await loadPages();
  }

  function handleSetStatus(page: ContentPageDbItem) {
    const nextStatus: ContentPageStatus =
      page.status === "active" ? "archived" : "active";

    setConfirm({
      title:
        nextStatus === "archived"
          ? `Archive ${page.name}?`
          : `Reactivate ${page.name}?`,
      description:
        nextStatus === "archived"
          ? "Archived pages will no longer appear in new To Do List brand dropdowns, but existing work stays connected."
          : "This page will appear again in the To Do List brand dropdown.",
      actionLabel: nextStatus === "archived" ? "Archive Page" : "Reactivate",
      tone: nextStatus === "archived" ? "amber" : "emerald",
      onConfirm: () => executeSetStatus(page, nextStatus),
    });
  }

  async function executeSetStatus(
    page: ContentPageDbItem,
    nextStatus: ContentPageStatus,
  ) {
    try {
      setBusyPageId(page.id);

      await setContentPageStatus(page.id, nextStatus);

      showNotice(
        nextStatus === "archived"
          ? `${page.name} was archived.`
          : `${page.name} was reactivated.`,
      );

      setConfirm(null);

      await loadPages();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to update status.",
        "error",
      );
    } finally {
      setBusyPageId("");
    }
  }

  function handleDeletePage(page: ContentPageDbItem) {
    setConfirm({
      title: `Delete ${page.name}?`,
      description:
        "This permanently deletes the brand page. This will only work if no To Do item is using this page. If the page is still used, archive it instead.",
      actionLabel: "Delete Page",
      tone: "red",
      onConfirm: () => executeDeletePage(page),
    });
  }

  async function executeDeletePage(page: ContentPageDbItem) {
    try {
      setBusyPageId(page.id);

      await deleteContentPage(page.id);

      const remainingPages = pages.filter((item) => item.id !== page.id);

      setPages(remainingPages);
      setSelectedPageId(remainingPages[0]?.id ?? "");
      setConfirm(null);

      showNotice(`${page.name} was deleted.`);
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Failed to delete brand page.",
        "error",
      );
    } finally {
      setBusyPageId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Brand Pages"
        description="Manage the actual content pages used across To Do List and production work."
        onOpenSidebar={onOpenSidebar}
        accent="cyan"
        pills={[
          {
            icon: Layers,
            value: pages.length,
            label: "Total pages",
            accent: "cyan",
          },
          {
            icon: CheckCircle2,
            value: activeCount,
            label: "Active",
            accent: "emerald",
          },
          {
            icon: Archive,
            value: archivedCount,
            label: "Archived",
            accent: "amber",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load brand pages">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">
                Pages
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Used by To Do List brand dropdown.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => void loadPages()}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh"
              >
                <RefreshCw
                  className={[
                    "h-4 w-4",
                    loading ? "animate-spin" : "",
                  ].join(" ")}
                />
              </button>

              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  setNotice(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-400"
                title="Add brand page"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pages..."
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <LoadingPages />
            ) : filteredPages.length === 0 ? (
              <EmptyPages />
            ) : (
              <div className="space-y-3">
                {filteredPages.map((page) => (
                  <PageListCard
                    key={page.id}
                    page={page}
                    selected={selectedPage?.id === page.id}
                    onClick={() => setSelectedPageId(page.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
          {selectedPage ? (
            <PageDetail
              page={selectedPage}
              busyPageId={busyPageId}
              onEdit={setEditingPage}
              onSetStatus={handleSetStatus}
              onDelete={handleDeletePage}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div>
                <Layers className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 font-semibold text-white">
                  Select a brand page
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Page details will appear here.
                </p>
              </div>
            </div>
          )}
        </main>
      </section>

      {createModalOpen && (
        <PageFormModal
          mode="create"
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreatePage}
        />
      )}

      {editingPage && (
        <PageFormModal
          mode="edit"
          page={editingPage}
          onClose={() => setEditingPage(null)}
          onSubmit={handleUpdatePage}
        />
      )}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          busy={Boolean(busyPageId)}
          onClose={() => setConfirm(null)}
        />
      )}
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
  const toneStyle = {
    amber:
      "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    emerald:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
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

function PageListCard({
  page,
  selected,
  onClick,
}: {
  page: ContentPageDbItem;
  selected: boolean;
  onClick: () => void;
}) {
  const archived = page.status === "archived";

  return (
    <button
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-xl border p-4 text-left transition",
        selected
          ? "border-cyan-500/45 bg-cyan-500/[0.065] ring-1 ring-cyan-500/30"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
        archived ? "opacity-70" : "",
      ].join(" ")}
    >

      <span
        className={[
          "absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b",
          archived
            ? "from-slate-500 via-slate-600 to-slate-700"
            : "from-cyan-400 via-blue-500 to-violet-600",
        ].join(" ")}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={page.status} />

        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
          {page.platform}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug text-white">
        {page.name}
      </h3>

      <p className="mt-2 line-clamp-1 text-xs font-semibold text-slate-500">
        {page.niche || "No niche added"}
      </p>
    </button>
  );
}

function PageDetail({
  page,
  busyPageId,
  onEdit,
  onSetStatus,
  onDelete,
}: {
  page: ContentPageDbItem;
  busyPageId: string;
  onEdit: (page: ContentPageDbItem) => void;
  onSetStatus: (page: ContentPageDbItem) => void;
  onDelete: (page: ContentPageDbItem) => void;
}) {
  const busy = busyPageId === page.id;
  const archived = page.status === "archived";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-[#111318] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={page.status} />

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                {page.platform}
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                Created {formatDate(page.created_at)}
              </span>
            </div>

            <h2 className="mt-3 break-words text-3xl font-black leading-tight text-white">
              {page.name}
            </h2>

            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Globe2 className="h-4 w-4 text-slate-500" />
              {page.niche || "No niche added"}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={() => onEdit(page)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>

            <button
              onClick={() => onSetStatus(page)}
              disabled={busy}
              className={[
                "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                archived
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
              ].join(" ")}
            >
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : archived ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {archived ? "Reactivate" : "Archive"}
            </button>

            {archived && (
              <button
                onClick={() => onDelete(page)}
                disabled={busy}
                className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          <InfoBlock label="Page Name" value={page.name} />
          <InfoBlock label="Platform" value={page.platform} />
          <InfoBlock label="Niche" value={page.niche || "Nothing added yet."} />

          <section className="rounded-xl border border-white/10 bg-[#0B0D10] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-white">
                Page URL
              </p>

              {page.page_url && (
                <a
                  href={page.page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              )}
            </div>

            <p className="mt-3 break-words text-sm leading-7 text-slate-300">
              {page.page_url || "Nothing added yet."}
            </p>
          </section>

          <InfoBlock label="Notes" value={page.notes || "Nothing added yet."} />
        </div>
      </div>
    </div>
  );
}

function PageFormModal(props: PageFormModalProps) {
  const { mode, onClose, onSubmit } = props;

  const [form, setForm] = useState<{
    name: string;
    platform: string;
    pageUrl: string;
    niche: string;
    notes: string;
    status: ContentPageStatus;
  }>({
    name: mode === "edit" ? props.page.name : "",
    platform: mode === "edit" ? props.page.platform : "Facebook",
    pageUrl: mode === "edit" ? props.page.page_url : "",
    niche: mode === "edit" ? props.page.niche : "",
    notes: mode === "edit" ? props.page.notes : "",
    status: mode === "edit" ? props.page.status : "active",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.name.trim()) {
        throw new Error("Page name is required.");
      }

      if (!form.platform.trim()) {
        throw new Error("Platform is required.");
      }

      if (mode === "edit") {
        await onSubmit({
          id: props.page.id,
          name: form.name,
          platform: form.platform,
          pageUrl: form.pageUrl,
          niche: form.niche,
          notes: form.notes,
          status: form.status,
        });
      } else {
        await onSubmit({
          name: form.name,
          platform: form.platform,
          pageUrl: form.pageUrl,
          niche: form.niche,
          notes: form.notes,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
              {mode === "create" ? "New Brand Page" : "Edit Brand Page"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {mode === "create" ? "Add brand page" : "Update brand page"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              These pages appear in the To Do List brand dropdown.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Page Name"
              value={form.name}
              placeholder="Example: Maya's Kitchen"
              onChange={(value) =>
                setForm((current) => ({ ...current, name: value }))
              }
            />

            <TextField
              label="Platform"
              value={form.platform}
              placeholder="Facebook"
              onChange={(value) =>
                setForm((current) => ({ ...current, platform: value }))
              }
            />

            <TextField
              label="Page URL"
              value={form.pageUrl}
              placeholder="https://facebook.com/..."
              onChange={(value) =>
                setForm((current) => ({ ...current, pageUrl: value }))
              }
            />

            <TextField
              label="Niche"
              value={form.niche}
              placeholder="AI cooking, health, motivation..."
              onChange={(value) =>
                setForm((current) => ({ ...current, niche: value }))
              }
            />

            {mode === "edit" && (
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-300">
                  Status
                </span>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as ContentPageStatus,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-500/70"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            )}
          </div>

          <div className="mt-4">
            <TextArea
              label="Notes"
              value={form.notes}
              placeholder="Optional notes for this page..."
              rows={4}
              onChange={(value) =>
                setForm((current) => ({ ...current, notes: value }))
              }
            />
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Add Page"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0B0D10] p-5">
      <p className="text-xs font-black uppercase tracking-wide text-white">
        {label}
      </p>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
        {value}
      </p>
    </section>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/70"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/70"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: ContentPageStatus }) {
  const style =
    status === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-amber-500/20 bg-amber-500/10 text-amber-300";

  return (
    <span
      className={[
        "rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
        style,
      ].join(" ")}
    >
      {status === "active" ? "Active" : "Archived"}
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

function LoadingPages() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[108px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function EmptyPages() {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <Layers className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">No brand pages found</p>
        <p className="mt-1 text-sm text-slate-500">
          Add a page so it can appear in To Do List.
        </p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}