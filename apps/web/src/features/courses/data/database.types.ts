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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
