"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ExternalLink,
  Play,
  Users,
} from "lucide-react";
import type { Course } from "../types/course";
import { getCourseLearningPlan } from "../data/course-curriculum";
import {
  getCourseVideoSources,
  getLessonVideo,
  type VideoCourseLessonMatch,
} from "../data/course-video-matches";
import type { CuratedVideo } from "../data/curated-videos";
import { AccountMenu } from "@classmate/ui/account-menu";
import { CourseAccessLink } from "./course-access-link";
import { useTranslation } from "@classmate/ui/localization";

interface CourseDetailPageProps {
  course: Course;
  selectedVideo?: CuratedVideo;
  selectedVideoMatch?: VideoCourseLessonMatch;
}

const categoryTranslationKeys: Record<Course["category"], string> = {
  개발: "development",
  디자인: "design",
  "데이터 사이언스": "data",
  "업무 생산성": "productivity",
  "AI 기술": "ai",
  커리어: "career",
};

export function CourseDetailPage({
  course,
  selectedVideo,
  selectedVideoMatch,
}: CourseDetailPageProps) {
  const { t } = useTranslation();
  const title = course.title.replace(/\n/g, " ");
  const plan = getCourseLearningPlan(course);
  const videoSources = getCourseVideoSources(course);
  const lessonCount = plan.chapters.reduce(
    (total, chapter) => total + chapter.lessons.length,
    0,
  );

  return (
    <main className="course-detail-page">
      <header className="topbar course-detail-topbar">
        <Link className="brand" href="/" aria-label={t("pages.homeBack")}>
          <span className="brand-mark">✳</span>
          classmate<span className="brand-period">.</span>
        </Link>
        <nav className="course-detail-nav" aria-label={t("pages.mainNavigation")}>
          <Link className="nav-link nav-link--active" href="/classes">{t("nav.courses")}</Link>
          <Link className="nav-link" href="/#live">{t("nav.live")}</Link>
          <Link className="nav-link" href="/#teachers">{t("nav.creators")}</Link>
        </nav>
        <Link className="course-detail-home" href="/classes">{t("pages.courseListTitle")}</Link>
        <AccountMenu />
      </header>

      <div className="course-detail-content">
        <Link className="all-courses-back" href="/classes">
          <ArrowLeft size={15} /> {t("pages.courseListTitle")}
        </Link>

        <section className="course-detail-hero">
          <div className="course-detail-copy">
            <div className="course-detail-category">
              {t(`categories.${categoryTranslationKeys[course.category]}`)}<span>/</span>{course.subcategory}
            </div>
            <h1>{title}</h1>
            <p className="course-detail-summary">
              {t("pages.detailSummary", { subcategory: course.subcategory })}
            </p>
            <div className="course-detail-rating">
              <span><BookOpen size={15} /> {t("pages.sectionLessonCount", { sections: plan.chapters.length, lessons: lessonCount })}</span>
              <span><ExternalLink size={15} /> {t("lesson.sourceCount", { count: videoSources.length })}</span>
            </div>
            <div className="course-detail-instructor">
              <span className="course-instructor-avatar">{course.teacher.slice(0, 1)}</span>
              <span><small>{t("lesson.curation")}</small><strong>{course.teacher}</strong></span>
            </div>
            <CourseAccessLink
              className="button button--primary course-detail-cta"
              href={`/courses/${course.id}/watch`}
              requiresAuth={!course.curatedVideoId}
            >
              <Play size={16} fill="currentColor" /> {t("pages.openCourse")}
            </CourseAccessLink>
            <p className="course-detail-no-payment">
              {t("pages.freeVideoNotice")}
            </p>
          </div>
          <div
            className={`course-detail-cover${selectedVideo ? " course-detail-cover--video" : ""}`}
            role={selectedVideo ? undefined : "img"}
            aria-label={selectedVideo ? undefined : `${title} ${t("pages.openCourse")}`}
            style={{
              backgroundColor: course.color,
              backgroundImage: `url("${course.image}")`,
            }}
          >
            {selectedVideo ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}?rel=0`}
                title={`${selectedVideo.creator} - ${selectedVideo.title}`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <>
                <span className="course-detail-cover-label">{course.label}</span>
                <CourseAccessLink
                  className="course-detail-cover-play"
                  href={`/courses/${course.id}/watch`}
                  requiresAuth={!course.curatedVideoId}
                  ariaLabel={`${title} ${t("pages.videoPlayer")}`}
                >
                  <Play size={20} fill="currentColor" />
                </CourseAccessLink>
              </>
            )}
          </div>
        </section>
        {selectedVideo && (
          <p className="course-detail-no-payment course-detail-video-notice">
            {t("pages.publicVideoNotice")}
            {" · "}
            <a href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`} target="_blank" rel="noreferrer">
              {t("pages.openSource")}
            </a>
          </p>
        )}

        <div className="course-detail-layout">
          <div className="course-detail-main">
            <section className="course-detail-section course-detail-outcomes">
              <div className="course-detail-section-heading">
                <span>WHAT YOU'LL LEARN</span>
                <h2>{t("pages.learnTitle")}</h2>
              </div>
              <ul>
                {plan.outcomes.map((outcome) => (
                  <li key={outcome}><Check size={16} /> {outcome}</li>
                ))}
              </ul>
            </section>

            <section className="course-detail-section">
              <div className="course-detail-section-heading">
                <span>{t("pages.curriculum")}</span>
                <h2>{t("pages.curriculum")}</h2>
                <p>{t("pages.sectionLessonCount", { sections: plan.chapters.length, lessons: lessonCount })}</p>
              </div>
              {selectedVideo && selectedVideoMatch && (
                <div className="course-detail-video-match">
                  <span>{t("library.matchedVideoLabel")}</span>
                  <small>{t("library.matchedSession", {
                    course: title,
                    chapter: selectedVideoMatch.chapterTitle,
                    lesson: selectedVideoMatch.lesson,
                  })}</small>
                  <strong>{selectedVideo.title}</strong>
                  <p>{selectedVideo.summary}</p>
                  <CourseAccessLink
                    className="course-detail-session-link"
                    href={`/courses/${course.id}/watch?video=${encodeURIComponent(selectedVideo.id)}&lesson=${encodeURIComponent(selectedVideoMatch.lesson)}`}
                    requiresAuth={!course.curatedVideoId}
                  >
                    <Play size={14} fill="currentColor" /> {t("pages.watchThisSession")}
                  </CourseAccessLink>
                </div>
              )}
              {course.curatedVideoId && (
                <p className="course-detail-outline-notice">
                  {t("pages.videoOutlineNotice")}
                </p>
              )}
              <div className="course-curriculum">
                {plan.chapters.map((chapter, index) => (
                  <details className="course-curriculum-chapter" key={chapter.title} open={index === 0}>
                    <summary>
                      <span className="course-chapter-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="course-chapter-title">{chapter.title}<small>{t("pages.chapterLessonCount", { count: chapter.lessons.length })}</small></span>
                      <Clock3 size={15} />
                    </summary>
                    <ol>
                      {chapter.lessons.map((lesson, lessonIndex) => {
                        const lessonOffset = plan.chapters
                          .slice(0, index)
                          .reduce((total, previousChapter) => total + previousChapter.lessons.length, 0);
                        const source = getLessonVideo(course, lesson, lessonOffset + lessonIndex);
                        return (
                          <li key={lesson}>
                            <span><Play size={12} /> {lessonIndex + 1}. {lesson}</span>
                            <div className="course-lesson-actions">
                              {source && (
                                <CourseAccessLink
                                  className="course-lesson-watch"
                                  href={`/courses/${course.id}/watch?video=${encodeURIComponent(source.id)}&lesson=${encodeURIComponent(lesson)}`}
                                  requiresAuth={!course.curatedVideoId}
                                  ariaLabel={`${t("pages.watchThisSession")}: ${source.title}`}
                                >
                                  <Play size={13} /> {t("pages.watchThisSession")}
                                </CourseAccessLink>
                              )}
                              {!course.curatedVideoId && (
                                <small>{8 + ((index * 7 + lessonIndex * 5) % 12)}분</small>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </details>
                ))}
              </div>
            </section>

            <section className="course-detail-section course-detail-project">
              <div className="course-detail-section-heading">
                <span>{t("pages.projectEyebrow")}</span>
                <h2>{t("pages.projectTitle")}</h2>
              </div>
              <p>{plan.project}</p>
            </section>

            <section className="course-detail-section course-detail-requirements">
              <div className="course-detail-section-heading">
                <span>{t("pages.audienceEyebrow")}</span>
                <h2>{t("pages.audienceTitle")}</h2>
              </div>
              <ul>
                {plan.requirements.map((requirement) => (
                  <li key={requirement}><Check size={16} /> {requirement}</li>
                ))}
              </ul>
            </section>

            <section className="course-instructor-card">
              <span className="course-instructor-avatar course-instructor-avatar--large">
                {course.teacher.slice(0, 1)}
              </span>
              <div>
                <small>{t("pages.curationProfile")}</small>
                <h2>{course.teacher}</h2>
                <p>{t("pages.curationBio", { subcategory: course.subcategory })}</p>
              </div>
              <CourseAccessLink href={`/courses/${course.id}/watch`} requiresAuth={!course.curatedVideoId}>{t("pages.openCourse")} <ArrowRight size={15} /></CourseAccessLink>
            </section>
          </div>

          <aside className="course-detail-aside">
            <strong>{t("pages.studyAtYourPace")}</strong>
            <span><BookOpen size={16} /> {t("lesson.sourceCount", { count: videoSources.length })}</span>
            <span><Clock3 size={16} /> {t("pages.sectionCurriculum")}</span>
            <span><Users size={16} /> {t("pages.liveChatAndQa")}</span>
            <CourseAccessLink className="button button--primary" href={`/courses/${course.id}/watch`} requiresAuth={!course.curatedVideoId}>
              <Play size={15} fill="currentColor" /> {t("pages.openCourse")}
            </CourseAccessLink>
          </aside>
        </div>
      </div>
      <footer className="footer course-detail-footer">
        <Link className="brand" href="/"><span className="brand-mark">✳</span>classmate<span className="brand-period">.</span></Link>
        <span>{t("pages.footerTagline")}</span>
        <Link href="/classes">{t("pages.courseListTitle")}</Link>
        <span>© 2026 Classmate Studio</span>
      </footer>
    </main>
  );
}
