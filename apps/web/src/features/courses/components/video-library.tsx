"use client";

import { useState } from "react";
import Link from "next/link";
import { AccountMenu } from "@classmate/ui/account-menu";
import {
  curatedVideos,
  learningCategories,
  type LearningCategory,
} from "../data/curated-videos";

export function VideoLibrary() {
  const [category, setCategory] = useState<LearningCategory | "전체">("전체");
  const videos =
    category === "전체"
      ? curatedVideos
      : curatedVideos.filter((video) => video.category === category);

  return (
    <main className="video-library-page">
      <header className="topbar video-library-header">
        <Link className="brand" href="/" aria-label="Classmate 홈">
          <span className="brand-mark">✳</span>
          classmate<span className="brand-period">.</span>
        </Link>
        <nav className="course-detail-nav" aria-label="메인 메뉴">
          <Link className="nav-link" href="/classes">강의</Link>
          <Link className="nav-link nav-link--active" href="/resources">무료 영상</Link>
          <Link className="nav-link" href="/#live">라이브</Link>
        </nav>
        <AccountMenu />
      </header>

      <section className="video-library-content">
        <div className="section-kicker">OPEN LEARNING LIBRARY</div>
        <h1>좋은 공개 영상으로 시작하는 배움<span>.</span></h1>
        <p className="video-library-intro">
          개발자가 직접 고른 크리에이터의 공개 영상을 공식 YouTube 임베드로 연결합니다.
          영상은 원본 채널에서 재생되며, 언제든 원본을 방문할 수 있어요.
        </p>
        <div className="video-library-filters" role="group" aria-label="영상 분야">
          {(["전체", ...learningCategories] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={category === item ? "video-library-filter--active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="video-library-count" aria-live="polite">
          {videos.length}개의 공개 영상
        </p>
        <div className="video-library-grid">
          {videos.map((video) => (
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
                <span>{video.category}</span>
                <h2>{video.title}</h2>
                <p>{video.summary}</p>
                <div>
                  <strong>{video.creator}</strong>
                  <a href={video.channelUrl} target="_blank" rel="noreferrer">
                    채널 방문
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="video-library-disclaimer">
          영상 제목과 재생 권한은 각 크리에이터가 관리합니다. 재생이 제한된 영상은
          채널에서 확인해 주세요.
        </p>
      </section>
      <footer className="footer video-library-footer">
        <Link className="brand" href="/">
          <span className="brand-mark">✳</span>classmate<span className="brand-period">.</span>
        </Link>
        <Link href="/classes">강의 둘러보기</Link>
        <span>공개 콘텐츠는 원본 채널의 권리를 존중해 임베드로 제공합니다.</span>
      </footer>
    </main>
  );
}
