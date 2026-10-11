import { notFound } from "next/navigation";
import { CourseDetailPage } from "../../../features/courses/components/course-detail-page";
import { mockCourses } from "../../../features/courses/api/mock-courses";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const course = mockCourses.find((item) => item.id === courseId);

  if (!course) notFound();

  return <CourseDetailPage course={course} />;
}
