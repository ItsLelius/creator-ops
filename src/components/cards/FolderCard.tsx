import { FolderOpen } from "lucide-react";

type FolderCardProps = {
  title: string;
  count: number;
  label: string;
  onClick: () => void;
};

export function FolderCard({ title, count, label, onClick }: FolderCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-[170px] min-w-0 flex-col rounded-xl border border-white/10 bg-[#0B0D10] p-5 text-left transition hover:border-blue-500/40 hover:bg-[#171A21]"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
        <FolderOpen className="h-6 w-6 text-white" />
      </div>

      <h3 className="truncate text-lg font-bold text-white">{title}</h3>

      <p className="mt-2 text-sm text-slate-400">
        {count} {label}
      </p>

      <span className="mt-auto text-sm font-semibold text-blue-400">
        Open →
      </span>
    </button>
  );
}