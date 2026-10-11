import type { Course } from "../types/course";
import { getCourseLearningPlan } from "./course-curriculum";
import { curatedVideos, type CuratedVideo } from "./curated-videos";

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
  return exactSubcategory + keywordMatches * 10;
}

export function getLessonVideo(
  course: Course,
  lesson: string,
  lessonIndex: number,
): CuratedVideo | undefined {
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
