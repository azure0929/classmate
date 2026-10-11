"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountMenu } from "@classmate/ui/account-menu";
import { useTranslation } from "@classmate/ui/localization";
import {
  curatedVideos,
  learningCategories,
  type LearningCategory,
} from "../data/curated-videos";
import { getVideoCourseLessonMatch } from "../data/course-video-matches";

const categoryTranslationKeys: Record<LearningCategory | "전체", string> = {
  전체: "all",
  개발: "development",
  디자인: "design",
  "데이터 사이언스": "data",
  "업무 생산성": "productivity",
  "AI 기술": "ai",
  커리어: "career",
};

export function VideoLibrary() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<LearningCategory | "전체">("전체");
  const videos =
    category === "전체"
      ? curatedVideos
      : curatedVideos.filter((video) => video.category === category);

  return (
    <main className="video-library-page">
      <header className="topbar video-library-header">
        <Link className="brand" href="/" aria-label={t("pages.homeBack")}>
          <span className="brand-mark">✳</span>
          classmate<span className="brand-period">.</span>
        </Link>
        <nav className="course-detail-nav" aria-label={t("pages.mainNavigation")}>
          <Link className="nav-link" href="/classes">{t("nav.courses")}</Link>
          <Link className="nav-link nav-link--active" href="/resources">{t("nav.videos")}</Link>
          <Link className="nav-link" href="/#live">{t("nav.live")}</Link>
        </nav>
        <AccountMenu />
      </header>

      <section className="video-library-content">
        <div className="section-kicker">{t("library.eyebrow")}</div>
        <h1>{t("library.title")}<span>.</span></h1>
        <p className="video-library-intro">
          {t("library.description")}
        </p>
        <div className="video-library-filters" role="group" aria-label={t("pages.videoLibraryFilter")}>
          {(["전체", ...learningCategories] as const).map((item) => {
            return (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={category === item ? "video-library-filter--active" : ""}
              onClick={() => setCategory(item)}
            >
              {t(`categories.${categoryTranslationKeys[item]}`)}
            </button>
            );
          })}
        </div>
        <p className="video-library-count" aria-live="polite">
          {t("library.count", { count: videos.length })}
        </p>
        <div className="video-library-grid">
          {videos.map((video) => {
            const match = getVideoCourseLessonMatch(video);
            return (
              <article className="public-video-card" key={video.id}>
                <div className="public-video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`}
                    title={`${video.creator} - ${video.title}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="public-video-copy">
                  <span>{t(`categories.${categoryTranslationKeys[video.category]}`)}</span>
                  <h2>{video.title}</h2>
                  <p>{video.summary}</p>
                  {match && (
                    <p className="public-video-course-match">
                      {t("library.matchedSession", {
                        course: match.course.title,
                        chapter: match.chapterTitle,
                        lesson: match.lesson,
                      })}
                    </p>
                  )}
                  <div>
                    <strong>{video.creator}</strong>
                    <a href={video.channelUrl} target="_blank" rel="noreferrer">
                      {t("library.channel")}
                    </a>
                  </div>
                  {match && (
                    <Link
                      className="public-video-course-link"
                      href={`/courses/${match.course.id}?video=${encodeURIComponent(video.id)}`}
                    >
                      {t("library.openMatchedCourse")}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <p className="video-library-disclaimer">
          {t("pages.videoLibraryDisclaimer")}
        </p>
      </section>
      <footer className="footer video-library-footer">
        <Link className="brand" href="/">
          <span className="brand-mark">✳</span>classmate<span className="brand-period">.</span>
        </Link>
        <Link href="/classes">{t("pages.browseCourses")}</Link>
        <span>{t("pages.videoLibraryFooter")}</span>
      </footer>
    </main>
  );
}
