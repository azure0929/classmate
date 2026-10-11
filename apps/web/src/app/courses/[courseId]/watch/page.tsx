import { notFound } from "next/navigation";
import { CourseWatchPage } from "../../../../features/courses/components/course-watch-page";
import { mockCourses } from "../../../../features/courses/api/mock-courses";

interface CourseWatchRouteProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseWatchRoute({
  params,
}: CourseWatchRouteProps) {
  const { courseId } = await params;
  const course = mockCourses.find((item) => item.id === courseId);

  if (!course) notFound();

  return <CourseWatchPage course={course} />;
}
