import type { CourseCategory, CourseSubcategory } from "./course-category";

export interface Course {
  id: string;
  title: string;
  teacher: string;
  category: CourseCategory;
  subcategory: CourseSubcategory;
  price: number;
  students: string;
  rating: string;
  image: string;
  color: string;
  label: string;
  date: string;
}
