"use client";

import { ArrowRight, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { Course } from "../types/course";

interface CourseCardProps {
  course: Course;
  index: number;
  favorite: boolean;
  onSelect: (course: Course) => void;
  onToggleFavorite: (courseId: string) => void;
}

export function CourseCard({
  course,
  index,
  favorite,
  onSelect,
  onToggleFavorite,
}: CourseCardProps) {
  const title = course.title.replace(/\n/g, " ");

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
      <div className="course-meta"><span>{course.category} · {course.subcategory}</span><span>★ {course.rating}</span></div>
      <button className="course-title" onClick={() => onSelect(course)}>{course.title}</button>
      <div className="course-teacher">{course.teacher}</div>
      <div className="course-footer"><strong>VOD 강의</strong><span><Users size={14} /> {course.students}</span></div>
    </motion.article>
  );
}
