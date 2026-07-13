import { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Menu, Search } from "lucide-react";
import { FolderCard } from "../components/cards/FolderCard";
import { InfoBox } from "../components/cards/InfoBox";
import { ProductionCard } from "../components/cards/ProductionCard";
import { PageHeader } from "../components/common/PageHeader";
import { publishedContent } from "../data/mockData";

type PublishedContentPageProps = {
  onOpenSidebar: () => void;
};

export function PublishedContentPage({
  onOpenSidebar,
}: PublishedContentPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const folders = useMemo(() => {
    const brands = Array.from(
      new Set(publishedContent.map((item) => item.brand)),
    );

    return brands.map((brand) => ({
      brand,
      count: publishedContent.filter((item) => item.brand === brand).length,
    }));
  }, []);

  const selectedItems = publishedContent.filter((item) => {
    const matchesBrand = selectedBrand ? item.brand === selectedBrand : false;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesBrand && matchesSearch;
  });

  const selectedItem =
    selectedItems.find((item) => item.id === selectedContentId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Published Content"
        description="Posted videos and content history."
        onOpenSidebar={onOpenSidebar}
      />

      {!selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-white">Published Folders</h2>
            <p className="mt-1 text-sm text-slate-400">
              Open a page to view posted content.
            </p>
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.brand}
                  title={folder.brand}
                  count={folder.count}
                  label="published items"
                  onClick={() => {
                    setSelectedBrand(folder.brand);
                    setSelectedContentId(null);
                    setSearch("");
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedBrand && (
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
          <button
            onClick={() => {
              setSelectedBrand(null);
              setSelectedContentId(null);
              setSearch("");
            }}
            className="mb-3 flex w-fit items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to folders
          </button>

          <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[3fr_2fr]">
            <div className="flex min-h-0 flex-col">
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-500" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSelectedContentId(null);
                  }}
                  placeholder="Search published content..."
                  className="w-full bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                  {selectedItems.map((item) => (
                    <ProductionCard
                      key={item.id}
                      title={item.title}
                      subtitle={item.brand}
                      status="posted"
                      statusText="Posted"
                      platform={item.platform}
                      due={item.postedDate}
                      selected={selectedContentId === item.id}
                      onClick={() => setSelectedContentId(item.id)}
                    />
                  ))}
                </div>

                {selectedItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-10 text-center">
                    <p className="font-semibold text-white">
                      No published content found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search keyword.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#0B0D10] p-5">
              {!selectedItem ? (
                <div className="flex min-h-[320px] flex-1 items-center justify-center text-center">
                  <div>
                    <p className="font-semibold text-white">
                      Select published content
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Post details will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
                  <h3 className="break-words text-lg font-bold text-white">
                    {selectedItem.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedItem.brand}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoBox label="Platform" value={selectedItem.platform} />
                    <InfoBox label="Posted" value={selectedItem.postedDate} />
                    <InfoBox
                      label="Posted By"
                      value={selectedItem.postedBy}
                      className="col-span-2"
                    />
                  </div>

                  <div className="mt-4 rounded-lg border border-white/10 bg-[#111318] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Caption & Hashtags
                    </p>

                    <div className="scroll-panel max-h-[220px] overflow-y-auto pr-1">
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
                        {selectedItem.caption}
                      </p>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-blue-300">
                        {selectedItem.hashtags}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <a
                      href={selectedItem.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Post
                    </a>

                    <a
                      href={selectedItem.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Drive
                    </a>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}