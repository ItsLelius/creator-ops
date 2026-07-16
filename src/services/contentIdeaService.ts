import { supabase } from "../lib/supabase";
import type { ContentIdeaDbItem } from "../types";

export type CreateContentIdeaInput = {
  contentPageId: string;
  title: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  hook: string;
  notes: string;
};

export type UpdateContentIdeaInput = CreateContentIdeaInput & {
  id: string;
};

export async function getContentIdeas() {
  const { data, error } = await supabase
    .from("content_ideas")
    .select(
      `
      id,
      content_page_id,
      title,
      category,
      source_name,
      source_url,
      hook,
      notes,
      created_by,
      created_at,
      updated_at,
      content_page:content_pages!content_ideas_content_page_id_fkey (
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

  return (data ?? []) as unknown as ContentIdeaDbItem[];
}

export async function createContentIdea(input: CreateContentIdeaInput) {
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
    .from("content_ideas")
    .insert({
      content_page_id: input.contentPageId,
      title: input.title.trim(),
      category: input.category.trim() || "General",
      source_name: input.sourceName.trim(),
      source_url: input.sourceUrl.trim(),
      hook: input.hook.trim(),
      notes: input.notes.trim(),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateContentIdea(input: UpdateContentIdeaInput) {
  const { data, error } = await supabase
    .from("content_ideas")
    .update({
      content_page_id: input.contentPageId,
      title: input.title.trim(),
      category: input.category.trim() || "General",
      source_name: input.sourceName.trim(),
      source_url: input.sourceUrl.trim(),
      hook: input.hook.trim(),
      notes: input.notes.trim(),
    })
    .eq("id", input.id)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteContentIdea(id: string) {
  const { error } = await supabase.from("content_ideas").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return id;
}