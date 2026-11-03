"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="course-access-message">
      <span className="course-error-icon" aria-hidden="true">
        <AlertTriangle size={21} />
      </span>
      <h1>페이지를 불러오지 못했어요</h1>
      <p>강의 정보나 서버 연결 상태를 확인한 뒤 다시 시도해 주세요.</p>
      <div className="course-error-actions">
        <button className="button button--primary" onClick={reset}>
          <RotateCcw size={15} /> 다시 시도
        </button>
        <Link className="button button--secondary" href="/classes">
          강의 목록
        </Link>
      </div>
    </main>
  );
}