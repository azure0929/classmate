import { getSupabaseClient } from "../../../lib/supabase-client";

export interface PlatformNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  read: boolean;
}

export async function getPlatformNotifications(): Promise<PlatformNotification[]> {
  const { data, error } = await getSupabaseClient()
    .from("platform_notifications")
    .select("id, title, description, time_label, href")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load platform notifications", error.message);
    throw new Error(`Could not load notifications: ${error.message}`);
  }

  return data.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.description,
    time: notification.time_label,
    href: notification.href,
    read: false,
  }));
}