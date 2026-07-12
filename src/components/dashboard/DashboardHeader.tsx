import type { LucideIcon } from "lucide-react";
import { Clock, Menu, Sparkles, Users } from "lucide-react";

type DashboardHeaderProps = {
  onOpenSidebar: () => void;
  dueToday: number;
  onlineCount: number;
};

export function DashboardHeader({
  onOpenSidebar,
  dueToday,
  onlineCount,
}: DashboardHeaderProps) {
  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl border border-white/5 bg-[#111318] p-5 sm:p-6">
      <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex items-start gap-3">
        <button
          onClick={onOpenSidebar}
          className="mt-0.5 shrink-0 rounded-xl border border-white/5 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Welcome back, Adi
          </div>

          <h1 className="mt-1 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Here&apos;s what&apos;s happening inside Adi Studios today.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <HeaderPill
            icon={Clock}
            value={dueToday}
            label="Due today"
            accent="blue"
          />

          <HeaderPill
            icon={Users}
            value={onlineCount}
            label="Online now"
            accent="emerald"
          />
        </div>
      </div>

      <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-transparent" />
      </div>
    </header>
  );
}

function HeaderPill({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  accent: "blue" | "emerald";
}) {
  const styles = {
    blue: {
      wrap: "border-blue-500/20 bg-blue-500/10",
      icon: "text-blue-300",
    },
    emerald: {
      wrap: "border-emerald-500/20 bg-emerald-500/10",
      icon: "text-emerald-300",
    },
  };

  const style = styles[accent];

  return (
    <div
      className={[
        "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition hover:bg-white/[0.03]",
        style.wrap,
      ].join(" ")}
    >
      <div
        className={[
          "flex h-8 w-8 items-center justify-center rounded-lg bg-white/5",
          style.icon,
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="leading-tight">
        <p className="text-base font-bold text-white">{value}</p>
        <p className="text-[11px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}