import { notFound } from "next/navigation";
import { CourseDetailPage } from "../../../features/courses/components/course-detail-page";
import {
  curatedCourses,
  curatedVideos,
} from "../../../features/courses/data/curated-videos";
import {
  getVideoCourseLessonMatch,
  type VideoCourseLessonMatch,
} from "../../../features/courses/data/course-video-matches";
import { getCourseLearningPlan } from "../../../features/courses/data/course-curriculum";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ video?: string | string[] }>;
}

export default async function CoursePage({ params, searchParams }: CoursePageProps) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const course = curatedCourses.find((item) => item.id === courseId);

  if (!course) notFound();

  const videoId = Array.isArray(query.video) ? query.video[0] : query.video;
  const video =
    curatedVideos.find((item) => item.id === course.curatedVideoId) ??
    curatedVideos.find((item) => item.id === videoId);
  const matchedVideoCourse = video ? getVideoCourseLessonMatch(video) : undefined;
  const videoMatch: VideoCourseLessonMatch | undefined = video
    ? course.curatedVideoId === video.id
      ? {
          course,
          chapterTitle: getCourseLearningPlan(course).chapters[0]?.title ?? "",
          lesson: getCourseLearningPlan(course).chapters[0]?.lessons[0] ?? video.title,
          lessonIndex: 0,
        }
      : matchedVideoCourse?.course.id === course.id
        ? matchedVideoCourse
        : undefined
    : undefined;
  const selectedVideo = videoMatch ? video : undefined;

  return (
    <CourseDetailPage
      course={course}
      selectedVideo={selectedVideo}
      selectedVideoMatch={selectedVideo && videoMatch ? videoMatch : undefined}
    />
  );
}
