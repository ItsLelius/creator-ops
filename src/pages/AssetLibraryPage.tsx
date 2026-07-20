import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileImage,
  FileText,
  FolderOpen,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { getContentPages } from "../services/contentPageService";
import {
  createAsset,
  deleteAsset,
  getAssets,
  updateAsset,
  type CreateAssetInput,
  type UpdateAssetInput,
} from "../services/assetService";
import type { AssetDbItem, AssetType, ContentPageDbItem } from "../types";

type AssetLibraryPageProps = {
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

type AssetFormModalProps =
  | {
      mode: "create";
      pages: ContentPageDbItem[];
      selectedPageId: string;
      selectedType: AssetType;
      onClose: () => void;
      onSubmit: (input: CreateAssetInput, file?: File | null) => Promise<void>;
    }
  | {
      mode: "edit";
      asset: AssetDbItem;
      pages: ContentPageDbItem[];
      selectedPageId: string;
      selectedType: AssetType;
      onClose: () => void;
      onSubmit: (input: UpdateAssetInput, file?: File | null) => Promise<void>;
    };

const assetTypeTabs: Array<{
  type: AssetType;
  label: string;
  description: string;
}> = [
  {
    type: "image",
    label: "Images",
    description: "Preview and download image references.",
  },
  {
    type: "text",
    label: "Text",
    description: "Save text assets that can be copied.",
  },
  {
    type: "pdf",
    label: "PDF",
    description: "Preview and download PDF documents.",
  },
];

export function AssetLibraryPage({ onOpenSidebar }: AssetLibraryPageProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [pages, setPages] = useState<ContentPageDbItem[]>([]);
  const [assets, setAssets] = useState<AssetDbItem[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<AssetType>("pdf");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyAssetId, setBusyAssetId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetDbItem | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetDbItem | null>(null);
  const [copiedAssetId, setCopiedAssetId] = useState("");
  const copyResetRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setLoadError("");

      const [pageRows, assetRows] = await Promise.all([
        getContentPages(),
        getAssets(),
      ]);

      setPages(pageRows);
      setAssets(assetRows);

      setSelectedPageId((currentPageId) => {
        if (
          currentPageId &&
          pageRows.some((page) => page.id === currentPageId)
        ) {
          return currentPageId;
        }

        return pageRows[0]?.id ?? null;
      });
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load asset library.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) {
        window.clearTimeout(copyResetRef.current);
      }
    };
  }, []);

  const activePages = useMemo(() => {
    return pages.filter((page) => page.status === "active");
  }, [pages]);

  const folders = useMemo(() => {
    return pages
      .map((page) => ({
        page,
        count: assets.filter((asset) => asset.content_page_id === page.id)
          .length,
      }))
      .sort((a, b) => a.page.name.localeCompare(b.page.name));
  }, [pages, assets]);

  const selectedPage = useMemo(() => {
    return pages.find((page) => page.id === selectedPageId) ?? null;
  }, [pages, selectedPageId]);

  const selectedTab = assetTypeTabs.find((tab) => tab.type === selectedType);

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesPage = selectedPageId
        ? asset.content_page_id === selectedPageId
        : false;

      const matchesType = asset.type === selectedType;

      const matchesSearch =
        !query ||
        asset.title.toLowerCase().includes(query) ||
        asset.description.toLowerCase().includes(query) ||
        asset.content.toLowerCase().includes(query) ||
        asset.file_name.toLowerCase().includes(query);

      return matchesPage && matchesType && matchesSearch;
    });
  }, [assets, selectedPageId, selectedType, search]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ?? null;

  const activePreviewAsset = previewAsset
    ? assets.find((asset) => asset.id === previewAsset.id) ?? previewAsset
    : null;

  const imageCount = assets.filter((asset) => asset.type === "image").length;
  const textCount = assets.filter((asset) => asset.type === "text").length;
  const pdfCount = assets.filter((asset) => asset.type === "pdf").length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  function openPage(pageId: string) {
    setSelectedPageId(pageId);
    setSelectedAssetId(null);
    setPreviewAsset(null);
    setSearch("");
    setNotice(null);
  }

  function changeType(type: AssetType) {
    setSelectedType(type);
    setSelectedAssetId(null);
    setPreviewAsset(null);
    setSearch("");
  }

  async function handleCreateAsset(input: CreateAssetInput, file?: File | null) {
    const created = await createAsset(input, file);

    showNotice(`${assetTypeLabel(input.type)} asset saved.`);
    setCreateModalOpen(false);
    setSelectedPageId(input.contentPageId);
    setSelectedType(input.type);
    setSelectedAssetId(created.id);

    await loadData();
  }

  async function handleUpdateAsset(input: UpdateAssetInput, file?: File | null) {
    await updateAsset(input, file);

    showNotice(`${assetTypeLabel(input.type)} asset updated.`);
    setEditingAsset(null);
    setSelectedPageId(input.contentPageId);
    setSelectedType(input.type);
    setSelectedAssetId(input.id);

    await loadData();
  }

  function requestDeleteAsset(asset: AssetDbItem) {
    setConfirm({
      title: `Delete this ${assetTypeLabel(asset.type)}?`,
      description: `"${asset.title}" will be permanently removed from Asset Library.`,
      actionLabel: `Delete ${assetTypeLabel(asset.type)}`,
      onConfirm: () => executeDeleteAsset(asset),
    });
  }

  async function executeDeleteAsset(asset: AssetDbItem) {
    try {
      setBusyAssetId(asset.id);

      await deleteAsset(asset.id);

      const remainingAssets = assets.filter((item) => item.id !== asset.id);

      setAssets(remainingAssets);
      setSelectedAssetId(
        remainingAssets.find(
          (item) =>
            item.content_page_id === asset.content_page_id &&
            item.type === asset.type,
        )?.id ?? null,
      );
      setPreviewAsset(null);
      setConfirm(null);

      showNotice(`${assetTypeLabel(asset.type)} asset deleted.`);
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to delete asset.",
        "error",
      );
    } finally {
      setBusyAssetId("");
    }
  }

  async function copyText(asset: AssetDbItem, value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedAssetId(asset.id);
      showNotice(`${label} copied.`);

      if (copyResetRef.current) {
        window.clearTimeout(copyResetRef.current);
      }

      copyResetRef.current = window.setTimeout(() => {
        setCopiedAssetId("");
      }, 1200);
    } catch {
      showNotice("Could not copy text. Please try again.", "error");
    }
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <PageHeader
        title="Asset Library"
        description="Manage reusable image, text, and PDF assets for each brand page."
        onOpenSidebar={onOpenSidebar}
        accent="blue"
        pills={[
          {
            icon: FolderOpen,
            value: pages.length,
            label: "Folders",
            accent: "blue",
          },
          {
            icon: FileImage,
            value: imageCount,
            label: "Images",
            accent: "violet",
          },
          {
            icon: Copy,
            value: textCount,
            label: "Text",
            accent: "amber",
          },
          {
            icon: FileText,
            value: pdfCount,
            label: "PDF",
            accent: "emerald",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load Asset Library">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-3.5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Library
              </p>

              <h2 className="mt-2 text-lg font-bold tracking-tight text-white">
                Brand Folders
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-600">
                Assets grouped by brand page.
              </p>
            </div>

            <button
              onClick={() => void loadData()}
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
            ) : folders.length === 0 ? (
              <EmptySmallState
                title="No folders yet"
                description="Create Brand Pages first."
              />
            ) : (
              <div className="space-y-2.5">
                {folders.map((folder) => (
                  <FolderButton
                    key={folder.page.id}
                    page={folder.page}
                    count={folder.count}
                    active={selectedPageId === folder.page.id}
                    onClick={() => openPage(folder.page.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex shrink-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Selected Folder
              </p>

              <h2 className="mt-2 truncate text-2xl font-bold tracking-tight text-white">
                {selectedPage?.name ?? "No Folder Selected"}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {selectedTab?.description}
              </p>
            </div>

            {isAdmin && activePages.length > 0 && (
              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  setNotice(null);
                }}
                className="flex w-fit items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-400"
              >
                <Plus className="h-4 w-4" />
                Add {assetTypeLabel(selectedType)}
              </button>
            )}
          </div>

          <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5 transition focus-within:border-blue-500/60">
              <Search className="h-4 w-4 shrink-0 text-slate-600" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedAssetId(null);
                }}
                placeholder={`Search ${selectedTab?.label.toLowerCase()}...`}
                className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-300 outline-none placeholder:text-slate-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-[#0B0D10] p-1">
              {assetTypeTabs.map((tab) => {
                const active = selectedType === tab.type;
                const count = assets.filter(
                  (asset) =>
                    asset.content_page_id === selectedPageId &&
                    asset.type === tab.type,
                ).length;

                return (
                  <button
                    key={tab.type}
                    onClick={() => changeType(tab.type)}
                    className={[
                      "rounded-lg px-3 py-2 text-xs font-bold transition",
                      active
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/15"
                        : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                    ].join(" ")}
                  >
                    {tab.label}{" "}
                    <span className={active ? "text-white/80" : "text-slate-600"}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10] p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-400">
                {filteredAssets.length} {assetTypeLabel(selectedType)} asset
                {filteredAssets.length === 1 ? "" : "s"} found
              </p>

              <p className="text-xs font-medium text-slate-600">
                Click an asset to open a larger floating preview.
              </p>
            </div>

            <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
              {loading ? (
                <LoadingAssets />
              ) : filteredAssets.length === 0 ? (
                <EmptyAssetList
                  isAdmin={isAdmin}
                  type={selectedType}
                  onAdd={() => setCreateModalOpen(true)}
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredAssets.map((asset) => (
                    <AssetListItem
                      key={asset.id}
                      asset={asset}
                      selected={selectedAsset?.id === asset.id}
                      onClick={() => {
                        setSelectedAssetId(asset.id);
                        setPreviewAsset(asset);
                        setNotice(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </section>

      {createModalOpen && (
        <AssetFormModal
          mode="create"
          pages={activePages}
          selectedPageId={selectedPageId ?? activePages[0]?.id ?? ""}
          selectedType={selectedType}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateAsset}
        />
      )}

      {editingAsset && (
        <AssetFormModal
          mode="edit"
          asset={editingAsset}
          pages={pages}
          selectedPageId={selectedPageId ?? editingAsset.content_page_id}
          selectedType={selectedType}
          onClose={() => setEditingAsset(null)}
          onSubmit={handleUpdateAsset}
        />
      )}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          busy={Boolean(busyAssetId)}
          onClose={() => setConfirm(null)}
        />
      )}

      {activePreviewAsset && (
        <AssetPreviewModal
          asset={activePreviewAsset}
          isAdmin={isAdmin}
          busy={busyAssetId === activePreviewAsset.id}
          copied={copiedAssetId === activePreviewAsset.id}
          onClose={() => setPreviewAsset(null)}
          onEdit={(asset) => {
            setPreviewAsset(null);
            setEditingAsset(asset);
          }}
          onDelete={(asset) => {
            setPreviewAsset(null);
            requestDeleteAsset(asset);
          }}
          onCopy={copyText}
        />
      )}
    </div>
  );
}

function FolderButton({
  page,
  count,
  active,
  onClick,
}: {
  page: ContentPageDbItem;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const archived = page.status === "archived";

  return (
    <button
      onClick={onClick}
      className={[
        "group relative w-full rounded-lg border p-3 text-left transition",
        active
          ? "border-blue-500/45 bg-blue-500/[0.08] ring-1 ring-blue-500/25"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
        archived ? "opacity-65" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-blue-300">
          <FolderOpen className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white">
              {page.name}
            </h3>

            {archived && (
              <span className="shrink-0 rounded-lg border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                Archived
              </span>
            )}
          </div>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            {count} asset{count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </button>
  );
}

function AssetListItem({
  asset,
  selected,
  onClick,
}: {
  asset: AssetDbItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex min-h-[150px] w-full flex-col rounded-lg border p-4 text-left transition duration-200",
        selected
          ? "border-blue-500/45 bg-blue-500/[0.08] ring-1 ring-blue-500/20"
          : "border-white/10 bg-[#111318] hover:border-white/20 hover:bg-[#151820]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={[
            "rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            assetTypeBadge(asset.type),
          ].join(" ")}
        >
          {assetTypeLabel(asset.type)}
        </span>

        {asset.type !== "text" && (
          <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-slate-400">
            {formatFileSize(asset.file_size)}
          </span>
        )}
      </div>

      <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-white">
        {asset.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
        {asset.type === "text"
          ? asset.content || "No text content."
          : asset.description || asset.file_name}
      </p>

      <div className="mt-auto flex items-center justify-between pt-4">
        <p className="min-w-0 truncate text-xs font-medium text-slate-600">
          {asset.type === "text" ? pageName(asset) : asset.file_name}
        </p>

        <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-slate-400 transition group-hover:border-blue-500/30 group-hover:text-blue-300">
          Open
        </span>
      </div>
    </button>
  );
}

function AssetPreviewModal({
  asset,
  isAdmin,
  busy,
  copied,
  onClose,
  onEdit,
  onDelete,
  onCopy,
}: {
  asset: AssetDbItem;
  isAdmin: boolean;
  busy: boolean;
  copied: boolean;
  onClose: () => void;
  onEdit: (asset: AssetDbItem) => void;
  onDelete: (asset: AssetDbItem) => void;
  onCopy: (asset: AssetDbItem, value: string, label: string) => Promise<void>;
}) {
  const canDownload = asset.type === "image" || asset.type === "pdf";

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/60">
        <div className="shrink-0 border-b border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(59,130,246,0.16),transparent_36%),linear-gradient(135deg,#111318,#0B0D10)] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                    assetTypeBadge(asset.type),
                  ].join(" ")}
                >
                  {assetTypeLabel(asset.type)} Preview
                </span>

                {asset.type !== "text" && (
                  <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                    {formatFileSize(asset.file_size)}
                  </span>
                )}
              </div>

              <h3 className="mt-3 break-words text-2xl font-semibold leading-tight tracking-tight text-white">
                {asset.title}
              </h3>

              <p className="mt-2 break-words text-sm font-medium text-slate-500">
                {asset.type === "text" ? pageName(asset) : asset.file_name}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {asset.file_url && canDownload && (
                <>
                  <a
                    href={asset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>

                  <a
                    href={asset.file_url}
                    download={asset.file_name}
                    className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </>
              )}

              {asset.type === "text" && (
                <button
                  type="button"
                  onClick={() => void onCopy(asset, asset.content, "Text")}
                  className={[
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                    copied
                      ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-300"
                      : "border-violet-500/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20",
                  ].join(" ")}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy Text"}
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(asset)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(asset)}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
          {asset.type === "pdf" && (
            <div className="h-[70vh] min-h-[560px] overflow-hidden rounded-xl border border-white/10 bg-[#07090C]">
              {asset.file_url ? (
                <iframe
                  title={asset.title}
                  src={asset.file_url}
                  className="h-full w-full bg-white"
                />
              ) : (
                <UnavailablePreview />
              )}
            </div>
          )}

          {asset.type === "image" && (
            <div className="flex h-[70vh] min-h-[560px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#07090C] p-4">
              {asset.file_url ? (
                <img
                  src={asset.file_url}
                  alt={asset.title}
                  className="h-full max-h-full w-full max-w-full object-contain"
                />
              ) : (
                <UnavailablePreview />
              )}
            </div>
          )}

          {asset.type === "text" && (
            <div className="rounded-xl border border-white/10 bg-[#0B0D10] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Text Content
                </p>

                <button
                  type="button"
                  onClick={() => void onCopy(asset, asset.content, "Text")}
                  className={[
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                    copied
                      ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-300"
                      : "border-violet-500/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20",
                  ].join(" ")}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="whitespace-pre-wrap break-words text-[15px] leading-8 text-slate-100">
                {asset.content || "Nothing added yet."}
              </p>
            </div>
          )}

          <div className="mt-4 rounded-xl border border-white/10 bg-[#0B0D10] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Description
            </p>

            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
              {asset.description || "No description added yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetFormModal(props: AssetFormModalProps) {
  const { mode, pages, selectedPageId, selectedType, onClose, onSubmit } =
    props;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<{
    contentPageId: string;
    type: AssetType;
    title: string;
    content: string;
    description: string;
  }>({
    contentPageId:
      mode === "edit"
        ? props.asset.content_page_id
        : selectedPageId || pages[0]?.id || "",
    type: mode === "edit" ? props.asset.type : selectedType,
    title: mode === "edit" ? props.asset.title : "",
    content: mode === "edit" ? props.asset.content : "",
    description: mode === "edit" ? props.asset.description : "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleFile(fileToUse: File) {
    const validation = validateLocalFile(form.type, fileToUse);

    if (validation) {
      setError(validation);
      return;
    }

    setError("");
    setFile(fileToUse);

    if (!form.title.trim()) {
      setForm((current) => ({
        ...current,
        title: fileToUse.name.replace(/\.[^.]+$/i, ""),
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.contentPageId) {
        throw new Error("Choose a brand page.");
      }

      if (!form.title.trim()) {
        throw new Error("Title is required.");
      }

      if (form.type === "text" && !form.content.trim()) {
        throw new Error("Text content is required.");
      }

      if (mode === "create") {
        if (form.type !== "text" && !file) {
          throw new Error(`Drop or choose a ${assetTypeLabel(form.type)} file.`);
        }

        await onSubmit(
          {
            contentPageId: form.contentPageId,
            type: form.type,
            title: form.title,
            content: form.content,
            description: form.description,
          },
          file,
        );
      } else {
        await onSubmit(
          {
            id: props.asset.id,
            contentPageId: form.contentPageId,
            type: form.type,
            title: form.title,
            content: form.content,
            description: form.description,
          },
          file,
        );
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  const fileMode = form.type === "image" || form.type === "pdf";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
              {mode === "create" ? "New Asset" : "Edit Asset"}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {mode === "create" ? "Add asset" : "Update asset"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Upload image or PDF files, or save copyable text assets.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="scroll-panel max-h-[calc(92vh-130px)] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-[#0B0D10] p-1">
            {assetTypeTabs.map((tab) => {
              const active = form.type === tab.type;

              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      type: tab.type,
                    }));
                    setFile(null);
                    setError("");
                  }}
                  className={[
                    "rounded-lg px-3 py-2.5 text-sm font-bold transition",
                    active
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {fileMode && (
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);

                const droppedFile = event.dataTransfer.files[0];

                if (droppedFile) {
                  handleFile(droppedFile);
                }
              }}
              className={[
                "mt-5 flex min-h-[180px] cursor-pointer items-center justify-center rounded-xl border border-dashed p-6 text-center transition",
                dragActive
                  ? "border-blue-400 bg-blue-500/10"
                  : "border-white/15 bg-[#0B0D10] hover:border-blue-500/40 hover:bg-blue-500/[0.04]",
              ].join(" ")}
              onClick={() => fileInputRef.current?.click()}
            >
              <div>
                <Upload className="mx-auto h-10 w-10 text-blue-300" />

                <p className="mt-3 text-lg font-bold text-white">
                  {file
                    ? file.name
                    : `Drop ${assetTypeLabel(form.type)} here`}
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {file
                    ? `${formatFileSize(file.size)} selected`
                    : `or click to choose a ${assetTypeLabel(form.type)} file`}
                </p>

                {mode === "edit" && !file && (
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Leave empty to keep the current file.
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={
                  form.type === "pdf"
                    ? "application/pdf,.pdf"
                    : "image/png,image/jpeg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
                }
                className="hidden"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0];

                  if (selectedFile) {
                    handleFile(selectedFile);
                  }
                }}
              />
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-blue-500/70"
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
              label="Title"
              value={form.title}
              placeholder="Example: Maya Character Reference"
              onChange={(value) =>
                setForm((current) => ({ ...current, title: value }))
              }
            />

            <TextField
              label="Description"
              value={form.description}
              placeholder="What is this asset for?"
              onChange={(value) =>
                setForm((current) => ({ ...current, description: value }))
              }
            />
          </div>

          {form.type === "text" && (
            <div className="mt-4">
              <TextArea
                label="Text Content"
                value={form.content}
                placeholder="Paste text asset here..."
                rows={8}
                onChange={(value) =>
                  setForm((current) => ({ ...current, content: value }))
                }
              />
            </div>
          )}

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
              className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Save Asset"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UnavailablePreview() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div>
        <FileText className="mx-auto h-14 w-14 text-slate-600" />
        <p className="mt-4 text-lg font-bold text-white">
          Preview unavailable
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          The signed preview link expired or could not be created. Refresh the
          page to generate a new preview link.
        </p>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Confirm Action
            </p>

            <h3 className="mt-2 text-2xl font-bold leading-tight text-white">
              {confirm.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          {confirm.description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={() => void confirm.onConfirm()}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/15 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {busy ? "Working..." : confirm.actionLabel}
          </button>
        </div>
      </div>
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
        className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
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
        className="w-full resize-y rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
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
      <p className="text-sm font-bold capitalize">{title}</p>
      <p className="mt-1 text-sm font-semibold opacity-90">{children}</p>
    </div>
  );
}

function LoadingFolders() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[82px] animate-pulse rounded-lg border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function LoadingAssets() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[104px] animate-pulse rounded-lg border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function EmptySmallState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-5 text-center">
      <FolderOpen className="mx-auto h-8 w-8 text-slate-700" />
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function EmptyAssetList({
  isAdmin,
  type,
  onAdd,
}: {
  isAdmin: boolean;
  type: AssetType;
  onAdd: () => void;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <FileText className="mx-auto h-10 w-10 text-slate-700" />
        <p className="mt-3 font-semibold text-white">
          No {assetTypeLabel(type)} assets yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? `Add the first ${assetTypeLabel(type)} asset for this Brand Page.`
            : `No ${assetTypeLabel(type)} assets have been added to this folder yet.`}
        </p>

        {isAdmin && (
          <button
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-400"
          >
            <Plus className="h-4 w-4" />
            Add {assetTypeLabel(type)}
          </button>
        )}
      </div>
    </div>
  );
}

function assetTypeBadge(type: AssetType) {
  switch (type) {
    case "image":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "text":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "pdf":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function assetTypeLabel(type: AssetType) {
  switch (type) {
    case "image":
      return "Image";
    case "text":
      return "Text";
    case "pdf":
      return "PDF";
    default:
      return "Asset";
  }
}

function pageName(asset: AssetDbItem) {
  return asset.content_page?.name ?? "Unknown Page";
}

function validateLocalFile(type: AssetType, file: File) {
  if (type === "pdf") {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return "Only PDF files are allowed.";
    }

    if (file.size > 50 * 1024 * 1024) {
      return "PDF must be 50MB or smaller.";
    }
  }

  if (type === "image") {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const lowerName = file.name.toLowerCase();

    const validExtension = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!allowedTypes.includes(file.type) && !validExtension) {
      return "Only JPG, PNG, WEBP, or GIF images are allowed.";
    }

    if (file.size > 20 * 1024 * 1024) {
      return "Image must be 20MB or smaller.";
    }
  }

  return "";
}

function formatFileSize(size: number) {
  if (!size) {
    return "0 KB";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${
    units[unitIndex]
  }`;
}