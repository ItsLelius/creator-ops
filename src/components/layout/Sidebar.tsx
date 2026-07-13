import { useState } from "react";
import { ChevronDown, LogOut, PanelLeftClose, User, X } from "lucide-react";
import { mainSidebarItems } from "../../constants/sidebar";
import type { PageKey } from "../../types";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
};

export function Sidebar({
  isOpen,
  onClose,
  activePage,
  onPageChange,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  function handlePageChange(page: PageKey) {
    onPageChange(page);
    onClose();
  }

  const sidebarBody = (
    <div className="flex h-full w-full flex-col px-4 py-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D10]">
            <span className="text-sm font-black text-white">AS</span>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-white">
              Adi Studios
            </h1>
            <p className="truncate text-xs text-slate-500">Production HQ</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>

        <button
          className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white lg:block"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Admin navigation">
        {mainSidebarItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handlePageChange(item.key)}
              className={[
                "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/5 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              {active && (
                <>
                  <span className="absolute right-0 h-8 w-1 rounded-l-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.9)]" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-transparent" />
                </>
              )}

              <Icon className="relative z-10 h-4 w-4 shrink-0" />
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative border-t border-white/5 pt-4">
        {profileOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-white/5 bg-[#171A21] p-2 shadow-2xl shadow-black/40">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
              <User className="h-4 w-4" />
              My Profile
            </button>

            <button
              onClick={() => alert("Logout clicked")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}

        <button
          onClick={() => setProfileOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-[#171A21] p-3 transition hover:bg-[#1E222B]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              A
            </div>

            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-white">Adi</p>
              <p className="truncate text-xs text-slate-500">Admin</p>
            </div>
          </div>

          <ChevronDown
            className={[
              "h-4 w-4 shrink-0 text-slate-500 transition",
              profileOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-[280px] shrink-0 border-r border-white/5 bg-[#111318] lg:flex">
        {sidebarBody}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close sidebar overlay"
            onClick={onClose}
            className="absolute inset-0 bg-black/60"
          />

          <aside className="absolute left-0 top-0 h-screen w-[280px] max-w-[85vw] border-r border-white/5 bg-[#111318] shadow-2xl">
            {sidebarBody}
          </aside>
        </div>
      )}
    </>
  );
}