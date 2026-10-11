import { notFound } from "next/navigation";
import { CourseDetailPage } from "../../../features/courses/components/course-detail-page";
import { mockCourses } from "../../../features/courses/api/mock-courses";
import { curatedVideos } from "../../../features/courses/data/curated-videos";
import { getVideoCourseLessonMatch } from "../../../features/courses/data/course-video-matches";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ video?: string | string[] }>;
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const course = mockCourses.find((item) => item.id === courseId);

  if (!course) notFound();

  const videoId = Array.isArray(query.video) ? query.video[0] : query.video;
  const video = curatedVideos.find((item) => item.id === videoId);
  const videoMatch = video ? getVideoCourseLessonMatch(video) : undefined;
  const selectedVideo =
    videoMatch?.course.id === course.id ? video : undefined;

  return (
    <CourseDetailPage
      course={course}
      selectedVideo={selectedVideo}
      selectedVideoMatch={selectedVideo && videoMatch ? videoMatch : undefined}
    />
  );
}
