import { getSupabaseClient } from "../../../lib/supabase-client";

export interface ActiveLiveClass {
  id: string;
  title: string;
  teacher: string;
  dateLabel: string;
}

export async function getActiveLiveClass(): Promise<ActiveLiveClass | null> {
  const { data, error } = await getSupabaseClient()
    .from("workspace_classes")
    .select("id, title, teacher, date_label")
    .eq("status", "진행 중")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load active live class", error.message);
    throw new Error(`Could not load active live class: ${error.message}`);
  }

  return data
    ? {
        id: data.id,
        title: data.title,
        teacher: data.teacher,
        dateLabel: data.date_label,
      }
    : null;
}