import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Image,
  Plus,
  Search,
} from "lucide-react";
import { FolderCard } from "../components/cards/FolderCard";
import { InfoBox } from "../components/cards/InfoBox";
import { PageHeader } from "../components/common/PageHeader";
import { SmoothSelect } from "../components/common/SmoothSelect";
import { assetItems } from "../data/mockData";
import type { AssetItem, AssetType } from "../types";

type AssetLibraryPageProps = {
  onOpenSidebar: () => void;
};

export function AssetLibraryPage({ onOpenSidebar }: AssetLibraryPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | AssetType>("all");

  const folders = useMemo(() => {
    const brands = Array.from(new Set(assetItems.map((asset) => asset.brand)));

    return brands.map((brand) => ({
      brand,
      count: assetItems.filter((asset) => asset.brand === brand).length,
    }));
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(assetItems.map((asset) => asset.category)));
  }, []);

  const selectedBrandAssets = useMemo(() => {
    return assetItems.filter((asset) => {
      const matchesBrand = selectedBrand ? asset.brand === selectedBrand : false;

      const matchesSearch = asset.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || asset.category === categoryFilter;

      const matchesType = typeFilter === "all" || asset.type === typeFilter;

      return matchesBrand && matchesSearch && matchesCategory && matchesType;
    });
  }, [selectedBrand, search, categoryFilter, typeFilter]);

  const selectedAsset =
    selectedBrandAssets.find((asset) => asset.id === selectedAssetId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Asset Library"
        description="Downloadable PDFs, images, references, and production documents."
        onOpenSidebar={onOpenSidebar}
        pills={[
          {
            icon: FolderOpen,
            value: folders.length,
            label: "Page folders",
            accent: "cyan",
          },
          {
            icon: FileText,
            value: assetItems.filter((asset) => asset.type === "pdf").length,
            label: "PDF files",
            accent: "blue",
          },
          {
            icon: Image,
            value: assetItems.filter((asset) => asset.type === "image").length,
            label: "Images",
            accent: "violet",
          },
        ]}
      />

      {!selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Asset Folders</h2>
              <p className="mt-1 text-sm text-slate-400">
                Open a page folder to view downloadable PDFs and pictures.
              </p>
            </div>

            <button className="hidden items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 sm:flex">
              <Plus className="h-4 w-4" />
              Add Asset
            </button>
          </div>

          {folders.length === 0 ? (
            <EmptyState
              title="No assets yet"
              description="Upload your first PDF or image reference."
            />
          ) : (
            <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.brand}
                    title={folder.brand}
                    count={folder.count}
                    label="downloadable assets"
                    onClick={() => {
                      setSelectedBrand(folder.brand);
                      setSelectedAssetId(null);
                      setSearch("");
                      setCategoryFilter("all");
                      setTypeFilter("all");
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-4 flex shrink-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setSelectedAssetId(null);
                  setSearch("");
                  setCategoryFilter("all");
                  setTypeFilter("all");
                }}
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to asset folders
              </button>

              <h2 className="truncate text-xl font-bold text-white">
                {selectedBrand} Assets
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {selectedBrandAssets.length} downloadable asset
                {selectedBrandAssets.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <button className="flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400">
              <Plus className="h-4 w-4" />
              Add Asset
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[3fr_2fr]">
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px_180px]">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-slate-500" />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setSelectedAssetId(null);
                    }}
                    placeholder="Search assets..."
                    className="w-full min-w-0 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
                  />
                </div>

                <SmoothSelect
                  value={categoryFilter}
                  onChange={(value) => {
                    setCategoryFilter(value);
                    setSelectedAssetId(null);
                  }}
                  options={[
                    { label: "All Categories", value: "all" },
                    ...categories.map((category) => ({
                      label: category,
                      value: category,
                    })),
                  ]}
                />

                <SmoothSelect
                  value={typeFilter}
                  onChange={(value) => {
                    setTypeFilter(value as "all" | AssetType);
                    setSelectedAssetId(null);
                  }}
                  options={[
                    { label: "All Types", value: "all" },
                    { label: "PDF", value: "pdf" },
                    { label: "Image", value: "image" },
                    { label: "Document", value: "doc" },
                  ]}
                />
              </div>

              <div className="scroll-panel min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
                {selectedBrandAssets.length === 0 ? (
                  <EmptyState
                    title="No assets found"
                    description="Try changing your search, category, or file type filter."
                  />
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    {selectedBrandAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        selected={selectedAssetId === asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
              {!selectedAsset ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <div>
                    <FolderOpen className="mx-auto h-10 w-10 text-slate-600" />
                    <p className="mt-3 font-semibold text-white">
                      Select an asset
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Download information will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <AssetDetailPanel asset={selectedAsset} />
              )}
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

function AssetCard({
  asset,
  selected,
  onClick,
}: {
  asset: AssetItem;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = assetIcon(asset.type);

  return (
    <button
      onClick={onClick}
      className={[
        "group relative flex min-h-[180px] min-w-0 flex-col overflow-hidden rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-cyan-500 bg-cyan-500/[0.06] ring-1 ring-cyan-500/50"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171d]",
      ].join(" ")}
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-cyan-500/70" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>

        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase text-slate-300">
          {asset.type}
        </span>
      </div>

      <p className="mb-2 truncate text-xs font-semibold text-slate-500">
        {asset.category}
      </p>

      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
        {asset.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
        {asset.description}
      </p>

      <div className="mt-auto border-t border-white/5 pt-3 text-xs text-slate-400">
        Uploaded {asset.uploadedAt}
      </div>
    </button>
  );
}

function AssetDetailPanel({ asset }: { asset: AssetItem }) {
  const Icon = assetIcon(asset.type);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="bg-gradient-to-br from-cyan-600/90 to-blue-700/90 p-5">
        <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
          {asset.type}
        </span>

        <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mt-3 break-words text-base font-bold leading-snug text-white">
          {asset.title}
        </h3>

        <p className="mt-1 text-sm text-white/80">{asset.brand}</p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Type" value={asset.type.toUpperCase()} />
          <InfoBox label="Uploaded" value={asset.uploadedAt} />
          <InfoBox label="Category" value={asset.category} className="col-span-2" />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </p>

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
            {asset.description}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </a>

          <a
            href={asset.fileUrl}
            download
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>

        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <p className="text-sm font-semibold text-cyan-200">Asset note</p>
          <p className="mt-1 text-xs leading-relaxed text-cyan-100/70">
            This library is only for downloadable PDFs, documents, and images.
            Finished videos, SFX, and music should stay outside this section.
          </p>
        </div>
      </div>
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
        <FolderOpen className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function assetIcon(type: AssetType) {
  switch (type) {
    case "pdf":
    case "doc":
      return FileText;
    case "image":
      return Image;
    default:
      return FileText;
  }
}