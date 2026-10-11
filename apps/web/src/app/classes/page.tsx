import { Suspense } from "react";
import { AllCoursesPage } from "../../features/courses/components/all-courses-page";

export default function ClassesPage() {
  return (
    <Suspense fallback={<main className="all-courses-loading" role="status">강의 목록을 불러오는 중이에요.</main>}>
      <AllCoursesPage />
    </Suspense>
  );
}
