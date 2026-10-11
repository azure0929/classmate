"use client";

import { useCallback, useEffect, useState } from "react";
import type { CourseQuestion } from "@classmate/realtime-types";
import type { RealtimeSocket } from "../../live-classroom/hooks/use-live-chat";

interface UseCourseQaResult {
  questions: CourseQuestion[];
  askQuestion: (text: string, author: string) => boolean;
  editQuestion: (questionId: string, text: string) => boolean;
  deleteQuestion: (questionId: string) => boolean;
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
    const handleUpdatedQuestion = (question: CourseQuestion) => {
      if (question.courseId !== courseId) return;
      setQuestions((current) =>
        current.map((item) => (item.id === question.id ? question : item)),
      );
    };
    const handleDeletedQuestion = ({
      courseId: deletedCourseId,
      questionId,
    }: {
      courseId: string;
      questionId: string;
    }) => {
      if (deletedCourseId !== courseId) return;
      setQuestions((current) =>
        current.filter((item) => item.id !== questionId),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("qa:history", handleHistory);
    socket.on("qa:new", handleNewQuestion);
    socket.on("qa:updated", handleUpdatedQuestion);
    socket.on("qa:deleted", handleDeletedQuestion);
    if (socket.connected) handleConnect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("qa:history", handleHistory);
      socket.off("qa:new", handleNewQuestion);
      socket.off("qa:updated", handleUpdatedQuestion);
      socket.off("qa:deleted", handleDeletedQuestion);
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

  const editQuestion = useCallback(
    (questionId: string, text: string) => {
      const nextText = text.trim();
      const ownQuestion = questions.find((item) => item.id === questionId);
      if (
        !nextText ||
        nextText.length > 1000 ||
        !socket?.connected ||
        ownQuestion?.senderId !== socket.id
      ) {
        return false;
      }
      socket.emit("qa:edit", { courseId, questionId, text: nextText });
      return true;
    },
    [courseId, questions, socket],
  );

  const deleteQuestion = useCallback(
    (questionId: string) => {
      const ownQuestion = questions.find((item) => item.id === questionId);
      if (!socket?.connected || ownQuestion?.senderId !== socket.id) {
        return false;
      }
      socket.emit("qa:delete", { courseId, questionId });
      return true;
    },
    [courseId, questions, socket],
  );

  return { questions, askQuestion, editQuestion, deleteQuestion };
}
