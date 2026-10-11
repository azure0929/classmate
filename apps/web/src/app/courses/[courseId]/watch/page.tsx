import { notFound } from "next/navigation";
import { CourseWatchPage } from "../../../../features/courses/components/course-watch-page";
import { mockCourses } from "../../../../features/courses/api/mock-courses";
import { curatedVideos } from "../../../../features/courses/data/curated-videos";
import { getVideoCourseLessonMatch } from "../../../../features/courses/data/course-video-matches";
import { getCourseLearningPlan } from "../../../../features/courses/data/course-curriculum";

interface CourseWatchRouteProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ video?: string | string[]; lesson?: string | string[] }>;
}

export default async function CourseWatchRoute({
  params,
  searchParams,
}: CourseWatchRouteProps) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const course = mockCourses.find((item) => item.id === courseId);

  if (!course) notFound();

  const videoId = Array.isArray(query.video) ? query.video[0] : query.video;
  const requestedLesson = Array.isArray(query.lesson) ? query.lesson[0] : query.lesson;
  const video = curatedVideos.find((item) => item.id === videoId);
  const videoMatch = video ? getVideoCourseLessonMatch(video) : undefined;
  const selectedVideo =
    video?.category === course.category &&
    video.subcategories.includes(course.subcategory)
      ? video
      : undefined;
  const courseLessons = getCourseLearningPlan(course).chapters.flatMap(
    (chapter) => chapter.lessons,
  );
  const initialLesson =
    requestedLesson && courseLessons.includes(requestedLesson)
      ? requestedLesson
      : videoMatch?.course.id === course.id
        ? videoMatch.lesson
        : undefined;

  return (
    <CourseWatchPage
      course={course}
      initialVideoId={selectedVideo?.id}
      initialLesson={initialLesson}
    />
  );
}
