import { mockCourses } from "./mock-courses";

export async function getCourses() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return mockCourses;
}
