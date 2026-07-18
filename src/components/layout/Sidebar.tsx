import { LogOut, X } from "lucide-react";
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
  function handlePageChange(page: PageKey) {
    onPageChange(page);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#111318] text-slate-300 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="relative flex h-[96px] w-full shrink-0 items-center border-b border-white/10 px-5">
            <p className="block w-full bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-[34px] font-black leading-none tracking-[-0.065em] text-transparent drop-shadow-[0_0_24px_rgba(255,255,255,0.08)]">
              ADI Studios
            </p>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="scroll-panel min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePageChange(item.key)}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm font-bold transition duration-200",
                      active
                        ? "border-white/12 bg-[#1A1D24] text-white shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.045)]"
                        : "border-transparent text-slate-500 hover:border-white/10 hover:bg-[#171A20] hover:text-slate-100 hover:shadow-[0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.035)]",
                    ].join(" ")}
                  >
                    {active && (
                      <span className="absolute right-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-white/60 shadow-[0_0_16px_rgba(255,255,255,0.16)]" />
                    )}

                    <Icon
                      className={[
                        "h-4 w-4 shrink-0 transition",
                        active
                          ? "text-slate-100"
                          : "text-slate-600 group-hover:text-slate-300",
                      ].join(" ")}
                    />

                    <span className="min-w-0 truncate pr-3">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="shrink-0 border-t border-white/10 p-3">
            <div className="rounded-xl border border-white/10 bg-[#0B0D10] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#1A1D24] text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">
                    {currentUser.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs font-medium capitalize text-slate-500">
                    {currentUser.role === "admin" ? "Admin" : "Member"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-black text-slate-400 transition hover:bg-[#171A20] hover:text-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}