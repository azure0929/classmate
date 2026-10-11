import { curatedCourses } from "../data/curated-videos";

export async function getCourses() {
  return curatedCourses;
}
