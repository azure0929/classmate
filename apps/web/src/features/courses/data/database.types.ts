import type { CourseCategory, CourseSubcategory } from "../types/course-category";

export type CourseRow = {
  id: string;
  video_id: string;
  sort_order: number;
  category: CourseCategory;
  subcategory: CourseSubcategory;
  title: string;
  creator: string;
  youtube_video_id: string;
  channel_url: string;
  summary: string;
  subcategories: string[];
  keywords: string[];
  price: number;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
};

export type PlatformNotificationRow = {
  id: string;
  title: string;
  description: string;
  time_label: string;
  href: string;
  sort_order: number;
  created_at: string;
};

export type WorkspaceClassRow = {
  id: string;
  title: string;
  teacher: string;
  category: string;
  students: number;
  status: "진행 중" | "모집 중" | "마감 임박" | "임시 저장";
  date_label: string;
  scheduled_on: string | null;
  color: "mint" | "peach" | "yellow" | "blue";
  sort_order: number;
  updated_at: string;
};

type CourseInsert = Omit<CourseRow, "thumbnail_url" | "created_at" | "updated_at"> & {
  thumbnail_url?: never;
  created_at?: string;
  updated_at?: string;
};

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: CourseRow;
        Insert: CourseInsert;
        Update: Partial<CourseInsert>;
        Relationships: [];
      };
      platform_notifications: {
        Row: PlatformNotificationRow;
        Insert: Omit<PlatformNotificationRow, "created_at"> & { created_at?: string };
        Update: Partial<Omit<PlatformNotificationRow, "created_at">>;
        Relationships: [];
      };
      workspace_classes: {
        Row: WorkspaceClassRow;
        Insert: Omit<WorkspaceClassRow, "updated_at"> & { updated_at?: string };
        Update: Partial<Omit<WorkspaceClassRow, "updated_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
