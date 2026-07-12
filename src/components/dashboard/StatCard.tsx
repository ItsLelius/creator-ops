import type { ReactNode } from "react";
import type { StatAccent } from "../../types";

type StatCardProps = {
  title: string;
  value: string | number;
  label: string;
  icon: ReactNode;
  accent: StatAccent;
};

export function StatCard({
  title,
  value,
  label,
  icon,
  accent,
}: StatCardProps) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-300",
    amber: "bg-amber-500/10 text-amber-300",
    red: "bg-red-500/10 text-red-300",
    violet: "bg-violet-500/10 text-violet-300",
    slate: "bg-white/5 text-slate-300",
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#111318] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            {value}
          </h3>
        </div>

        <div className={["shrink-0 rounded-2xl p-3", colors[accent]].join(" ")}>
          {icon}
        </div>
      </div>

      <p className="mt-4 truncate text-sm text-slate-500">{label}</p>
    </div>
  );
}