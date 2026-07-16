import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  Copy,
  Edit3,
  FileText,
  ListTodo,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { getActiveContentPages } from "../services/contentPageService";
import {
  createTodoItem,
  deleteTodoItem,
  getAssignablePeople,
  getTodoItems,
  updateTodoItem,
  type CreateTodoInput,
  type TeamMemberOption,
  type UpdateTodoInput,
} from "../services/todoService";
import type {
  ContentPageDbItem,
  CurrentUser,
  TodoDbItem,
  TodoDbStatus,
  UserRole,
} from "../types";

type ToDoListPageProps = {
  onOpenSidebar: () => void;
  currentUser: CurrentUser;
};

type NoticeState = {
  type: "success" | "error";
  message: string;
};

type ConfirmState = {
  title: string;
  description: string;
  actionLabel: string;
  tone: "red";
  onConfirm: () => Promise<void>;
};

type TodoFormModalProps =
  | {
      mode: "create";
      pages: ContentPageDbItem[];
      people: TeamMemberOption[];
      onClose: () => void;
      onSubmit: (input: CreateTodoInput) => Promise<void>;
    }
  | {
      mode: "edit";
      item: TodoDbItem;
      pages: ContentPageDbItem[];
      people: TeamMemberOption[];
      onClose: () => void;
      onSubmit: (input: UpdateTodoInput) => Promise<void>;
    };

const EVERYONE_ASSIGNEE_ID = "__everyone__";

const activeStatusOptions: TodoDbStatus[] = [
  "assigned",
  "in_progress",
  "needs_revision",
];

export function ToDoListPage({
  onOpenSidebar,
  currentUser,
}: ToDoListPageProps) {
  const isAdmin = currentUser.role === "admin";

  const [items, setItems] = useState<TodoDbItem[]>([]);
  const [pages, setPages] = useState<ContentPageDbItem[]>([]);
  const [people, setPeople] = useState<TeamMemberOption[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [loadError, setLoadError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoDbItem | null>(null);
  const [busyItemId, setBusyItemId] = useState("");
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setLoadError("");

      const allTodoItems = await getTodoItems();
      const activeTodoItems = allTodoItems.filter(isActiveTodoItem);
      const activePages = isAdmin ? await getActiveContentPages() : [];
      const assignablePeople = isAdmin ? await getAssignablePeople() : [];

      setItems(activeTodoItems);
      setPages(activePages);
      setPeople(assignablePeople);

      setSelectedItemId((currentSelectedId) => {
        if (
          currentSelectedId &&
          activeTodoItems.some((item) => item.id === currentSelectedId)
        ) {
          return currentSelectedId;
        }

        return activeTodoItems[0]?.id ?? "";
      });
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load To Do List.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [currentUser.id, currentUser.role]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        pageName(item).toLowerCase().includes(query) ||
        assigneeName(item).toLowerCase().includes(query) ||
        statusLabel(item.status).toLowerCase().includes(query)
      );
    });
  }, [items, search]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ??
    filteredItems[0] ??
    null;

  const assignedCount = items.filter((item) => item.status === "assigned")
    .length;

  const inProgressCount = items.filter(
    (item) => item.status === "in_progress",
  ).length;

  const revisionCount = items.filter((item) => item.status === "needs_revision")
    .length;

  function showNotice(message: string, type: NoticeState["type"] = "success") {
    setNotice({
      message,
      type,
    });
  }

  async function handleCreateTodo(input: CreateTodoInput) {
    await createTodoItem(input);

    showNotice("Work item created successfully.");
    setCreateModalOpen(false);

    await loadData();
  }

  async function handleUpdateTodo(input: UpdateTodoInput) {
    await updateTodoItem(input);

    showNotice("Work item updated successfully.");
    setEditingItem(null);
    setSelectedItemId(input.id);

    await loadData();
  }

  function handleDeleteTodo(item: TodoDbItem) {
    setConfirm({
      title: "Delete this work item?",
      description: `"${item.title}" will be permanently removed from the To Do List. This action cannot be undone.`,
      actionLabel: "Delete Work",
      tone: "red",
      onConfirm: () => executeDeleteTodo(item),
    });
  }

  async function executeDeleteTodo(item: TodoDbItem) {
    try {
      setBusyItemId(item.id);

      await deleteTodoItem(item.id);

      const remainingItems = items.filter(
        (currentItem) => currentItem.id !== item.id,
      );

      setItems(remainingItems);
      setSelectedItemId(remainingItems[0]?.id ?? "");
      setConfirm(null);

      showNotice("Work item deleted successfully.");
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Failed to delete item.",
        "error",
      );
    } finally {
      setBusyItemId("");
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title={isAdmin ? "To Do List" : "My To Do List"}
        description={
          isAdmin
            ? "Create active work instructions. Submitted and completed work moves to Production Board and Ready to Upload."
            : "View active assigned work. Submitted work moves to review."
        }
        onOpenSidebar={onOpenSidebar}
        accent="blue"
        pills={[
          {
            icon: ListTodo,
            value: items.length,
            label: "Active work",
            accent: "blue",
          },
          {
            icon: FileText,
            value: assignedCount,
            label: "Assigned",
            accent: "violet",
          },
          {
            icon: UserRound,
            value: inProgressCount,
            label: "In progress",
            accent: "amber",
          },
          {
            icon: AlertTriangle,
            value: revisionCount,
            label: "Revision",
            accent: "amber",
          },
        ]}
      />

      {(loadError || notice) && (
        <div className="mb-4">
          {loadError ? (
            <NoticeCard tone="error" title="Could not load To Do List">
              {loadError}
            </NoticeCard>
          ) : notice ? (
            <NoticeCard tone={notice.type} title={notice.type}>
              {notice.message}
            </NoticeCard>
          ) : null}
        </div>
      )}

      <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-[#111318] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-300">
                Work Queue
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {isAdmin ? "Active production work." : "Needs your action."}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  setNotice(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-400"
                title="Create work item"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search active work..."
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <LoadingTodoItems />
            ) : filteredItems.length === 0 ? (
              <EmptyToDoList isAdmin={isAdmin} />
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <ToDoCard
                    key={item.id}
                    item={item}
                    selected={selectedItem?.id === item.id}
                    onClick={() => setSelectedItemId(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
          {selectedItem ? (
            <ToDoViewer
              item={selectedItem}
              isAdmin={isAdmin}
              busyItemId={busyItemId}
              onEdit={setEditingItem}
              onDelete={handleDeleteTodo}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center">
              <div>
                <ListTodo className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 font-semibold text-white">
                  Select a work item
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Caption, Prompt A, and Prompt B will appear here.
                </p>
              </div>
            </div>
          )}
        </main>
      </section>

      {createModalOpen && (
        <TodoFormModal
          mode="create"
          pages={pages}
          people={people}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateTodo}
        />
      )}

      {editingItem && (
        <TodoFormModal
          mode="edit"
          item={editingItem}
          pages={pages}
          people={people}
          onClose={() => setEditingItem(null)}
          onSubmit={handleUpdateTodo}
        />
      )}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          busy={Boolean(busyItemId)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function ToDoCard({
  item,
  selected,
  onClick,
}: {
  item: TodoDbItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group relative w-full overflow-hidden rounded-xl border p-4 text-left transition",
        selected
          ? "border-blue-500/45 bg-blue-500/[0.065] ring-1 ring-blue-500/30"
          : "border-white/10 bg-[#0B0D10] hover:border-white/20 hover:bg-[#14171D]",
      ].join(" ")}
    >
      <span className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-violet-600" />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={item.status} />

        <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black text-slate-300">
          {pageName(item)}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-black leading-snug text-white">
        {item.title}
      </h3>

      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {item.assign_to_all ? (
          <Users className="h-3.5 w-3.5" />
        ) : (
          <UserRound className="h-3.5 w-3.5" />
        )}
        {assigneeName(item)}
      </p>
    </button>
  );
}

function ToDoViewer({
  item,
  isAdmin,
  busyItemId,
  onEdit,
  onDelete,
}: {
  item: TodoDbItem;
  isAdmin: boolean;
  busyItemId: string;
  onEdit: (item: TodoDbItem) => void;
  onDelete: (item: TodoDbItem) => void;
}) {
  const isBusy = busyItemId === item.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-[#111318] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                {pageName(item)}
              </span>

              <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                Created {formatDate(item.created_at)}
              </span>

              {item.due_date && (
                <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-black text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Due {formatDate(item.due_date)}
                </span>
              )}
            </div>

            <h2 className="mt-3 break-words text-3xl font-black leading-tight text-white">
              {item.title}
            </h2>

            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
              {item.assign_to_all ? (
                <Users className="h-4 w-4 text-slate-500" />
              ) : (
                <UserRound className="h-4 w-4 text-slate-500" />
              )}
              Assigned to {assigneeName(item)}
            </p>
          </div>

          {isAdmin && (
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => onDelete(item)}
                disabled={isBusy}
                className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-5xl space-y-5">
          <CopyBlock label="Caption" value={item.caption} tone="blue" />
          <CopyBlock label="Prompt A" value={item.prompt_a} tone="violet" />
          <CopyBlock label="Prompt B" value={item.prompt_b} tone="emerald" />

          {item.notes && (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.055] p-5">
              <p className="text-xs font-black uppercase tracking-wide text-amber-300">
                Notes
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TodoFormModal(props: TodoFormModalProps) {
  const { mode, pages, people, onClose, onSubmit } = props;

  const initialAssigneeId =
    mode === "edit"
      ? props.item.assign_to_all
        ? EVERYONE_ASSIGNEE_ID
        : props.item.assignee_id ?? ""
      : EVERYONE_ASSIGNEE_ID;

  const initialContentPageId =
    mode === "edit"
      ? props.item.content_page_id ?? pages[0]?.id ?? ""
      : pages[0]?.id ?? "";

  const initialStatus =
    mode === "edit" && activeStatusOptions.includes(props.item.status)
      ? props.item.status
      : "assigned";

  const [form, setForm] = useState<{
    title: string;
    contentPageId: string;
    assigneeId: string;
    caption: string;
    promptA: string;
    promptB: string;
    notes: string;
    dueDate: string;
    status: TodoDbStatus;
  }>({
    title: mode === "edit" ? props.item.title : "",
    contentPageId: initialContentPageId,
    assigneeId: initialAssigneeId,
    caption: mode === "edit" ? props.item.caption : "",
    promptA: mode === "edit" ? props.item.prompt_a : "",
    promptB: mode === "edit" ? props.item.prompt_b : "",
    notes: mode === "edit" ? props.item.notes : "",
    dueDate: mode === "edit" ? props.item.due_date ?? "" : "",
    status: initialStatus,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.title.trim()) {
        throw new Error("Title is required.");
      }

      if (!form.contentPageId) {
        throw new Error("Choose a brand page.");
      }

      const assignToAll = form.assigneeId === EVERYONE_ASSIGNEE_ID;

      if (!assignToAll && !form.assigneeId) {
        throw new Error("Choose who this work is assigned to.");
      }

      if (mode === "edit") {
        await onSubmit({
          id: props.item.id,
          title: form.title,
          contentPageId: form.contentPageId,
          assigneeId: assignToAll ? "" : form.assigneeId,
          assignToAll,
          caption: form.caption,
          promptA: form.promptA,
          promptB: form.promptB,
          notes: form.notes,
          dueDate: form.dueDate,
          status: form.status,
        });
      } else {
        await onSubmit({
          title: form.title,
          contentPageId: form.contentPageId,
          assigneeId: assignToAll ? "" : form.assigneeId,
          assignToAll,
          caption: form.caption,
          promptA: form.promptA,
          promptB: form.promptB,
          notes: form.notes,
          dueDate: form.dueDate,
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
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#111318] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
              {mode === "create" ? "New Work Item" : "Edit Work Item"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {mode === "create" ? "Create active work" : "Update active work"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose the brand page, assign the work, then add caption and
              prompts.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="scroll-panel max-h-[calc(92vh-130px)] overflow-y-auto p-6"
        >
          <div className="rounded-xl border border-white/10 bg-[#0B0D10] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Work Setup
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                label="Title"
                value={form.title}
                placeholder="Example: Garlic Bread Rolls"
                onChange={(value) =>
                  setForm((current) => ({ ...current, title: value }))
                }
              />

              <SelectField
                label="Brand Page"
                value={form.contentPageId}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    contentPageId: value,
                  }))
                }
              >
                <option value="">Choose brand page</option>

                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Assign To"
                value={form.assigneeId}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    assigneeId: value,
                  }))
                }
              >
                <option value={EVERYONE_ASSIGNEE_ID}>Everyone</option>

                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} — {roleLabel(person.role)}
                  </option>
                ))}
              </SelectField>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-300">
                  Due Date
                </span>

                <input
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  type="date"
                  className="w-full rounded-lg border border-white/10 bg-[#111318] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-blue-500/70"
                />
              </label>

              {mode === "edit" && (
                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as TodoDbStatus,
                    }))
                  }
                  className="md:col-span-2"
                >
                  {activeStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#0B0D10] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Production Copy
            </p>

            <div className="mt-4 space-y-4">
              <TextArea
                label="Caption"
                value={form.caption}
                placeholder="Paste the caption here..."
                rows={4}
                onChange={(value) =>
                  setForm((current) => ({ ...current, caption: value }))
                }
              />

              <TextArea
                label="Prompt A"
                value={form.promptA}
                placeholder="Paste image prompt here..."
                rows={6}
                onChange={(value) =>
                  setForm((current) => ({ ...current, promptA: value }))
                }
              />

              <TextArea
                label="Prompt B"
                value={form.promptB}
                placeholder="Paste animation prompt here..."
                rows={6}
                onChange={(value) =>
                  setForm((current) => ({ ...current, promptB: value }))
                }
              />

              <TextArea
                label="Notes"
                value={form.notes}
                placeholder="Optional notes..."
                rows={3}
                onChange={(value) =>
                  setForm((current) => ({ ...current, notes: value }))
                }
              />
            </div>
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
                  ? "Create Work"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({
  confirm,
  busy,
  onClose,
}: {
  confirm: ConfirmState;
  busy: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111318] p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              Confirm Action
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white">
              {confirm.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          {confirm.description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={() => void confirm.onConfirm()}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/15 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {busy ? "Working..." : confirm.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "violet" | "emerald";
}) {
  const canCopy = Boolean(value.trim());

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
      <div
        className={[
          "flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4",
          toneHeader(tone),
        ].join(" ")}
      >
        <p className="text-xs font-black uppercase tracking-wide text-white">
          {label}
        </p>

        <button
          onClick={() => void navigator.clipboard.writeText(value)}
          disabled={!canCopy}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>

      <div className="p-5">
        <p className="whitespace-pre-wrap break-words text-[15px] leading-8 text-slate-200">
          {value || "Nothing added yet."}
        </p>
      </div>
    </section>
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
        className="w-full rounded-lg border border-white/10 bg-[#111318] px-4 py-3.5 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  children,
  className = "",
  onChange,
}: {
  label: string;
  value: string;
  children: ReactNode;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={["block", className].join(" ")}>
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#111318] px-4 py-3.5 text-sm font-semibold text-white outline-none transition focus:border-blue-500/70"
      >
        {children}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  rows,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  rows: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-white/10 bg-[#111318] px-4 py-3.5 text-sm font-semibold leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70"
      />
    </label>
  );
}

function StatusBadge({ status }: { status: TodoDbStatus }) {
  return (
    <span
      className={[
        "rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
        statusStyle(status),
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
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

function EmptyToDoList({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B0D10] p-8 text-center">
      <div>
        <ListTodo className="mx-auto h-10 w-10 text-slate-600" />
        <p className="mt-3 font-semibold text-white">No active work found</p>
        <p className="mt-1 text-sm text-slate-500">
          {isAdmin
            ? "Create a new assigned work item to start."
            : "No active work is assigned to you right now."}
        </p>
      </div>
    </div>
  );
}

function LoadingTodoItems() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[112px] animate-pulse rounded-xl border border-white/10 bg-[#0B0D10]"
        />
      ))}
    </div>
  );
}

function isActiveTodoItem(item: TodoDbItem) {
  return ["assigned", "in_progress", "needs_revision"].includes(item.status);
}

function pageName(item: TodoDbItem) {
  return item.content_page?.name ?? item.brand;
}

function assigneeName(item: TodoDbItem) {
  if (item.assign_to_all) {
    return "Everyone";
  }

  return item.assignee?.name ?? "Unassigned";
}

function roleLabel(role: UserRole) {
  return role === "admin" ? "Admin" : "Member";
}

function statusLabel(status: TodoDbStatus) {
  switch (status) {
    case "assigned":
      return "Assigned";
    case "in_progress":
      return "In Progress";
    case "submitted":
      return "Under Review";
    case "needs_revision":
      return "Needs Revision";
    case "approved":
      return "Approved";
    case "done":
      return "Done";
    default:
      return status;
  }
}

function statusStyle(status: TodoDbStatus) {
  switch (status) {
    case "assigned":
      return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    case "in_progress":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
    case "needs_revision":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    case "submitted":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "approved":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "done":
      return "border-green-500/20 bg-green-500/10 text-green-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function toneHeader(tone: "blue" | "violet" | "emerald") {
  switch (tone) {
    case "blue":
      return "bg-blue-500/10";
    case "violet":
      return "bg-violet-500/10";
    case "emerald":
      return "bg-emerald-500/10";
    default:
      return "bg-white/5";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}