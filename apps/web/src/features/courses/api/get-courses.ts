import type { Course } from "../types/course";
import { getSupabaseClient } from "../../../lib/supabase-client";

export async function getCourses() {
  const { data, error } = await getSupabaseClient()
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load courses from Supabase", error.message);
    throw new Error(`Could not load courses: ${error.message}`);
  }

  return data.map(
    (row): Course => ({
      id: row.id,
      curatedVideoId: row.video_id,
      title: row.title,
      teacher: row.creator,
      category: row.category,
      subcategory: row.subcategory,
      price: row.price,
      image: row.thumbnail_url,
      color: "#e7ede5",
      label: "FREE",
      date: "",
    }),
  );
}
