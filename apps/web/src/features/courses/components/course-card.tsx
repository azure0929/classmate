"use client";

import { ArrowRight, Heart, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@classmate/ui/localization";
import type { Course } from "../types/course";
import { getCourseVideoSources } from "../data/course-video-matches";

interface CourseCardProps {
  course: Course;
  index: number;
  favorite: boolean;
  onSelect: (course: Course) => void;
  onToggleFavorite: (courseId: string) => void;
}

const categoryTranslationKeys: Record<Course["category"], string> = {
  개발: "development",
  디자인: "design",
  "데이터 사이언스": "data",
  "업무 생산성": "productivity",
  "AI 기술": "ai",
  커리어: "career",
};

export function CourseCard({
  course,
  index,
  favorite,
  onSelect,
  onToggleFavorite,
}: CourseCardProps) {
  const title = course.title.replace(/\n/g, " ");
  const { t } = useTranslation();
  const sources = getCourseVideoSources(course);

  return (
    <motion.article
      className="course-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 5) * 0.04 }}
    >
      <div className="course-image-shell">
        <button
          className="course-image-button"
          onClick={() => onSelect(course)}
          aria-label={`${title} 상세 보기`}
        >
          <div
            className="course-image"
            style={{
              backgroundColor: course.color,
              backgroundImage: `url("${course.image}")`,
            }}
          />
          <span className="course-label">{course.label}</span>
          <span className="image-open"><ArrowRight size={17} /></span>
        </button>
        <button
          className={`favorite-button${favorite ? " favorite-button--active" : ""}`}
          aria-label={`${favorite ? "관심 강의 해제" : "관심 강의 추가"}: ${title}`}
          aria-pressed={favorite}
          onClick={() => onToggleFavorite(course.id)}
        >
          <Heart size={16} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="course-meta"><span>{t(`categories.${categoryTranslationKeys[course.category]}`)} · {course.subcategory}</span></div>
      <button className="course-title" onClick={() => onSelect(course)}>{course.title}</button>
      <div className="course-teacher">
        {sources.slice(0, 2).map((source) => source.creator).join(" · ") || course.teacher}
      </div>
      <div className="course-footer">
        <strong>{t("lesson.publicVideoLabel")}</strong>
        <span><Play size={14} /> {t("lesson.sourceCount", { count: sources.length })}</span>
      </div>
    </motion.article>
  );
}
