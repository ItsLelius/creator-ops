import { supabase } from "../lib/supabase";
import type { ContentPageDbItem, ContentPageStatus } from "../types";

export type CreateContentPageInput = {
  name: string;
  platform: string;
  pageUrl: string;
  niche: string;
  notes: string;
};

export type UpdateContentPageInput = CreateContentPageInput & {
  id: string;
  status: ContentPageStatus;
};

export async function getContentPages() {
  const { data, error } = await supabase
    .from("content_pages")
    .select(
      "id, name, platform, page_url, niche, status, notes, created_by, created_at, updated_at",
    )
    .order("status", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ContentPageDbItem[];
}

export async function getActiveContentPages() {
  const { data, error } = await supabase
    .from("content_pages")
    .select(
      "id, name, platform, page_url, niche, status, notes, created_by, created_at, updated_at",
    )
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ContentPageDbItem[];
}

export async function createContentPage(input: CreateContentPageInput) {
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

  const { data, error } = await supabase
    .from("content_pages")
    .insert({
      name: input.name.trim(),
      platform: input.platform.trim(),
      page_url: input.pageUrl.trim(),
      niche: input.niche.trim(),
      notes: input.notes.trim(),
      status: "active",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateContentPage(input: UpdateContentPageInput) {
  const { data, error } = await supabase
    .from("content_pages")
    .update({
      name: input.name.trim(),
      platform: input.platform.trim(),
      page_url: input.pageUrl.trim(),
      niche: input.niche.trim(),
      notes: input.notes.trim(),
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

export async function setContentPageStatus(
  id: string,
  status: ContentPageStatus,
) {
  const { data, error } = await supabase
    .from("content_pages")
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

export async function deleteContentPage(id: string) {
  const { error } = await supabase.from("content_pages").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return id;
}