import type { LucideIcon } from "lucide-react";
import { Menu, Sparkles } from "lucide-react";

type HeaderPillAccent =
  | "blue"
  | "emerald"
  | "violet"
  | "amber"
  | "cyan"
  | "pink"
  | "orange"
  | "green"
  | "slate";

type HeaderPillData = {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accent: HeaderPillAccent;
};

type PageHeaderAccent =
  | "blue"
  | "violet"
  | "emerald"
  | "green"
  | "amber"
  | "cyan"
  | "pink"
  | "orange";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description: string;
  onOpenSidebar: () => void;
  pills?: HeaderPillData[];
  accent?: PageHeaderAccent;
};

export function PageHeader({
  title,
  eyebrow,
  description,
  onOpenSidebar,
  pills = [],
  accent = "blue",
}: PageHeaderProps) {
  const headerStyle = pageHeaderStyles[accent];

  return (
    <header className="relative mb-6 overflow-hidden rounded-2xl border border-white/5 bg-[#111318] p-5 sm:p-6">
      <div
        className={[
          "pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full blur-3xl",
          headerStyle.primaryGlow,
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full blur-3xl",
          headerStyle.secondaryGlow,
        ].join(" ")}
      />

      <div className="relative flex items-start gap-3">
        <button
          onClick={onOpenSidebar}
          className="mt-0.5 shrink-0 rounded-xl border border-white/5 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <Sparkles className={["h-3.5 w-3.5", headerStyle.sparkle].join(" ")} />
              {eyebrow}
            </div>
          )}

          <h1
            className={[
              "mt-1 bg-gradient-to-r bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl",
              headerStyle.titleGradient,
            ].join(" ")}
          >
            {title}
          </h1>

          <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
        </div>

        {pills.length > 0 && (
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            {pills.map((pill) => (
              <HeaderPill key={pill.label} {...pill} />
            ))}
          </div>
        )}
      </div>

      <div className="relative mt-5 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={[
            "h-full w-full rounded-full bg-gradient-to-r",
            headerStyle.lineGradient,
          ].join(" ")}
        />
      </div>
    </header>
  );
}

function HeaderPill({
  icon: Icon,
  value,
  label,
  accent,
}: HeaderPillData) {
  const style = pillStyles[accent];

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

const pageHeaderStyles: Record<
  PageHeaderAccent,
  {
    primaryGlow: string;
    secondaryGlow: string;
    sparkle: string;
    titleGradient: string;
    lineGradient: string;
  }
> = {
  blue: {
    primaryGlow: "bg-blue-500/15",
    secondaryGlow: "bg-violet-500/10",
    sparkle: "text-blue-300",
    titleGradient: "from-white to-blue-200",
    lineGradient: "from-blue-500 via-violet-500 to-transparent",
  },
  violet: {
    primaryGlow: "bg-violet-500/15",
    secondaryGlow: "bg-blue-500/10",
    sparkle: "text-violet-300",
    titleGradient: "from-white to-violet-200",
    lineGradient: "from-violet-500 via-blue-500 to-transparent",
  },
  emerald: {
    primaryGlow: "bg-emerald-500/15",
    secondaryGlow: "bg-green-500/10",
    sparkle: "text-emerald-300",
    titleGradient: "from-white to-emerald-200",
    lineGradient: "from-emerald-500 via-green-500 to-transparent",
  },
  green: {
    primaryGlow: "bg-green-500/15",
    secondaryGlow: "bg-emerald-500/10",
    sparkle: "text-green-300",
    titleGradient: "from-white to-green-200",
    lineGradient: "from-green-500 via-emerald-500 to-transparent",
  },
  amber: {
    primaryGlow: "bg-amber-500/15",
    secondaryGlow: "bg-orange-500/10",
    sparkle: "text-amber-300",
    titleGradient: "from-white to-amber-200",
    lineGradient: "from-amber-500 via-orange-500 to-transparent",
  },
  cyan: {
    primaryGlow: "bg-cyan-500/15",
    secondaryGlow: "bg-blue-500/10",
    sparkle: "text-cyan-300",
    titleGradient: "from-white to-cyan-200",
    lineGradient: "from-cyan-500 via-blue-500 to-transparent",
  },
  pink: {
    primaryGlow: "bg-pink-500/15",
    secondaryGlow: "bg-violet-500/10",
    sparkle: "text-pink-300",
    titleGradient: "from-white to-pink-200",
    lineGradient: "from-pink-500 via-violet-500 to-transparent",
  },
  orange: {
    primaryGlow: "bg-orange-500/15",
    secondaryGlow: "bg-amber-500/10",
    sparkle: "text-orange-300",
    titleGradient: "from-white to-orange-200",
    lineGradient: "from-orange-500 via-amber-500 to-transparent",
  },
};

const pillStyles: Record<
  HeaderPillAccent,
  {
    wrap: string;
    icon: string;
  }
> = {
  blue: {
    wrap: "border-blue-500/20 bg-blue-500/10",
    icon: "text-blue-300",
  },
  emerald: {
    wrap: "border-emerald-500/20 bg-emerald-500/10",
    icon: "text-emerald-300",
  },
  violet: {
    wrap: "border-violet-500/20 bg-violet-500/10",
    icon: "text-violet-300",
  },
  amber: {
    wrap: "border-amber-500/20 bg-amber-500/10",
    icon: "text-amber-300",
  },
  cyan: {
    wrap: "border-cyan-500/20 bg-cyan-500/10",
    icon: "text-cyan-300",
  },
  pink: {
    wrap: "border-pink-500/20 bg-pink-500/10",
    icon: "text-pink-300",
  },
  orange: {
    wrap: "border-orange-500/20 bg-orange-500/10",
    icon: "text-orange-300",
  },
  green: {
    wrap: "border-green-500/20 bg-green-500/10",
    icon: "text-green-300",
  },
  slate: {
    wrap: "border-white/10 bg-white/5",
    icon: "text-slate-300",
  },
};