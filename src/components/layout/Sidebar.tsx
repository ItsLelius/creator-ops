import { ChevronDown, LogOut, UserCircle, X } from "lucide-react";
import { useState } from "react";
import type { CurrentUser, PageKey, SidebarItem } from "../../types";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  items: SidebarItem[];
  currentUser: CurrentUser;
  onLogout: () => void;
};

export function Sidebar({
  isOpen,
  onClose,
  activePage,
  onPageChange,
  items,
  currentUser,
  onLogout,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  function handlePageChange(page: PageKey) {
    onPageChange(page);
    setProfileOpen(false);
    onClose();
  }

  function handleLogout() {
    setProfileOpen(false);
    onClose();
    onLogout();
  }

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-40 bg-black/60 transition lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[304px] flex-col border-r border-white/10 bg-[#111318] transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full min-h-0 flex-col p-4">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0D10] text-sm font-black text-white shadow-lg shadow-black/20">
              AS
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-black text-white">
                Adi Studios
              </p>
              <p className="truncate text-xs text-slate-500">Production HQ</p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => handlePageChange(item.key)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition",
                      active
                        ? "bg-gradient-to-r from-blue-500/18 via-violet-500/12 to-transparent text-white"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-4.5 w-4.5 shrink-0 transition",
                        active ? "text-white" : "text-slate-500 group-hover:text-slate-300",
                      ].join(" ")}
                    />

                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>

                    {active && (
                      <span className="h-7 w-1 shrink-0 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-4 border-t border-white/10 pt-4">
            {profileOpen && (
              <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10] p-2 shadow-xl shadow-black/20">
                <button
                  onClick={() => handlePageChange("profile")}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <UserCircle className="h-4 w-4 text-slate-500" />
                  My Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => setProfileOpen((value) => !value)}
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#171A21] p-3 text-left transition hover:bg-[#1E222B]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                {getInitials(currentUser.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs capitalize text-slate-500">
                  {currentUser.role}
                </p>
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
      </aside>
    </>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}