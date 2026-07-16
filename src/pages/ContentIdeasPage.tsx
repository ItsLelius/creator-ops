import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  Copy,
  Edit3,
  ExternalLink,
  FolderOpen,
  Lightbulb,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { SmoothSelect } from "../components/common/SmoothSelect";
import { getContentPages } from "../services/contentPageService";
import {
  createContentIdea,
  deleteContentIdea,
  getContentIdeas,
  updateContentIdea,
  type CreateContentIdeaInput,
  type UpdateContentIdeaInput,
} from "../services/contentIdeaService";
import type { ContentIdeaDbItem, ContentPageDbItem } from "../types";

type ContentIdeasPageProps = {
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

type IdeaFormModalProps =
  | {
      mode: "create";
      pages: ContentPageDbItem[];
      selectedPageId: string;
      onClose: () => void;
      onSubmit: (input: CreateContentIdeaInput) => Promise<void>;
    }
  | {
      mode: "edit";
      idea: ContentIdeaDbItem;
      pages: ContentPageDbItem[];
      selectedPageId: string;
      onClose: () => void;
      onSubmit: (input: UpdateContentIdeaInput) => Promise<void>;
    };

export function ContentIdeasPage({ onOpenSidebar }: ContentIdeasPageProps) {
  const [pages, setPages] = useState<ContentPageDbItem[]>([]);
  const [ideas, setIdeas] = useState<ContentIdeaDbItem[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyIdeaId, setBusyIdeaId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdeaDbItem | null>(
    null,
  );
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setLoadError("");

      const [pageRows, ideaRows] = await Promise.all([
        getContentPages(),
        getContentIdeas(),
      ]);

      setPages(pageRows);
      setIdeas(ideaRows);

      setSelectedPageId((currentPageId) => {
        if (
          currentPageId &&
          pageRows.some((page) => page.id === currentPageId)
        ) {
          return currentPageId;
        }

        return null;
      });
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Failed to load content ideas.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const activePages = useMemo(() => {
    return pages.filter((page) => page.status === "active");
  }, [pages]);

  const folders = useMemo(() => {
    return pages
      .map((page) => ({
        page,
        count: ideas.filter((idea) => idea.content_page_id === page.id).length,
      }))
      .sort((a, b) => a.page.name.localeCompare(b.page.name));
  }, [pages, ideas]);

  const selectedPage = useMemo(() => {
    return pages.find((page) => page.id === selectedPageId) ?? null;
  }, [pages, selectedPageId]);

  const selectedPageIdeas = useMemo(() => {
    if (!selectedPageId) {
      return [];
    }

    return ideas.filter((idea) => idea.content_page_id === selectedPageId);
  }, [ideas, selectedPageId]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(selectedPageIdeas.map((idea) => idea.category).filter(Boolean)),
    ).sort();
  }, [selectedPageIdeas]);

  const filteredIdeas = useMemo(() => {
    const query = search.trim().toLowerCase();

    return selectedPageIdeas.filter((idea) => {
      const matchesSearch =
        !query ||
        idea.title.toLowerCase().includes(query) ||
        idea.category.toLowerCase().includes(query) ||
        idea.hook.toLowerCase().includes(query) ||
        idea.notes.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "all" || idea.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [selectedPageIdeas, search, categoryFilter]);

  const selectedIdea =
    filteredIdeas.find((idea) => idea.id === selectedIdeaId) ??
    filteredIdeas[0] ??
    null;

  const sourceCount = ideas.filter((idea) => Boolean(idea.source_url)).length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  function openPage(pageId: string) {
    setSelectedPageId(pageId);
    setSelectedIdeaId(null);
    setSearch("");
    setCategoryFilter("all");
    setNotice(null);
  }

  function backToFolders() {
    setSelectedPageId(null);
    setSelectedIdeaId(null);
    setSearch("");
    setCategoryFilter("all");
  }

  async function handleCreateIdea(input: CreateContentIdeaInput) {
    await createContentIdea(input);

    showNotice("Content idea saved.");
    setCreateModalOpen(false);
    setSelectedPageId(input.contentPageId);

    await loadData();
  }

  async function handleUpdateIdea(input: UpdateContentIdeaInput) {
    await updateContentIdea(input);

    showNotice("Content idea updated.");
    setEditingIdea(null);
    setSelectedIdeaId(input.id);
    setSelectedPageId(input.contentPageId);

    await loadData();
  }

  async function copyIdea(idea: ContentIdeaDbItem) {
    await navigator.clipboard.writeText(
      `${idea.title}\n\nHook / Concept:\n${idea.hook}\n\nNotes:\n${idea.notes}`,
    );

    showNotice("Idea copied.");
  }

  function requestDeleteIdea(idea: ContentIdeaDbItem) {
    setConfirm({
      title: "Delete this idea?",
      description: `"${idea.title}" will be permanently removed from Content Ideas.`,
      actionLabel: "Delete Idea",
      onConfirm: () => executeDeleteIdea(idea),
    });
  }

  async function executeDeleteIdea(idea: ContentIdeaDbItem) {
    try {
      setBusyIdeaId(idea.id);

      await deleteContentIdea(idea.id);

      const remainingIdeas = ideas.filter((item) => item.id !== idea.id);

      setIdeas(remainingIdeas);
      setSelectedIdeaId(null);
      setConfirm(null);

      showNotice("Content idea deleted.");
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to delete idea.",
        "error",
      );
    } finally {
      setBusyIdeaId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Content Ideas"
        description="Synced idea folders from Brand Pages. Save text ideas and source links only for now."
        onOpenSidebar={onOpenSidebar}
        accent="violet"
        pills={[
          {
            icon: Lightbulb,
            value: ideas.length,
            label: "Saved ideas",
            accent: "violet",
          },
          {
            icon: FolderOpen,
            value: pages.length,
            label: "Page folders",
            accent: "blue",
          },
          {
            icon: ExternalLink,
            value: sourceCount,
            label: "With source",
            accent: "emerald",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load Content Ideas">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      {!selectedPage && (
        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Idea Folders</h2>
              <p className="mt-1 text-sm text-slate-500">
                Each folder comes from your real Brand Pages.
              </p>
            </div>

            <button
              onClick={() => void loadData()}
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

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <LoadingFolders />
            ) : pages.length === 0 ? (
              <EmptyState
                title="No brand pages yet"
                description="Create brand pages first. Content Ideas will automatically sync folders from those pages."
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {folders.map((folder) => (
                  <FolderButton
                    key={folder.page.id}
                    page={folder.page}
                    count={folder.count}
                    onClick={() => openPage(folder.page.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {selectedPage && (
        <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-4 flex shrink-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <button
                onClick={backToFolders}
                className="mb-3 flex items-center gap-2 text-sm font-black text-blue-400 transition hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to idea folders
              </button>

              <h2 className="truncate text-xl font-black text-white">
                {selectedPage.name} Ideas
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredIdeas.length} idea
                {filteredIdeas.length === 1 ? "" : "s"} shown
              </p>
            </div>

            {activePages.length > 0 && (
              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  setNotice(null);
                }}
                className="flex w-fit items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-400"
              >
                <Plus className="h-4 w-4" />
                New Idea
              </button>
            )}
          </div>

          <div className="mb-4 grid shrink-0 gap-3 md:grid-cols-[1fr_260px]">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedIdeaId(null);
                }}
                placeholder="Search ideas..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
              />
            </div>

            <SmoothSelect
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value);
                setSelectedIdeaId(null);
              }}
              options={[
                { label: "All Categories", value: "all" },
                ...categories.map((category) => ({
                  label: category,
                  value: category,
                })),
              ]}
            />
          </div>

          <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="scroll-panel min-h-0 min-w-0 overflow-y-auto pr-1">
              {loading ? (
                <LoadingIdeas />
              ) : filteredIdeas.length === 0 ? (
                <EmptyState
                  title="No ideas found"
                  description="Add an idea for this page or adjust your filters."
                />
              ) : (
                <div className="space-y-3">
                  {filteredIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      selected={selectedIdea?.id === idea.id}
                      onClick={() => setSelectedIdeaId(idea.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
              {!selectedIdea ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <div>
                    <Lightbulb className="mx-auto h-10 w-10 text-slate-600" />
                    <p className="mt-3 font-semibold text-white">
                      Select an idea
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Idea details and reference information will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <IdeaDetailPanel
                  idea={selectedIdea}
                  busy={busyIdeaId === selectedIdea.id}
                  onEdit={setEditingIdea}
                  onDelete={requestDeleteIdea}
                  onCopy={copyIdea}
                />
              )}
            </aside>
          </div>
        </section>
      )}

      {createModalOpen && (
        <IdeaFormModal
          mode="create"
          pages={activePages}
          selectedPageId={selectedPageId ?? activePages[0]?.id ?? ""}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateIdea}
        />
      )}

      {editingIdea && (
        <IdeaFormModal
          mode="edit"
          idea={editingIdea}
          pages={activePages}
          selectedPageId={selectedPageId ?? editingIdea.content_page_id}
          onClose={() => setEditingIdea(null)}
          onSubmit={handleUpdateIdea}
        />
      )}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          busy={Boolean(busyIdeaId)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function FolderButton({
  page,
  count,
  onClick,
}: {
  page: ContentPageDbItem;
  count: number;
  onClick: () => void;
}) {
  const archived = page.status === "archived";

  return (
    <button
      onClick={onClick}
      className={[
        "group relative overflow-hidden rounded-xl border p-5 text-left transition",
        "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
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

      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-blue-300">
        <FolderOpen className="h-5 w-5" />
      </div>

      <h3 className="mt-4 line-clamp-2 text-base font-black text-white">
        {page.name}
      </h3>

      <p className="mt-1 text-sm font-semibold text-slate-500">
        {count} saved idea{count === 1 ? "" : "s"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
          {page.platform}
        </span>

        <span
          className={[
            "rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
            archived
              ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
          ].join(" ")}
        >
          {page.status}
        </span>
      </div>
    </button>
  );
}

function IdeaCard({
  idea,
  selected,
  onClick,
}: {
  idea: ContentIdeaDbItem;
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
      <span className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-600" />

      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-violet-300">
          Idea
        </span>

        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
          {idea.category}
        </span>

        {idea.source_url && (
          <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-black text-blue-300">
            Source
          </span>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug text-white">
        {idea.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-slate-500">
        {idea.hook || "No hook added yet."}
      </p>
    </button>
  );
}

function IdeaDetailPanel({
  idea,
  busy,
  onEdit,
  onDelete,
  onCopy,
}: {
  idea: ContentIdeaDbItem;
  busy: boolean;
  onEdit: (idea: ContentIdeaDbItem) => void;
  onDelete: (idea: ContentIdeaDbItem) => void;
  onCopy: (idea: ContentIdeaDbItem) => Promise<void>;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-[#111318] p-6">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-violet-300">
            Idea Preview
          </span>

          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
            {idea.category}
          </span>
        </div>

        <h3 className="mt-4 break-words text-3xl font-black leading-tight text-white">
          {idea.title}
        </h3>

        <p className="mt-3 text-sm font-semibold text-slate-400">
          {pageName(idea)}
        </p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Category" value={idea.category} />
          <InfoBox label="Saved" value={formatDate(idea.created_at)} />
          <InfoBox
            label="Source"
            value={idea.source_name || "No source name"}
            className="col-span-2"
          />
        </div>

        <InfoSection label="Hook / Concept" value={idea.hook} />
        <InfoSection label="Notes" value={idea.notes} />

        <div className="mt-5 flex flex-wrap gap-3">
          {idea.source_url && (
            <a
              href={idea.source_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-black text-blue-300 transition hover:bg-blue-500/20"
            >
              <ExternalLink className="h-4 w-4" />
              Source
            </a>
          )}

          <button
            onClick={() => void onCopy(idea)}
            className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm font-black text-violet-300 transition hover:bg-violet-500/20"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>

          <button
            onClick={() => onEdit(idea)}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-black text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>

          <button
            onClick={() => onDelete(idea)}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function IdeaFormModal(props: IdeaFormModalProps) {
  const { mode, pages, selectedPageId, onClose, onSubmit } = props;

  const [form, setForm] = useState({
    contentPageId:
      mode === "edit"
        ? props.idea.content_page_id
        : selectedPageId || pages[0]?.id || "",
    title: mode === "edit" ? props.idea.title : "",
    category: mode === "edit" ? props.idea.category : "General",
    sourceName: mode === "edit" ? props.idea.source_name : "",
    sourceUrl: mode === "edit" ? props.idea.source_url : "",
    hook: mode === "edit" ? props.idea.hook : "",
    notes: mode === "edit" ? props.idea.notes : "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.contentPageId) {
        throw new Error("Choose a brand page first.");
      }

      if (!form.title.trim()) {
        throw new Error("Idea title is required.");
      }

      if (mode === "edit") {
        await onSubmit({
          id: props.idea.id,
          contentPageId: form.contentPageId,
          title: form.title,
          category: form.category,
          sourceName: form.sourceName,
          sourceUrl: form.sourceUrl,
          hook: form.hook,
          notes: form.notes,
        });
      } else {
        await onSubmit({
          contentPageId: form.contentPageId,
          title: form.title,
          category: form.category,
          sourceName: form.sourceName,
          sourceUrl: form.sourceUrl,
          hook: form.hook,
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
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
              {mode === "create" ? "New Content Idea" : "Edit Content Idea"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {mode === "create" ? "Save idea" : "Update idea"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              No files yet. Save the idea text, source name, and optional source
              link only.
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

        <form
          onSubmit={handleSubmit}
          className="scroll-panel max-h-[calc(92vh-130px)] overflow-y-auto p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-300">
                Brand Page
              </span>

              <select
                value={form.contentPageId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    contentPageId: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-violet-500/70"
              >
                <option value="">Choose brand page</option>

                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </label>

            <TextField
              label="Idea Title"
              value={form.title}
              placeholder="Example: Air Fryer Onion Rings Twist"
              onChange={(value) =>
                setForm((current) => ({ ...current, title: value }))
              }
            />

            <TextField
              label="Category"
              value={form.category}
              placeholder="Recipe, hook, reference..."
              onChange={(value) =>
                setForm((current) => ({ ...current, category: value }))
              }
            />

            <TextField
              label="Source Name"
              value={form.sourceName}
              placeholder="TikTok, YouTube, Food blog..."
              onChange={(value) =>
                setForm((current) => ({ ...current, sourceName: value }))
              }
            />

            <TextField
              label="Source URL"
              value={form.sourceUrl}
              placeholder="https://..."
              onChange={(value) =>
                setForm((current) => ({ ...current, sourceUrl: value }))
              }
            />
          </div>

          <div className="mt-4 space-y-4">
            <TextArea
              label="Hook / Concept"
              value={form.hook}
              placeholder="What is the idea?"
              rows={5}
              onChange={(value) =>
                setForm((current) => ({ ...current, hook: value }))
              }
            />

            <TextArea
              label="Notes"
              value={form.notes}
              placeholder="Extra notes, script angle, visual direction..."
              rows={5}
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
                  ? "Save Idea"
                  : "Save Changes"}
            </button>
          </div>
        </form>
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
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/15 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {busy ? "Working..." : confirm.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-[#111318] p-4",
        className,
      ].join(" ")}
    >
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function InfoSection({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-5">
      <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="whitespace-pre-wrap break-words text-[15px] leading-8 text-slate-300">
        {value || "Nothing added yet."}
      </p>
    </div>
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
        className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/70"
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
        className="w-full resize-y rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/70"
      />
    </label>
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

function LoadingFolders() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[176px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function LoadingIdeas() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[132px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-10 text-center">
      <div>
        <Lightbulb className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function pageName(idea: ContentIdeaDbItem) {
  return idea.content_page?.name ?? "Unknown Page";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}