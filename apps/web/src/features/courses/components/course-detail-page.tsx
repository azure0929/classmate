import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Play,
  Star,
  Users,
} from "lucide-react";
import type { Course } from "../types/course";
import { getCourseLearningPlan } from "../data/course-curriculum";
import { AccountMenu } from "@classmate/ui/account-menu";
import { CourseAccessLink } from "./course-access-link";

interface CourseDetailPageProps {
  course: Course;
}

export function CourseDetailPage({ course }: CourseDetailPageProps) {
  const title = course.title.replace(/\n/g, " ");
  const plan = getCourseLearningPlan(course);
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
          <Link className="nav-link nav-link--active" href="/classes">강의</Link>
          <Link className="nav-link" href="/resources">무료 영상</Link>
          <Link className="nav-link" href="/#live">라이브</Link>
          <Link className="nav-link" href="/#teachers">크리에이터</Link>
        </nav>
        <Link className="course-detail-home" href="/classes">전체 강의 보기</Link>
        <AccountMenu />
      </header>

      <div className="course-detail-content">
        <Link className="all-courses-back" href="/classes">
          <ArrowLeft size={15} /> 강의 목록으로
        </Link>

        <section className="course-detail-hero">
          <div className="course-detail-copy">
            <div className="course-detail-category">
              {course.category}<span>/</span>{course.subcategory}
            </div>
            <h1>{title}</h1>
            <p className="course-detail-summary">
              {course.subcategory}의 핵심부터 실무 적용까지, {course.teacher}와 함께
              단계별로 완성해요.
            </p>
            <div className="course-detail-rating">
              <span><Star size={15} fill="currentColor" /> {course.rating}</span>
              <span><Users size={15} /> {course.students}명 수강</span>
              <span><BookOpen size={15} /> {plan.chapters.length}개 섹션 · {lessonCount}개 강의</span>
            </div>
            <div className="course-detail-instructor">
              <span className="course-instructor-avatar">{course.teacher.slice(0, 1)}</span>
              <span><small>지식공유자</small><strong>{course.teacher}</strong></span>
            </div>
            <CourseAccessLink className="button button--primary course-detail-cta" href={`/courses/${course.id}/watch`}>
              <Play size={16} fill="currentColor" /> 보러가기
            </CourseAccessLink>
            <p className="course-detail-no-payment">결제 없이 데모 VOD와 학습 기능을 바로 둘러볼 수 있어요.</p>
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
              ariaLabel={`${title} VOD 보러가기`}
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
                <h2>커리큘럼</h2>
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
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <li key={lesson}>
                          <span><Play size={12} /> {lessonIndex + 1}. {lesson}</span>
                          <small>{8 + ((index * 7 + lessonIndex * 5) % 12)}분</small>
                        </li>
                      ))}
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
                <small>지식공유자</small>
                <h2>{course.teacher}</h2>
                <p>{course.subcategory} 분야의 실무 경험을 학습자가 따라 하기 쉬운 과정으로 나눕니다.</p>
              </div>
              <CourseAccessLink href={`/courses/${course.id}/watch`}>강의 보러가기 <ArrowRight size={15} /></CourseAccessLink>
            </section>
          </div>

          <aside className="course-detail-aside">
            <strong>내 속도에 맞춰 학습해요</strong>
            <span><BookOpen size={16} /> VOD 강의로 원하는 때에</span>
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
