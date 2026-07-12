import { NavLink } from "react-router-dom";
import type { SidebarItem } from "../../types/navigation";

type SidebarProps = {
  items: SidebarItem[];
};

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-950/80 p-5 md:block">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Adi Studios
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Production Dashboard
        </p>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}