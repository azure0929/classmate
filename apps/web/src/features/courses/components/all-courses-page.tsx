"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search, Sparkles, X } from "lucide-react";
import { AccountMenu } from "@classmate/ui/account-menu";
import { useLoginRequired } from "@classmate/ui/login-required-provider";
import { useTranslation } from "@classmate/ui/localization";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import { curatedCourses } from "../data/curated-videos";
import type { Course } from "../types/course";
import { courseCategories } from "../types/course-category";
import { CourseCard } from "./course-card";

const categories = ["전체", ...courseCategories.map(({ name }) => name)];
const sortOptions = ["추천 순", "낮은 가격순", "높은 가격 순", "평점 순", "인기 순"] as const;
const PAGE_SIZE = 20;
type SortOption = (typeof sortOptions)[number];
const sortTranslationKeys: Record<SortOption, string> = {
  "추천 순": "pages.sortRecommended",
  "낮은 가격순": "pages.sortLowPrice",
  "높은 가격 순": "pages.sortHighPrice",
  "평점 순": "pages.sortRating",
  "인기 순": "pages.sortPopular",
};
const categoryTranslationKeys: Record<string, string> = {
  전체: "all",
  개발: "development",
  디자인: "design",
  "데이터 사이언스": "data",
  "업무 생산성": "productivity",
  "AI 기술": "ai",
  커리어: "career",
};

function popularity(course: Course) {
  return Number(course.students?.replaceAll(",", "") ?? 0);
}

function recommendationScore(course: Course) {
  return Number(course.rating ?? 0) * 100 + Math.log1p(popularity(course)) * 2;
}

function compareCourses(sort: SortOption, first: Course, second: Course) {
  switch (sort) {
    case "낮은 가격순":
      return first.price - second.price;
    case "높은 가격 순":
      return second.price - first.price;
    case "평점 순":
      return Number(second.rating ?? 0) - Number(first.rating ?? 0);
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
  const { user } = useDemoSession();
  const requestLogin = useLoginRequired();
  const { t } = useTranslation();

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
    return curatedCourses
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
  const hasRatingData = filteredCourses.some((course) => course.rating !== undefined);
  const hasPopularityData = filteredCourses.some((course) => course.students !== undefined);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    setSubmittedSearch(query);
    router.replace(query ? `/classes?q=${encodeURIComponent(query)}` : "/classes");
    setPage(1);
  };

  const toggleFavorite = (courseId: string) => {
    if (!user) {
      requestLogin(() => {
        setFavorites((current) =>
          current.includes(courseId)
            ? current.filter((id) => id !== courseId)
            : [...current, courseId],
        );
      });
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
        <nav className="all-courses-nav" aria-label={t("pages.mainNavigation")}>
          <a className="nav-link nav-link--active" href="/classes">{t("nav.courses")}</a>
          <a className="nav-link" href="/#live">{t("nav.live")}</a>
          <a className="nav-link" href="/#teachers">{t("nav.creators")}</a>
        </nav>
        <form className="search-box all-courses-search" onSubmit={handleSearch} role="search">
          <Search size={16} />
          <input
            aria-label={t("pages.searchAria")}
            placeholder={t("pages.searchPlaceholder")}
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
              aria-label={t("pages.searchClear")}
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
          <button className="search-submit" aria-label={t("pages.searchSubmit")} type="submit">
            <Search size={16} />
          </button>
        </form>
        <AccountMenu />
      </header>

      <section className="all-courses-content">
        <a className="all-courses-back" href="/">
          <ArrowLeft size={15} /> {t("pages.homeBack")}
        </a>
        <div className="all-courses-heading">
          <div>
            <div className="section-kicker">{t("pages.findNext")}</div>
            <h1>{t("pages.courseListTitle")}<span>.</span></h1>
            <p>{t("pages.courseListDescription")}</p>
          </div>
          <div className="all-courses-total" aria-live="polite">
              {t("pages.courseCount", { count: filteredCourses.length })}
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
              {t(`categories.${categoryTranslationKeys[item]}`)}
            </button>
          ))}
        </div>

        {category !== "전체" && (
          <div className="all-courses-subcategories" role="group" aria-label={`${category} ${t("pages.subcategory")}`}>
            <span>{t("pages.subcategory")}</span>
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
          <div className="all-courses-sort" role="tablist" aria-label={t("pages.sortAria")}>
            {sortOptions.map((item) => (
              <button
                key={item}
                role="tab"
                aria-selected={sort === item}
                disabled={
                  (item === "평점 순" && !hasRatingData) ||
                  (item === "인기 순" && !hasPopularityData)
                }
                title={
                  (item === "평점 순" && !hasRatingData) ||
                  (item === "인기 순" && !hasPopularityData)
                    ? t("pages.courseSortUnavailable")
                    : undefined
                }
                className={sort === item ? "all-courses-sort--active" : ""}
                onClick={() => {
                  setSort(item);
                  setPage(1);
                }}
              >
                {t(sortTranslationKeys[item])}
              </button>
            ))}
          </div>
          <span className="all-courses-page-count">{t("pages.pageOfTotal", { page, total: pageCount })}</span>
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
            <strong>{t("pages.emptySearchTitle")}</strong>
            <span>{t("pages.emptySearchDescription")}</span>
          </div>
        )}

        {pageCount > 1 && (
          <nav className="all-courses-pagination" aria-label={t("pages.paginationLabel")}>
            <button
              aria-label={t("pages.previousPage")}
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft size={15} />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                aria-label={t("pages.pageNumber", { page: pageNumber })}
                aria-current={page === pageNumber ? "page" : undefined}
                className={page === pageNumber ? "all-courses-pagination--active" : ""}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button
              aria-label={t("pages.nextPage")}
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
      <span>{t("pages.footerTagline")}</span>
      <a href="mailto:support@classmate.kr">{t("pages.support")}</a>
        <span>© 2026 Classmate Studio</span>
      </footer>

    </main>
  );
}
