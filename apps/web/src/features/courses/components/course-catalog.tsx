"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLoginRequired } from "@classmate/ui/login-required-provider";
import { useTranslation } from "@classmate/ui/localization";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import type { Course } from "../types/course";
import { courseCategories } from "../types/course-category";
import { useCourses } from "../hooks/use-courses";
import { CourseCard } from "./course-card";

interface CourseCatalogProps {
  onSelect: (course: Course) => void;
}

const categories = ["전체", ...courseCategories.map(({ name }) => name)];
const PAGE_SIZE = 12;
const categoryTranslationKeys: Record<string, string> = {
  전체: "all",
  개발: "development",
  디자인: "design",
  "데이터 사이언스": "data",
  "업무 생산성": "productivity",
  "AI 기술": "ai",
  커리어: "career",
};

export function CourseCatalog({ onSelect }: CourseCatalogProps) {
  const [category, setCategory] = useState("전체");
  const [page, setPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user } = useDemoSession();
  const requestLogin = useLoginRequired();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) setFavorites([]);
  }, [user]);
  const { data: courses } = useCourses();

  const filteredCourses = useMemo(
    () => courses.filter((course) => category === "전체" || course.category === category),
    [category, courses],
  );
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const visibleCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
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
    <section className="class-section" id="classes">
      <div className="section-heading">
        <div>
          <div className="section-kicker">{t("pages.findNext")}</div>
          <h2>{t("pages.homeTitle")}<span>.</span></h2>
          <p>{t("pages.courseListDescription")}</p>
        </div>
        <a className="view-all" href="/classes">{t("pages.courseListTitle")} <ArrowRight size={16} /></a>
      </div>

      <div className="filter-row">
        <div className="category-tabs" role="tablist" aria-label={t("pages.courseCategoriesFilter")}>
          {categories.map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={category === item}
              className={`category-tab ${category === item ? "category-tab--active" : ""}`}
              onClick={() => {
                setCategory(item);
                setPage(1);
              }}
            >
              {t(`categories.${categoryTranslationKeys[item]}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="course-grid">
        {visibleCourses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            favorite={favorites.includes(course.id)}
            onSelect={onSelect}
            onToggleFavorite={toggleFavorite}
          />
        ))}
        {visibleCourses.length === 0 && (
          <div className="empty-state">{t("pages.missingCatalogCourses")}</div>
        )}
      </div>
      {pageCount > 1 && (
        <nav className="home-course-pagination" aria-label={t("pages.paginationLabel")}>
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
              className={page === pageNumber ? "home-course-pagination--active" : ""}
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
  );
}
