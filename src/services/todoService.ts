import { supabase } from "../lib/supabase";
import type { TodoDbItem, TodoDbStatus, UserRole } from "../types";

export type TeamMemberOption = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "disabled";
};

export type CreateTodoInput = {
  title: string;
  contentPageId: string;
  assigneeId: string;
  assignToAll: boolean;
  caption: string;
  promptA: string;
  promptB: string;
  notes: string;
  dueDate: string;
};

export type UpdateTodoInput = CreateTodoInput & {
  id: string;
  status: TodoDbStatus;
};

type ContentPageNameResult = {
  name: string;
};

export async function getAssignablePeople() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, status")
    .eq("status", "active")
    .order("role", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TeamMemberOption[];
}

export async function getTeamMembers() {
  return getAssignablePeople();
}

export async function getTodoItems() {
  const { data, error } = await supabase
    .from("todo_items")
    .select(
      `
      id,
      title,
      brand,
      content_page_id,
      assignee_id,
      created_by,
      assign_to_all,
      status,
      caption,
      prompt_a,
      prompt_b,
      notes,
      drive_url,
      due_date,
      created_at,
      updated_at,
      assignee:profiles!todo_items_assignee_id_fkey (
        id,
        name,
        email,
        role,
        status
      ),
      content_page:content_pages!todo_items_content_page_id_fkey (
        id,
        name,
        platform,
        page_url,
        niche,
        status
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as TodoDbItem[];
}

async function getContentPageName(contentPageId: string) {
  const { data, error } = await supabase
    .from("content_pages")
    .select("name")
    .eq("id", contentPageId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const page = data as unknown as ContentPageNameResult;

  return page.name;
}

export async function createTodoItem(input: CreateTodoInput) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const pageName = await getContentPageName(input.contentPageId);

  const { data, error } = await supabase
    .from("todo_items")
    .insert({
      title: input.title.trim(),
      brand: pageName,
      content_page_id: input.contentPageId,
      assignee_id: input.assignToAll ? null : input.assigneeId,
      assign_to_all: input.assignToAll,
      created_by: user.id,
      caption: input.caption.trim(),
      prompt_a: input.promptA.trim(),
      prompt_b: input.promptB.trim(),
      notes: input.notes.trim(),
      due_date: input.dueDate || null,
      status: "assigned",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTodoItem(input: UpdateTodoInput) {
  const pageName = await getContentPageName(input.contentPageId);

  const { data, error } = await supabase
    .from("todo_items")
    .update({
      title: input.title.trim(),
      brand: pageName,
      content_page_id: input.contentPageId,
      assignee_id: input.assignToAll ? null : input.assigneeId,
      assign_to_all: input.assignToAll,
      caption: input.caption.trim(),
      prompt_a: input.promptA.trim(),
      prompt_b: input.promptB.trim(),
      notes: input.notes.trim(),
      due_date: input.dueDate || null,
      status: input.status,
    })
    .eq("id", input.id)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTodoStatus(id: string, status: TodoDbStatus) {
  const { data, error } = await supabase
    .from("todo_items")
    .update({
      status,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTodoItem(id: string) {
  const { error } = await supabase.from("todo_items").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return id;
}