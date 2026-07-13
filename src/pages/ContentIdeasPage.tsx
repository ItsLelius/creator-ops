import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FolderOpen,
  Lightbulb,
  Plus,
  Search,
} from "lucide-react";
import { FolderCard } from "../components/cards/FolderCard";
import { InfoBox } from "../components/cards/InfoBox";
import { ProductionCard } from "../components/cards/ProductionCard";
import { PageHeader } from "../components/common/PageHeader";
import { SmoothSelect } from "../components/common/SmoothSelect";
import { contentIdeas } from "../data/mockData";
import type { ContentIdea } from "../types";

type ContentIdeasPageProps = {
  onOpenSidebar: () => void;
};

export function ContentIdeasPage({ onOpenSidebar }: ContentIdeasPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const folders = useMemo(() => {
    const brands = Array.from(new Set(contentIdeas.map((idea) => idea.brand)));

    return brands.map((brand) => ({
      brand,
      count: contentIdeas.filter((idea) => idea.brand === brand).length,
    }));
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(contentIdeas.map((idea) => idea.category)));
  }, []);

  const selectedBrandIdeas = useMemo(() => {
    return contentIdeas.filter((idea) => {
      const matchesBrand = selectedBrand ? idea.brand === selectedBrand : false;

      const matchesSearch = idea.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || idea.category === categoryFilter;

      return matchesBrand && matchesSearch && matchesCategory;
    });
  }, [selectedBrand, search, categoryFilter]);

  const selectedIdea =
    selectedBrandIdeas.find((idea) => idea.id === selectedIdeaId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Content Ideas"
        description="Raw content ideas, references, and future task concepts."
        onOpenSidebar={onOpenSidebar}
        pills={[
          {
            icon: Lightbulb,
            value: contentIdeas.length,
            label: "Saved ideas",
            accent: "violet",
          },
          {
            icon: FolderOpen,
            value: folders.length,
            label: "Page folders",
            accent: "blue",
          },
        ]}
      />

      {!selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Idea Folders</h2>
              <p className="mt-1 text-sm text-slate-400">
                Open a page to view saved content ideas.
              </p>
            </div>

            <button className="hidden items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 sm:flex">
              <Plus className="h-4 w-4" />
              New Idea
            </button>
          </div>

          {folders.length === 0 ? (
            <EmptyState
              title="No ideas yet"
              description="Save your first content idea or reference."
            />
          ) : (
            <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.brand}
                    title={folder.brand}
                    count={folder.count}
                    label="saved ideas"
                    onClick={() => {
                      setSelectedBrand(folder.brand);
                      setSelectedIdeaId(null);
                      setSearch("");
                      setCategoryFilter("all");
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
                  setSelectedIdeaId(null);
                  setSearch("");
                  setCategoryFilter("all");
                }}
                className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to idea folders
              </button>

              <h2 className="truncate text-xl font-bold text-white">
                {selectedBrand} Ideas
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {selectedBrandIdeas.length} idea
                {selectedBrandIdeas.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <button className="flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400">
              <Plus className="h-4 w-4" />
              New Idea
            </button>
          </div>

          <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[3fr_2fr]">
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="mb-4 grid gap-3 md:grid-cols-[1fr_240px]">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-slate-500" />

                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setSelectedIdeaId(null);
                    }}
                    placeholder="Search ideas..."
                    className="w-full min-w-0 bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
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

              <div className="scroll-panel min-h-0 min-w-0 flex-1 overflow-y-auto pr-1">
                {selectedBrandIdeas.length === 0 ? (
                  <EmptyState
                    title="No ideas found"
                    description="Try changing your search or category filter."
                  />
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    {selectedBrandIdeas.map((idea) => (
                      <ProductionCard
                        key={idea.id}
                        title={idea.title}
                        subtitle={idea.brand}
                        status="to_generate"
                        statusText="Idea"
                        detail={idea.hook}
                        due={idea.createdAt}
                        platform={idea.category}
                        selected={selectedIdeaId === idea.id}
                        onClick={() => setSelectedIdeaId(idea.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
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
                <IdeaDetailPanel idea={selectedIdea} />
              )}
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}

function IdeaDetailPanel({ idea }: { idea: ContentIdea }) {
  function handleCopyIdea() {
    navigator.clipboard.writeText(
      `${idea.title}\n\nHook:\n${idea.hook}\n\nNotes:\n${idea.notes}`,
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="bg-gradient-to-br from-violet-600/90 to-blue-700/90 p-5">
        <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
          Idea
        </span>

        <h3 className="mt-3 break-words text-base font-bold leading-snug text-white">
          {idea.title}
        </h3>

        <p className="mt-1 text-sm text-white/80">{idea.brand}</p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <InfoBox label="Category" value={idea.category} />
          <InfoBox label="Saved" value={idea.createdAt} />
          <InfoBox label="Source" value={idea.sourceName} className="col-span-2" />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Hook / Concept
          </p>

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
            {idea.hook}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-[#111318] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </p>

          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
            {idea.notes}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={idea.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
          >
            <ExternalLink className="h-4 w-4" />
            Source
          </a>

          <button
            onClick={handleCopyIdea}
            className="flex items-center justify-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        </div>

        <button
          onClick={() => alert("Later this will create a real task.")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Convert to Task
        </button>
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
        <Lightbulb className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}