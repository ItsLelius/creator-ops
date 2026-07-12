import type { Employee } from "../../types";

export function EmployeeRow({ employee }: { employee: Employee }) {
  const isOnline = employee.status === "Online";

  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#171A21] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold">
          {employee.name[0]}

          <span
            className={[
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#171A21]",
              isOnline ? "bg-emerald-400" : "bg-slate-500",
            ].join(" ")}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {employee.name}
          </p>
          <p className="truncate text-xs text-slate-500">{employee.role}</p>
        </div>
      </div>

      <p
        className={[
          "shrink-0 text-xs font-medium",
          isOnline ? "text-emerald-400" : "text-slate-500",
        ].join(" ")}
      >
        {isOnline ? "Online" : employee.lastSeen}
      </p>
    </div>
  );
}