"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search, Sparkles, X } from "lucide-react";
import { AccountMenu } from "@classmate/ui/account-menu";
import { AuthDialog, type AuthUser } from "@classmate/ui/auth-dialog";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import { mockCourses } from "../api/mock-courses";
import type { Course } from "../types/course";
import { courseCategories } from "../types/course-category";
import { CourseCard } from "./course-card";

const categories = ["전체", ...courseCategories.map(({ name }) => name)];
const sortOptions = ["추천 순", "낮은 가격순", "높은 가격 순", "평점 순", "인기 순"] as const;
const PAGE_SIZE = 20;
type SortOption = (typeof sortOptions)[number];

function popularity(course: Course) {
  return Number(course.students.replaceAll(",", ""));
}

function recommendationScore(course: Course) {
  return Number(course.rating) * 100 + Math.log1p(popularity(course)) * 2;
}

function compareCourses(sort: SortOption, first: Course, second: Course) {
  switch (sort) {
    case "낮은 가격순":
      return first.price - second.price;
    case "높은 가격 순":
      return second.price - first.price;
    case "평점 순":
      return Number(second.rating) - Number(first.rating);
    case "인기 순":
      return popularity(second) - popularity(first);
    case "추천 순":
      return recommendationScore(second) - recommendationScore(first);
  }
}

export function AllCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(queryParam);
  const [submittedSearch, setSubmittedSearch] = useState(queryParam);
  const [category, setCategory] = useState("전체");
  const [subcategory, setSubcategory] = useState("전체");
  const [sort, setSort] = useState<SortOption>("추천 순");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState<string | null>(null);
  const { user, login } = useDemoSession();

  useEffect(() => {
    if (!user) setFavorites([]);
  }, [user]);

  useEffect(() => {
    setSearch(queryParam);
    setSubmittedSearch(queryParam);
    setPage(1);
  }, [queryParam]);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = submittedSearch.trim().toLocaleLowerCase("ko-KR");
    return mockCourses
      .filter((course) => category === "전체" || course.category === category)
      .filter((course) => subcategory === "전체" || course.subcategory === subcategory)
      .filter(
        (course) =>
          !normalizedSearch ||
          `${course.title} ${course.teacher} ${course.category} ${course.subcategory}`
            .toLocaleLowerCase("ko-KR")
            .includes(normalizedSearch),
      )
      .sort((first, second) => compareCourses(sort, first, second));
  }, [category, sort, submittedSearch, subcategory]);

  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const visibleCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    setSubmittedSearch(query);
    router.replace(query ? `/classes?q=${encodeURIComponent(query)}` : "/classes");
    setPage(1);
  };

  const toggleFavorite = (courseId: string) => {
    if (!user) {
      window.alert("로그인을 해주세요.");
      setPendingFavorite(courseId);
      setShowAuth(true);
      return;
    }
    setFavorites((current) =>
      current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId],
    );
  };

  return (
    <main className="all-courses-page">
      <header className="topbar all-courses-topbar">
        <a className="brand" href="/" aria-label="Classmate 홈">
          <span className="brand-mark"><Sparkles size={17} /></span>
          classmate<span className="brand-period">.</span>
        </a>
        <nav className="all-courses-nav" aria-label="메인 메뉴">
          <a className="nav-link nav-link--active" href="/classes">강의</a>
          <a className="nav-link" href="/resources">무료 영상</a>
          <a className="nav-link" href="/#live">라이브</a>
          <a className="nav-link" href="/#teachers">크리에이터</a>
        </nav>
        <form className="search-box all-courses-search" onSubmit={handleSearch} role="search">
          <Search size={16} />
          <input
            aria-label="강의 검색"
            placeholder="강의명, 기술, 강사 검색"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              className="all-courses-clear"
              type="button"
              aria-label="검색어 지우기"
              onClick={() => {
                setSearch("");
                setSubmittedSearch("");
                setPage(1);
                router.replace("/classes");
              }}
            >
              <X size={14} />
            </button>
          )}
          <button className="search-submit" aria-label="강의 검색 실행" type="submit">
            <Search size={16} />
          </button>
        </form>
        <AccountMenu />
      </header>

      <section className="all-courses-content">
        <a className="all-courses-back" href="/">
          <ArrowLeft size={15} /> 홈으로 돌아가기
        </a>
        <div className="all-courses-heading">
          <div>
            <div className="section-kicker">FIND YOUR NEXT THING</div>
            <h1>모든 강의<span>.</span></h1>
            <p>관심 있는 기술과 분야를 선택해 나에게 맞는 학습을 시작해 보세요.</p>
          </div>
          <div className="all-courses-total" aria-live="polite">
              <strong>{filteredCourses.length}</strong>개의 강의
          </div>
        </div>

          <div className="all-courses-categories" role="tablist" aria-label="강의 분야">
          {categories.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={category === item}
              className={`category-tab${category === item ? " category-tab--active" : ""}`}
              onClick={() => {
                setCategory(item);
                setSubcategory("전체");
                setPage(1);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {category !== "전체" && (
          <div className="all-courses-subcategories" role="group" aria-label={`${category} 세부 분야`}>
            <span>세부 분야</span>
            <div>
              <button
                className={subcategory === "전체" ? "all-courses-subcategory--active" : ""}
                aria-pressed={subcategory === "전체"}
                onClick={() => {
                  setSubcategory("전체");
                  setPage(1);
                }}
              >
                전체
              </button>
              {courseCategories.find(({ name }) => name === category)?.subcategories.map((item) => (
                <button
                  key={item}
                  className={subcategory === item ? "all-courses-subcategory--active" : ""}
                  aria-pressed={subcategory === item}
                  onClick={() => {
                    setSubcategory(item);
                    setPage(1);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="all-courses-toolbar">
          <div className="all-courses-sort" role="tablist" aria-label="강의 정렬">
            {sortOptions.map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={sort === item}
                className={sort === item ? "all-courses-sort--active" : ""}
                onClick={() => {
                  setSort(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="all-courses-page-count">{page} / {pageCount} 페이지</span>
        </div>

        {visibleCourses.length > 0 ? (
          <div className="course-grid all-courses-grid">
            {visibleCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                favorite={favorites.includes(course.id)}
                onSelect={(course) => router.push(`/courses/${course.id}`)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="all-courses-empty">
            <Search size={22} />
            <strong>검색 결과가 없어요.</strong>
            <span>다른 검색어를 입력하거나 카테고리를 바꿔보세요.</span>
          </div>
        )}

        {pageCount > 1 && (
          <nav className="all-courses-pagination" aria-label="강의 목록 페이지">
            <button
              aria-label="이전 페이지"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft size={15} />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                aria-label={`${pageNumber}페이지`}
                aria-current={page === pageNumber ? "page" : undefined}
                className={page === pageNumber ? "all-courses-pagination--active" : ""}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              aria-label="다음 페이지"
              disabled={page === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            >
              <ArrowRight size={15} />
            </button>
          </nav>
        )}
      </section>

      <footer className="footer all-courses-footer">
        <a className="brand" href="/"><span className="brand-mark"><Sparkles size={15} /></span>classmate<span className="brand-period">.</span></a>
        <span>좋아하는 마음이 배움이 되는 곳</span>
        <a href="mailto:support@classmate.kr">고객센터</a>
        <span>© 2026 Classmate Studio</span>
      </footer>

      {showAuth && (
        <AuthDialog
          initialMode="login"
          onAuthenticated={(nextUser: AuthUser) => {
            login(nextUser);
            if (pendingFavorite) {
              setFavorites((current) =>
                current.includes(pendingFavorite)
                  ? current.filter((id) => id !== pendingFavorite)
                  : [...current, pendingFavorite],
              );
              setPendingFavorite(null);
            }
            setShowAuth(false);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </main>
  );
}
