import type { Course } from "../types/course";
import { curatedCourses, curatedVideos, type CuratedVideo } from "./curated-videos";
import { getCourseLearningPlan } from "./course-curriculum";

export interface VideoCourseLessonMatch {
  course: Course;
  chapterTitle: string;
  lesson: string;
  lessonIndex: number;
}

const ignoredTerms = new Set([
  "그리고",
  "만들기",
  "이해하기",
  "실전",
  "기초",
  "실무",
  "핵심",
  "프로젝트",
  "서비스",
]);
const courseSourceCache = new Map<string, CuratedVideo[]>();
const videoMatchCache = new Map<string, VideoCourseLessonMatch>();

function terms(value: string) {
  return value
    .toLocaleLowerCase("ko-KR")
    .split(/[\s·,()[\]{}]+/)
    .filter((term) => term.length > 1 && !ignoredTerms.has(term));
}

function scoreSource(course: Course, lesson: string, video: CuratedVideo) {
  const exactSubcategory = video.subcategories.includes(course.subcategory) ? 100 : 0;
  const courseTerms = new Set(terms(`${course.title} ${course.subcategory}`));
  const lessonTerms = new Set(terms(lesson));
  const keywordMatches = video.keywords.filter((keyword) => {
    const normalized = keyword.toLocaleLowerCase("ko-KR");
    return (
      courseTerms.has(normalized) ||
      lessonTerms.has(normalized) ||
      [...courseTerms, ...lessonTerms].some(
        (term) => term.length > 2 && (normalized.includes(term) || term.includes(normalized)),
      )
    );
  }).length;
  const videoContext = `${video.title} ${video.summary}`.toLocaleLowerCase("ko-KR");
  const lessonContext = lesson.toLocaleLowerCase("ko-KR");
  const intentMatches = [
    [/소개|입문|기초|개념|시작/, /목표|개념|환경|문제 정의|기초/],
    [/만들|구현|제작|프로젝트|개발/, /기능 구현|만들|완성|프로젝트|구성|연결/],
    [/성능|최적화|개선|검증|테스트/, /성능|개선|검증|테스트|평가/],
  ].filter(([videoIntent, lessonIntent]) =>
    videoIntent.test(videoContext) && lessonIntent.test(lessonContext),
  ).length;
  return exactSubcategory + keywordMatches * 10 + intentMatches * 20;
}

export function getLessonVideo(
  course: Course,
  lesson: string,
  lessonIndex: number,
): CuratedVideo | undefined {
  if (course.curatedVideoId) {
    return curatedVideos.find((video) => video.id === course.curatedVideoId);
  }

  const subcategoryCandidates = curatedVideos.filter((video) =>
    video.subcategories.includes(course.subcategory),
  );
  const sourcePool = subcategoryCandidates.length > 0
    ? subcategoryCandidates
    : curatedVideos.filter((video) => video.category === course.category);
  const candidates = sourcePool
    .map((video) => ({ video, score: scoreSource(course, lesson, video) }))
    .sort((first, second) => second.score - first.score);

  if (candidates.length === 0) return undefined;

  const bestScore = candidates[0].score;
  const relevant = bestScore > 0
    ? candidates.filter((candidate) => candidate.score === bestScore)
    : candidates;
  return relevant[((lessonIndex % relevant.length) + relevant.length) % relevant.length].video;
}

export function getCourseVideoSources(course: Course): CuratedVideo[] {
  if (course.curatedVideoId) {
    const video = curatedVideos.find((item) => item.id === course.curatedVideoId);
    return video ? [video] : [];
  }

  const cachedSources = courseSourceCache.get(course.id);
  if (cachedSources) return cachedSources;

  const lessons = getCourseLearningPlan(course).chapters.flatMap(
    (chapter) => chapter.lessons,
  );
  const sources = new Map<string, CuratedVideo>();

  lessons.forEach((lesson, index) => {
    const source = getLessonVideo(course, lesson, index);
    if (source) sources.set(source.id, source);
  });

  const result = [...sources.values()];
  courseSourceCache.set(course.id, result);
  return result;
}

export function getVideoCourseLessonMatch(
  video: CuratedVideo,
): VideoCourseLessonMatch | undefined {
  const cachedMatch = videoMatchCache.get(video.id);
  if (cachedMatch) return cachedMatch;

  const course = curatedCourses.find((item) => item.curatedVideoId === video.id);
  if (!course) return undefined;

  const plan = getCourseLearningPlan(course);
  const chapter = plan.chapters[0];
  const lesson = chapter?.lessons[0];
  if (!chapter || !lesson) return undefined;

  const match = { course, chapterTitle: chapter.title, lesson, lessonIndex: 0 };
  videoMatchCache.set(video.id, match);
  return match;
}
