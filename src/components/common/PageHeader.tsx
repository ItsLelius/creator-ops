import type { LucideIcon } from "lucide-react";
import { Menu } from "lucide-react";

type HeaderAccent = "blue" | "violet" | "emerald" | "amber" | "cyan" | "orange" | "red";

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
    header: string;
    orbOne: string;
    orbTwo: string;
    pill: string;
    icon: string;
  }
> = {
  blue: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(37,99,235,0.26),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(6,182,212,0.13),transparent_36%),linear-gradient(135deg,#10141C,#111318_58%,#0B0D10)]",
    orbOne: "bg-blue-500/25",
    orbTwo: "bg-cyan-400/15",
    pill: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    icon: "text-blue-300",
  },

  violet: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(124,58,237,0.28),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(59,130,246,0.12),transparent_36%),linear-gradient(135deg,#11111B,#111318_58%,#0B0D10)]",
    orbOne: "bg-violet-500/25",
    orbTwo: "bg-blue-400/12",
    pill: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    icon: "text-violet-300",
  },

  emerald: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(20,184,166,0.12),transparent_36%),linear-gradient(135deg,#0E1714,#111318_58%,#0B0D10)]",
    orbOne: "bg-emerald-500/23",
    orbTwo: "bg-teal-400/12",
    pill: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    icon: "text-emerald-300",
  },

  amber: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(245,158,11,0.24),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(251,191,36,0.11),transparent_36%),linear-gradient(135deg,#18130B,#111318_58%,#0B0D10)]",
    orbOne: "bg-amber-500/22",
    orbTwo: "bg-yellow-400/10",
    pill: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    icon: "text-amber-300",
  },

  cyan: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(6,182,212,0.26),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(59,130,246,0.13),transparent_36%),linear-gradient(135deg,#0B171A,#111318_58%,#0B0D10)]",
    orbOne: "bg-cyan-500/25",
    orbTwo: "bg-blue-400/13",
    pill: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    icon: "text-cyan-300",
  },

  orange: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(249,115,22,0.24),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(251,146,60,0.10),transparent_36%),linear-gradient(135deg,#1A100B,#111318_58%,#0B0D10)]",
    orbOne: "bg-orange-500/22",
    orbTwo: "bg-amber-400/10",
    pill: "border-orange-500/20 bg-orange-500/10 text-orange-300",
    icon: "text-orange-300",
  },

  red: {
    header:
      "bg-[radial-gradient(circle_at_0%_45%,rgba(244,63,94,0.22),transparent_34%),radial-gradient(circle_at_72%_0%,rgba(239,68,68,0.10),transparent_36%),linear-gradient(135deg,#1A0D10,#111318_58%,#0B0D10)]",
    orbOne: "bg-red-500/20",
    orbTwo: "bg-rose-400/10",
    pill: "border-red-500/20 bg-red-500/10 text-red-300",
    icon: "text-red-300",
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
    <header
      className={[
        "relative mb-6 rounded-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.28)]",
        activeAccent.header,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(90deg,rgba(255,255,255,0.045),transparent_30%,rgba(255,255,255,0.018))]" />

      <div
        className={[
          "pointer-events-none absolute -left-20 bottom-0 h-44 w-60 rounded-full blur-[78px]",
          activeAccent.orbOne,
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute right-20 top-0 h-32 w-44 rounded-full blur-[80px]",
          activeAccent.orbTwo,
        ].join(" ")}
      />

      <div className="relative grid min-h-[160px] grid-cols-[minmax(0,1fr)_auto] gap-10 px-8 py-7">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>

          <h1 className="max-w-[660px] break-words pb-3 text-[44px] font-black leading-[1.24] tracking-[-0.055em] text-white">
            {title}
          </h1>

          <p className="max-w-[680px] text-[15px] font-medium leading-7 text-slate-400">
            {description}
          </p>
        </div>

        {pills.length > 0 && (
          <div className="flex min-w-[420px] shrink-0 items-start justify-end gap-3">
            {pills.map((pill) => (
              <HeaderPill key={`${pill.label}-${pill.value}`} pill={pill} />
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function HeaderPill({ pill }: { pill: HeaderPill }) {
  const Icon = pill.icon;
  const accent = accentStyles[pill.accent ?? "blue"];

  return (
    <div
      className={[
        "min-w-[132px] rounded-xl border px-4 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.20)] backdrop-blur-sm",
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