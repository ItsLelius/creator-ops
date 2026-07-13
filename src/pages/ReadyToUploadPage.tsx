import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FolderOpen,
  Search,
  Upload,
} from "lucide-react";
import { FolderCard } from "../components/cards/FolderCard";
import { InfoBox } from "../components/cards/InfoBox";
import { ProductionCard } from "../components/cards/ProductionCard";
import { PageHeader } from "../components/common/PageHeader";
import { tasks, uploadDetailsByTaskId } from "../data/mockData";

type ReadyToUploadPageProps = {
  onOpenSidebar: () => void;
};

export function ReadyToUploadPage({ onOpenSidebar }: ReadyToUploadPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const readyTasks = useMemo(() => {
    return tasks.filter((task) => task.status === "ready_to_upload");
  }, []);

  const pageFolders = useMemo(() => {
    const brands = Array.from(new Set(readyTasks.map((task) => task.brand)));

    return brands.map((brand) => ({
      brand,
      readyCount: readyTasks.filter((task) => task.brand === brand).length,
    }));
  }, [readyTasks]);

  const selectedBrandTasks = useMemo(() => {
    return readyTasks.filter((task) => {
      const matchesBrand = selectedBrand ? task.brand === selectedBrand : false;
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesBrand && matchesSearch;
    });
  }, [readyTasks, selectedBrand, search]);

  const selectedTask =
    selectedBrandTasks.find((task) => task.id === selectedTaskId) ?? null;

  const selectedDetails = selectedTask
    ? uploadDetailsByTaskId[selectedTask.id] ?? {
        caption: "Caption not added yet.",
        driveUrl: "#",
        platform: "Facebook Reels",
        schedule: selectedTask.due,
        hashtags: "No hashtags added yet.",
        notes: "No upload notes yet.",
      }
    : null;

  function handleCopyCaptionAndTags() {
    if (!selectedDetails) return;

    navigator.clipboard.writeText(
      `${selectedDetails.caption}\n\n${selectedDetails.hashtags}`,
    );

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Ready to Upload"
        description="Approved content waiting to be posted."
        onOpenSidebar={onOpenSidebar}
        pills={[
          {
            icon: Upload,
            value: readyTasks.length,
            label: "Ready items",
            accent: "emerald",
          },
          {
            icon: FolderOpen,
            value: pageFolders.length,
            label: "Page folders",
            accent: "blue",
          },
        ]}
      />

      {!selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Page Folders</h2>
            <p className="mt-1 text-sm text-slate-400">
              Open a page to view ready-to-upload content.
            </p>
          </div>

          {pageFolders.length === 0 ? (
            <EmptyState
              title="No ready content yet"
              description="Approved tasks will appear here before posting."
            />
          ) : (
            <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {pageFolders.map((folder) => (
                  <FolderCard
                    key={folder.brand}
                    title={folder.brand}
                    count={folder.readyCount}
                    label="ready to upload"
                    onClick={() => {
                      setSelectedBrand(folder.brand);
                      setSelectedTaskId(null);
                      setSearch("");
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
                  setSelectedTaskId(null);
                  setSearch("");
                }}
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to page folders
              </button>

              <h2 className="truncate text-xl font-bold text-white">
                {selectedBrand}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {selectedBrandTasks.length} ready item
                {selectedBrandTasks.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[3fr_2fr]">
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="mb-4 flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-slate-500" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSelectedTaskId(null);
                  }}
                  placeholder="Search ready content..."
                  className="w-full min-w-0 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="scroll-panel min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
                {selectedBrandTasks.length === 0 ? (
                  <EmptyState
                    title="No ready content found"
                    description="Try changing your search keyword."
                  />
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    {selectedBrandTasks.map((task) => (
                      <ProductionCard
                        key={task.id}
                        title={task.title}
                        subtitle={task.brand}
                        status="ready_to_upload"
                        statusText="Ready"
                        assignee={task.assignee}
                        due={task.due}
                        detail={task.detail}
                        selected={selectedTaskId === task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
              {!selectedTask || !selectedDetails ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-10 w-10 text-slate-600" />
                    <p className="mt-3 font-semibold text-white">
                      Select a content box
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Full upload information will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <UploadDetailPanel
                  title={selectedTask.title}
                  brand={selectedTask.brand}
                  assignee={selectedTask.assignee}
                  platform={selectedDetails.platform}
                  schedule={selectedDetails.schedule}
                  caption={selectedDetails.caption}
                  hashtags={selectedDetails.hashtags}
                  notes={selectedDetails.notes}
                  driveUrl={selectedDetails.driveUrl}
                  copied={copied}
                  onCopy={handleCopyCaptionAndTags}
                />
              )}
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

function UploadDetailPanel({
  title,
  brand,
  assignee,
  platform,
  schedule,
  caption,
  hashtags,
  notes,
  driveUrl,
  copied,
  onCopy,
}: {
  title: string;
  brand: string;
  assignee: string;
  platform: string;
  schedule: string;
  caption: string;
  hashtags: string;
  notes: string;
  driveUrl: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="bg-gradient-to-br from-emerald-600/90 to-emerald-700/90 p-5">
        <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
          Ready
        </span>

        <h3 className="mt-3 break-words text-base font-bold leading-snug text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-white/80">{brand}</p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Platform" value={platform} />
          <InfoBox label="Schedule" value={schedule} />
          <InfoBox label="Assigned To" value={assignee} className="col-span-2" />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Caption & Hashtags
            </p>

            <button
              onClick={onCopy}
              title="Copy caption and hashtags"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="scroll-panel max-h-[220px] overflow-y-auto pr-1">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
              {caption}
            </p>

            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-blue-300">
              {hashtags}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
            {notes}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
          >
            <ExternalLink className="h-4 w-4" />
            Drive
          </a>

          <button
            onClick={() => alert("Later this will move to Published Content.")}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
          >
            <Upload className="h-4 w-4" />
            Mark Posted
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <p className="text-sm font-semibold text-amber-200">
                Posting reminder
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-100/70">
                After uploading this Reel, click Mark Posted so it disappears
                from Ready to Upload and appears in Published Content.
              </p>
            </div>
          </div>
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
        <CheckCircle2 className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}