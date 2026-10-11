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
import { getCourseVideoSources, getLessonVideo } from "../data/course-video-matches";
import { AccountMenu } from "@classmate/ui/account-menu";
import { CourseAccessLink } from "./course-access-link";
import { useTranslation } from "@classmate/ui/localization";

interface CourseDetailPageProps {
  course: Course;
}

export function CourseDetailPage({ course }: CourseDetailPageProps) {
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
        <Link className="brand" href="/" aria-label="Classmate 홈">
          <span className="brand-mark">✳</span>
          classmate<span className="brand-period">.</span>
        </Link>
        <nav className="course-detail-nav" aria-label="메인 메뉴">
          <Link className="nav-link nav-link--active" href="/classes">{t("nav.courses")}</Link>
          <Link className="nav-link" href="/resources">{t("nav.videos")}</Link>
          <Link className="nav-link" href="/#live">{t("nav.live")}</Link>
          <Link className="nav-link" href="/#teachers">{t("nav.creators")}</Link>
        </nav>
        <Link className="course-detail-home" href="/classes">전체 강의 보기</Link>
        <AccountMenu />
      </header>

      <div className="course-detail-content">
        <Link className="all-courses-back" href="/classes">
          <ArrowLeft size={15} /> {t("pages.courseListTitle")}
        </Link>

        <section className="course-detail-hero">
          <div className="course-detail-copy">
            <div className="course-detail-category">
              {course.category}<span>/</span>{course.subcategory}
            </div>
            <h1>{title}</h1>
            <p className="course-detail-summary">
            {course.subcategory}의 핵심을 익히고 실무 흐름에 적용하는 Classmate 큐레이션 커리큘럼입니다.
            각 섹션에는 관련 주제를 다루는 국내 크리에이터의 공개 영상을 연결했어요.
            </p>
            <div className="course-detail-rating">
              <span><BookOpen size={15} /> {plan.chapters.length}개 섹션 · {lessonCount}개 강의</span>
              <span><ExternalLink size={15} /> {t("lesson.sourceCount", { count: videoSources.length })}</span>
            </div>
            <div className="course-detail-instructor">
              <span className="course-instructor-avatar">{course.teacher.slice(0, 1)}</span>
              <span><small>{t("lesson.curation")}</small><strong>{course.teacher}</strong></span>
            </div>
            <CourseAccessLink className="button button--primary course-detail-cta" href={`/courses/${course.id}/watch`}>
              <Play size={16} fill="currentColor" /> 보러가기
            </CourseAccessLink>
            <p className="course-detail-no-payment">
              무료 공개 영상을 학습 참고 자료로 제공합니다. 원본 영상의 저작권과 재생은 각 크리에이터에게 있습니다.
            </p>
          </div>
          <div
            className="course-detail-cover"
            role="img"
            aria-label={`${title} 강의 대표 이미지`}
            style={{
              backgroundColor: course.color,
              backgroundImage: `url("${course.image}")`,
            }}
          >
            <span className="course-detail-cover-label">{course.label}</span>
            <CourseAccessLink
              className="course-detail-cover-play"
              href={`/courses/${course.id}/watch`}
              ariaLabel={`${title} ${t("pages.videoPlayer")}`}
            >
              <Play size={20} fill="currentColor" />
            </CourseAccessLink>
          </div>
        </section>

        <div className="course-detail-layout">
          <div className="course-detail-main">
            <section className="course-detail-section course-detail-outcomes">
              <div className="course-detail-section-heading">
                <span>WHAT YOU'LL LEARN</span>
                <h2>이 강의에서 배울 내용</h2>
              </div>
              <ul>
                {plan.outcomes.map((outcome) => (
                  <li key={outcome}><Check size={16} /> {outcome}</li>
                ))}
              </ul>
            </section>

            <section className="course-detail-section">
              <div className="course-detail-section-heading">
                <span>CURRICULUM</span>
                <h2>{t("pages.curriculum")}</h2>
                <p>{plan.chapters.length}개 섹션 · {lessonCount}개 강의로 차근차근 학습해요.</p>
              </div>
              <div className="course-curriculum">
                {plan.chapters.map((chapter, index) => (
                  <details className="course-curriculum-chapter" key={chapter.title} open={index === 0}>
                    <summary>
                      <span className="course-chapter-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="course-chapter-title">{chapter.title}<small>{chapter.lessons.length}개 강의</small></span>
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
                                <a
                                  href={`https://www.youtube.com/watch?v=${source.videoId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`${t("lesson.publicResource")}: ${source.title}`}
                                >
                                  <ExternalLink size={13} /> {source.creator}
                                </a>
                              )}
                              <small>{8 + ((index * 7 + lessonIndex * 5) % 12)}분</small>
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
                <span>HANDS-ON PROJECT</span>
                <h2>강의 완주 후 만들 결과물</h2>
              </div>
              <p>{plan.project}</p>
            </section>

            <section className="course-detail-section course-detail-requirements">
              <div className="course-detail-section-heading">
                <span>BEFORE YOU START</span>
                <h2>이런 분께 추천해요</h2>
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
                <small>{t("lesson.curation")}</small>
                <h2>{course.teacher}</h2>
                <p>
                  {course.subcategory} 학습 흐름을 구성하고 국내 크리에이터의 공개 영상을 섹션별 참고 자료로 연결합니다.
                </p>
              </div>
              <CourseAccessLink href={`/courses/${course.id}/watch`}>{t("pages.videoPlayer")} <ArrowRight size={15} /></CourseAccessLink>
            </section>
          </div>

          <aside className="course-detail-aside">
            <strong>{t("pages.relatedVideos")}</strong>
            <span><BookOpen size={16} /> {t("lesson.sourceCount", { count: videoSources.length })}</span>
            <span><Clock3 size={16} /> 섹션별 커리큘럼 제공</span>
            <span><Users size={16} /> 실시간 소통과 공개 Q&A</span>
            <CourseAccessLink className="button button--primary" href={`/courses/${course.id}/watch`}>
              <Play size={15} fill="currentColor" /> 보러가기
            </CourseAccessLink>
          </aside>
        </div>
      </div>
      <footer className="footer course-detail-footer">
        <Link className="brand" href="/"><span className="brand-mark">✳</span>classmate<span className="brand-period">.</span></Link>
        <span>좋아하는 마음이 배움이 되는 곳</span>
        <Link href="/classes">강의 목록</Link>
        <span>© 2026 Classmate Studio</span>
      </footer>
    </main>
  );
}
