import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";

type HeaderAccent = "blue" | "violet" | "emerald" | "amber" | "cyan" | "orange";

type HeaderPill = {
  icon: LucideIcon;
  value: number | string;
  label: string;
  accent?: HeaderAccent;
};

type PageHeaderProps = {
  title: string;
  description: string;
  onOpenSidebar: () => void;
  accent?: HeaderAccent;
  pills?: HeaderPill[];
};

const accentStyles: Record<
  HeaderAccent,
  {
    glow: string;
    line: string;
    pill: string;
    icon: string;
  }
> = {
  blue: {
    glow: "from-blue-500/10 via-blue-500/[0.03] to-transparent",
    line: "from-cyan-400 via-blue-500 to-blue-500",
    pill: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    icon: "text-blue-300",
  },
  violet: {
    glow: "from-violet-500/10 via-violet-500/[0.03] to-transparent",
    line: "from-violet-400 via-violet-500 to-blue-500",
    pill: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    icon: "text-violet-300",
  },
  emerald: {
    glow: "from-emerald-500/10 via-emerald-500/[0.03] to-transparent",
    line: "from-emerald-400 via-emerald-500 to-blue-500",
    pill: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    icon: "text-emerald-300",
  },
  amber: {
    glow: "from-amber-500/10 via-amber-500/[0.03] to-transparent",
    line: "from-amber-400 via-amber-500 to-blue-500",
    pill: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    icon: "text-amber-300",
  },
  cyan: {
    glow: "from-cyan-500/10 via-cyan-500/[0.03] to-transparent",
    line: "from-cyan-400 via-blue-500 to-blue-500",
    pill: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    icon: "text-cyan-300",
  },
  orange: {
    glow: "from-orange-500/10 via-orange-500/[0.03] to-transparent",
    line: "from-orange-400 via-orange-500 to-blue-500",
    pill: "border-orange-500/20 bg-orange-500/10 text-orange-300",
    icon: "text-orange-300",
  },
};

export function PageHeader({
  title,
  description,
  onOpenSidebar,
  accent = "blue",
  pills = [],
}: PageHeaderProps) {
  const activeAccent = accentStyles[accent];

  return (
    <header className="mb-6 rounded-xl border border-white/10 bg-[#111318] shadow-[0_16px_40px_rgba(0,0,0,0.22)]">
      <div
        className={[
          "relative flex min-h-[150px] flex-col gap-5 bg-gradient-to-r px-6 py-6 xl:flex-row xl:items-start xl:justify-between",
          activeAccent.glow,
        ].join(" ")}
      >
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>

          <h1 className="max-w-4xl break-words pb-1 text-[44px] font-black leading-[1.12] tracking-[-0.055em] text-white sm:text-[52px]">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-slate-500">
            {description}
          </p>
        </div>

        {pills.length > 0 && (
          <div className="grid shrink-0 grid-cols-2 gap-3 2xl:grid-cols-4">
            {pills.map((pill) => (
              <HeaderPill key={`${pill.label}-${pill.value}`} pill={pill} />
            ))}
          </div>
        )}
      </div>

      <div
        className={["h-1 w-full rounded-b-xl bg-gradient-to-r", activeAccent.line].join(
          " ",
        )}
      />
    </header>
  );
}

function HeaderPill({ pill }: { pill: HeaderPill }) {
  const Icon = pill.icon;
  const accent = accentStyles[pill.accent ?? "blue"];

  return (
    <div
      className={[
        "min-w-[132px] rounded-xl border px-4 py-3",
        accent.pill,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20">
          <Icon className={["h-4 w-4", accent.icon].join(" ")} />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-black leading-none text-white">
            {pill.value}
          </p>

          <p className="mt-1 truncate text-xs font-semibold opacity-80">
            {pill.label}
          </p>
        </div>
      </div>
    </div>
  );
}