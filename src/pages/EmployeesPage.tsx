import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import {
  createEmployee,
  removeEmployee,
  setEmployeeAccess,
  updateEmployee,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "../services/employeeService";
import type { Employee, Task, TaskStatus } from "../types";

type EmployeesPageProps = {
  onOpenSidebar: () => void;
};

type ProfileStatus = "active" | "disabled";

type ProfileRow = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "employee";
  status: ProfileStatus;
  created_at: string;
};

type EmployeeView = Employee & {
  email: string;
  accessStatus: ProfileStatus;
  createdAt: string;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
};

type EmployeeFormModalProps =
  | {
      mode: "create";
      onClose: () => void;
      onSubmit: (input: CreateEmployeeInput) => Promise<void>;
    }
  | {
      mode: "edit";
      employee: EmployeeView;
      onClose: () => void;
      onSubmit: (input: UpdateEmployeeInput) => Promise<void>;
    };

const openTaskStatuses: TaskStatus[] = [
  "to_generate",
  "in_progress",
  "submitted",
  "needs_revision",
  "approved",
  "ready_to_upload",
];

const tasks: Task[] = [];

export function EmployeesPage({ onOpenSidebar }: EmployeesPageProps) {
  const { currentUser } = useAuth();

  const [employeeList, setEmployeeList] = useState<EmployeeView[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeView | null>(
    null,
  );
  const [busyEmployeeId, setBusyEmployeeId] = useState("");

  async function loadEmployees() {
    try {
      setLoadingEmployees(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, name, role, status, created_at")
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const rows = (data ?? []) as ProfileRow[];

      const mappedEmployees = rows.map((profile) =>
        mapProfileToEmployee(profile, currentUser?.id ?? ""),
      );

      setEmployeeList(mappedEmployees);

      setSelectedEmployeeId((currentSelectedId) => {
        if (
          currentSelectedId &&
          mappedEmployees.some((member) => member.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return mappedEmployees[0]?.id ?? "";
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load team members.";

      setLoadError(message);
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
  }, [currentUser?.id]);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return employeeList;
    }

    return employeeList.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        displayRole(member.role).toLowerCase().includes(query) ||
        member.status.toLowerCase().includes(query) ||
        member.accessStatus.toLowerCase().includes(query)
      );
    });
  }, [employeeList, search]);

  const selectedEmployee =
    employeeList.find((member) => member.id === selectedEmployeeId) ??
    filteredEmployees[0] ??
    employeeList[0] ??
    null;

  const activeCount = employeeList.filter(
    (member) => member.accessStatus === "active",
  ).length;

  const disabledCount = employeeList.filter(
    (member) => member.accessStatus === "disabled",
  ).length;

  const openTasksCount = tasks.filter((task) =>
    openTaskStatuses.includes(task.status),
  ).length;

  const submittedCount = tasks.filter(
    (task) => task.status === "submitted",
  ).length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  async function handleCreateEmployee(input: CreateEmployeeInput) {
    const created = await createEmployee(input);

    showNotice(`${created.name} was added successfully.`);
    setCreateModalOpen(false);
    setSelectedEmployeeId(created.id);

    await loadEmployees();
  }

  async function handleUpdateEmployee(input: UpdateEmployeeInput) {
    const updated = await updateEmployee(input);

    showNotice(`${updated.name} was updated successfully.`);
    setEditingEmployee(null);
    setSelectedEmployeeId(updated.id);

    await loadEmployees();
  }

  async function handleSetAccess(member: EmployeeView, status: ProfileStatus) {
    if (member.role === "Admin") {
      showNotice("Admin accounts cannot be changed from this page.", "error");
      return;
    }

    const confirmed = window.confirm(
      status === "disabled"
        ? `Disable access for ${member.name}?`
        : `Reactivate access for ${member.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyEmployeeId(member.id);

      const updated = await setEmployeeAccess(member.id, status);

      setEmployeeList((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.id === member.id
            ? {
                ...currentMember,
                accessStatus: updated.status,
              }
            : currentMember,
        ),
      );

      showNotice(
        status === "disabled"
          ? `${member.name} was disabled.`
          : `${member.name} was reactivated.`,
      );
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to update access.",
        "error",
      );
    } finally {
      setBusyEmployeeId("");
    }
  }

  async function handleRemoveEmployee(member: EmployeeView) {
    if (member.role === "Admin") {
      showNotice("Admin accounts cannot be removed from this page.", "error");
      return;
    }

    if (member.accessStatus !== "disabled") {
      showNotice("Disable this member before removing permanently.", "error");
      return;
    }

    const confirmed = window.confirm(
      `Permanently remove ${member.name}? This deletes the login account and profile.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyEmployeeId(member.id);

      await removeEmployee(member.id);

      const remainingMembers = employeeList.filter(
        (item) => item.id !== member.id,
      );

      setEmployeeList(remainingMembers);
      setSelectedEmployeeId(remainingMembers[0]?.id ?? "");

      showNotice(`${member.name} was permanently removed.`);
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to remove member.",
        "error",
      );
    } finally {
      setBusyEmployeeId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Team"
        description="Manage members, account details, access status, and disabled user removal."
        onOpenSidebar={onOpenSidebar}
        accent="blue"
        pills={[
          {
            icon: Users,
            value: employeeList.length,
            label: "Members",
            accent: "blue",
          },
          {
            icon: UserCheck,
            value: activeCount,
            label: "Active",
            accent: "emerald",
          },
          {
            icon: XCircle,
            value: disabledCount,
            label: "Disabled",
            accent: "amber",
          },
          {
            icon: CheckCircle2,
            value: submittedCount,
            label: "Submitted",
            accent: "violet",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load team">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-3.5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Members
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-600">
                Admin and team accounts.
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => void loadEmployees()}
                disabled={loadingEmployees}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                title="Refresh"
              >
                <RefreshCw
                  className={[
                    "h-4 w-4",
                    loadingEmployees ? "animate-spin" : "",
                  ].join(" ")}
                />
              </button>

              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  setNotice(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/15 transition hover:bg-blue-400"
                title="Add member"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-slate-600" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search team..."
              className="w-full min-w-0 bg-transparent text-sm font-medium text-slate-300 outline-none placeholder:text-slate-700"
            />
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {loadingEmployees ? (
              <LoadingEmployees />
            ) : filteredEmployees.length === 0 ? (
              <EmptyMembers />
            ) : (
              <div className="space-y-2.5">
                {filteredEmployees.map((member) => (
                  <MemberListCard
                    key={member.id}
                    member={member}
                    selected={selectedEmployee?.id === member.id}
                    onClick={() => setSelectedEmployeeId(member.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
          {selectedEmployee ? (
            <MemberDetail
              member={selectedEmployee}
              busyEmployeeId={busyEmployeeId}
              openTasksCount={openTasksCount}
              onEdit={setEditingEmployee}
              onSetAccess={handleSetAccess}
              onRemove={handleRemoveEmployee}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div>
                <Users className="mx-auto h-10 w-10 text-slate-700" />
                <p className="mt-3 font-semibold text-white">
                  Select a member
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Member profile and work summary will appear here.
                </p>
              </div>
            </div>
          )}
        </main>
      </section>

      {createModalOpen && (
        <MemberFormModal
          mode="create"
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateEmployee}
        />
      )}

      {editingEmployee && (
        <MemberFormModal
          mode="edit"
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSubmit={handleUpdateEmployee}
        />
      )}
    </div>
  );
}

function MemberListCard({
  member,
  selected,
  onClick,
}: {
  member: EmployeeView;
  selected: boolean;
  onClick: () => void;
}) {
  const isAdmin = member.role === "Admin";
  const isDisabled = member.accessStatus === "disabled";

  return (
    <button
      onClick={onClick}
      className={[
        "group relative w-full rounded-lg border p-3 text-left transition",
        selected
          ? "border-blue-500/45 bg-blue-500/[0.08] ring-1 ring-blue-500/25"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
        isDisabled ? "opacity-65" : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        <MemberAvatar role={member.role} size="sm" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black leading-tight text-white">
                {member.name}
              </h3>

              <p className="mt-1 truncate text-xs font-medium text-slate-500">
                {displayRole(member.role)}
              </p>
            </div>

            <AccessStatusBadge status={member.accessStatus} compact />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                isDisabled
                  ? "bg-red-400"
                  : isAdmin
                    ? "bg-violet-400"
                    : "bg-blue-400",
              ].join(" ")}
            />

            <p className="truncate text-[11px] font-semibold text-slate-600">
              {member.email}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function MemberDetail({
  member,
  busyEmployeeId,
  openTasksCount,
  onEdit,
  onSetAccess,
  onRemove,
}: {
  member: EmployeeView;
  busyEmployeeId: string;
  openTasksCount: number;
  onEdit: (member: EmployeeView) => void;
  onSetAccess: (member: EmployeeView, status: ProfileStatus) => Promise<void>;
  onRemove: (member: EmployeeView) => Promise<void>;
}) {
  const summary = getEmployeeTaskSummary(member.name);
  const assignedTasks = tasks.filter((task) => task.assignee === member.name);
  const isAdmin = member.role === "Admin";
  const isBusy = busyEmployeeId === member.id;
  const isDisabled = member.accessStatus === "disabled";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 bg-[#111318] p-5">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <MemberAvatar role={member.role} size="lg" />

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-2xl font-black leading-tight tracking-tight text-white">
                  {member.name}
                </h2>

                <RoleBadge role={member.role} />
                <AccessStatusBadge status={member.accessStatus} />
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <div className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-600" />
                  <span className="truncate">{member.email}</span>
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-slate-600" />
                  <span className="truncate">Created {member.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {!isAdmin && (
              <button
                onClick={() => onEdit(member)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
            )}

            {!isAdmin && !isDisabled && (
              <button
                onClick={() => void onSetAccess(member, "disabled")}
                disabled={isBusy}
                className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Disable
              </button>
            )}

            {!isAdmin && isDisabled && (
              <>
                <button
                  onClick={() => void onSetAccess(member, "active")}
                  disabled={isBusy}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  Reactivate
                </button>

                <button
                  onClick={() => void onRemove(member)}
                  disabled={isBusy}
                  className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/15 px-3.5 py-2 text-sm font-black text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Open Tasks"
            value={summary.open}
            icon={Activity}
            accent="blue"
          />

          <SummaryCard
            label="Submitted"
            value={summary.submitted}
            icon={CheckCircle2}
            accent="violet"
          />

          <SummaryCard
            label="Needs Revision"
            value={summary.needsRevision}
            icon={AlertTriangle}
            accent="amber"
          />

          <SummaryCard
            label="Approved"
            value={summary.approved}
            icon={UserCheck}
            accent="emerald"
          />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0 rounded-xl border border-white/10 bg-[#0B0D10] p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">
                  Assigned Work
                </h3>

                <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
                  Current and recent production items assigned to this member.
                </p>
              </div>

              <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-slate-300">
                {assignedTasks.length} items
              </span>
            </div>

            {assignedTasks.length === 0 ? (
              <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#111318] p-8 text-center">
                <div>
                  <CircleDot className="mx-auto h-9 w-9 text-slate-700" />
                  <p className="mt-3 font-semibold text-white">
                    No assigned work yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    This summary will connect to real task data later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-xl border border-white/10 bg-[#0B0D10] p-5">
            <h3 className="text-base font-black text-white">Access Control</h3>

            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Real access is controlled by Supabase Auth and profiles.
            </p>

            <div className="mt-4 space-y-3">
              <AccessItem
                icon={Shield}
                label="Role"
                value={displayRole(member.role)}
                tone={member.role === "Admin" ? "violet" : "blue"}
              />

              <AccessItem
                icon={UserCheck}
                label="Account Status"
                value={capitalize(member.accessStatus)}
                tone={member.accessStatus === "active" ? "emerald" : "red"}
              />

              <AccessItem
                icon={Activity}
                label="All Open Tasks"
                value={String(openTasksCount)}
                tone="slate"
              />
            </div>

            <div className="mt-5 rounded-lg border border-blue-500/15 bg-blue-500/[0.055] p-4">
              <p className="text-sm font-black text-blue-200">Remove Rule</p>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Disable first, then remove. This avoids accidental permanent
                deletion.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MemberFormModal(props: EmployeeFormModalProps) {
  const { mode, onClose, onSubmit } = props;

  const [form, setForm] = useState({
    name: mode === "edit" ? props.employee.name : "",
    email: mode === "edit" ? props.employee.email : "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (mode === "edit") {
        await onSubmit({
          id: props.employee.id,
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        });
      } else {
        await onSubmit({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
              {mode === "create" ? "New Member" : "Edit Member"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {mode === "create" ? "Add team member" : "Update member account"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {mode === "create"
                ? "This creates a real login account and profile."
                : "Change name, email, or set a new password."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <TextField
              label="Member Name"
              value={form.name}
              placeholder="Example: Maria"
              onChange={(value) =>
                setForm((current) => ({ ...current, name: value }))
              }
            />

            <TextField
              label="Member Email"
              value={form.email}
              placeholder="member@email.com"
              onChange={(value) =>
                setForm((current) => ({ ...current, email: value }))
              }
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-300">
                {mode === "create"
                  ? "Temporary Password"
                  : "New Password Optional"}
              </span>

              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 transition focus-within:border-blue-500/70">
                <input
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "create"
                      ? "At least 8 characters"
                      : "Leave blank to keep current password"
                  }
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="shrink-0 text-slate-500 transition hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Add Member"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberAvatar({
  role,
  size,
}: {
  role: EmployeeView["role"];
  size: "sm" | "lg";
}) {
  const Icon = role === "Admin" ? ShieldCheck : UserRound;

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-lg border text-white shadow-lg",
        role === "Admin"
          ? "border-violet-400/25 bg-violet-500 shadow-violet-500/15"
          : "border-blue-400/25 bg-blue-500 shadow-blue-500/15",
        size === "lg" ? "h-14 w-14" : "h-10 w-10",
      ].join(" ")}
    >
      <Icon className={size === "lg" ? "h-6 w-6" : "h-4 w-4"} />
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
      />
    </label>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: "blue" | "violet" | "amber" | "emerald";
}) {
  const styles = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0B0D10] p-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            styles[accent],
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>

        <p className="text-2xl font-black text-white">{value}</p>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111318] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-black text-white">
            {task.title}
          </h4>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {task.detail}
          </p>
        </div>

        <TaskStatusBadge status={task.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-lg bg-white/5 px-2.5 py-1">{task.brand}</span>
        <span className="rounded-lg bg-white/5 px-2.5 py-1">
          Due {task.due}
        </span>
      </div>
    </div>
  );
}

function AccessItem({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "violet" | "blue" | "emerald" | "slate" | "red";
}) {
  const styles = {
    violet: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    slate: "text-slate-300 bg-white/5 border-white/10",
    red: "text-red-300 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#111318] p-3">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          styles[tone],
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: EmployeeView["role"] }) {
  const style =
    role === "Admin"
      ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
      : "border-blue-500/20 bg-blue-500/10 text-blue-300";

  return (
    <span
      className={[
        "rounded-lg border px-2.5 py-1 text-xs font-black",
        style,
      ].join(" ")}
    >
      {displayRole(role)}
    </span>
  );
}

function AccessStatusBadge({
  status,
  compact = false,
}: {
  status: ProfileStatus;
  compact?: boolean;
}) {
  const style =
    status === "active"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-red-500/20 bg-red-500/10 text-red-300";

  return (
    <span
      className={[
        "shrink-0 rounded-lg border font-black",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        style,
      ].join(" ")}
    >
      {capitalize(status)}
    </span>
  );
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={[
        "shrink-0 rounded-lg border px-2.5 py-1 text-xs font-black",
        taskStatusStyle(status),
      ].join(" ")}
    >
      {taskStatusLabel(status)}
    </span>
  );
}

function EmptyMembers() {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <Users className="mx-auto h-10 w-10 text-slate-700" />
        <p className="mt-3 font-semibold text-white">No members found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try another search or add a new member.
        </p>
      </div>
    </div>
  );
}

function LoadingEmployees() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[84px] animate-pulse rounded-lg border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function NoticeCard({
  tone,
  title,
  children,
}: {
  tone: "success" | "error";
  title: string;
  children: string;
}) {
  const style =
    tone === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";

  return (
    <div className={["rounded-xl border p-4", style].join(" ")}>
      <p className="text-sm font-black capitalize">{title}</p>
      <p className="mt-1 text-sm font-semibold opacity-90">{children}</p>
    </div>
  );
}

function getEmployeeTaskSummary(employeeName: string) {
  const assigned = tasks.filter((task) => task.assignee === employeeName);

  return {
    open: assigned.filter((task) => openTaskStatuses.includes(task.status))
      .length,
    submitted: assigned.filter((task) => task.status === "submitted").length,
    needsRevision: assigned.filter((task) => task.status === "needs_revision")
      .length,
    approved: assigned.filter(
      (task) =>
        task.status === "approved" ||
        task.status === "ready_to_upload" ||
        task.status === "posted",
    ).length,
  };
}

function taskStatusLabel(status: TaskStatus) {
  switch (status) {
    case "to_generate":
      return "To Generate";
    case "in_progress":
      return "In Progress";
    case "submitted":
      return "Submitted";
    case "needs_revision":
      return "Needs Revision";
    case "approved":
      return "Approved";
    case "ready_to_upload":
      return "Ready";
    case "posted":
      return "Posted";
    default:
      return status;
  }
}

function taskStatusStyle(status: TaskStatus) {
  switch (status) {
    case "to_generate":
      return "border-white/10 bg-white/5 text-slate-300";
    case "in_progress":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "submitted":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "needs_revision":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "ready_to_upload":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "posted":
      return "border-green-500/20 bg-green-500/10 text-green-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function mapProfileToEmployee(
  profile: ProfileRow,
  currentUserId: string,
): EmployeeView {
  const isCurrentUser = profile.id === currentUserId;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role === "admin" ? "Admin" : "Employee",
    status: isCurrentUser ? "Online" : "Offline",
    accessStatus: profile.status,
    lastSeen: isCurrentUser ? "now" : "not tracked",
    createdAt: formatDate(profile.created_at),
  };
}

function displayRole(role: EmployeeView["role"]) {
  return role === "Admin" ? "Admin" : "Member";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}