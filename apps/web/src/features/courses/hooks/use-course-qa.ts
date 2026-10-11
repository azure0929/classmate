"use client";

import { useCallback, useEffect, useState } from "react";
import type { CourseQuestion } from "@classmate/realtime-types";
import type { RealtimeSocket } from "../../live-classroom/hooks/use-live-chat";

interface UseCourseQaResult {
  questions: CourseQuestion[];
  askQuestion: (text: string, author: string) => boolean;
}

export function useCourseQa(
  socket: RealtimeSocket | null,
  courseId: string,
): UseCourseQaResult {
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => socket.emit("qa:join", courseId);
    const handleHistory = (history: CourseQuestion[]) =>
      setQuestions(history);
    const handleNewQuestion = (question: CourseQuestion) => {
      if (question.courseId !== courseId) return;
      setQuestions((current) =>
        current.some((item) => item.id === question.id)
          ? current
          : [...current.slice(-99), question],
      );
    };

    socket.on("connect", handleConnect);
    socket.on("qa:history", handleHistory);
    socket.on("qa:new", handleNewQuestion);
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("qa:history", handleHistory);
      socket.off("qa:new", handleNewQuestion);
    };
  }, [courseId, socket]);

  const askQuestion = useCallback(
    (text: string, author: string) => {
      const question = text.trim();
      if (!question || question.length > 1000 || !socket?.connected) {
        return false;
      }
      socket.emit("qa:ask", { courseId, author, text: question });
      return true;
    },
    [courseId, socket],
  );

  return { questions, askQuestion };
}
