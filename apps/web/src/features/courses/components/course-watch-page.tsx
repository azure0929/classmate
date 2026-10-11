"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  MessageCircle,
  Pencil,
  Play,
  Send,
  Signal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { io } from "socket.io-client";
import { AccountMenu } from "@classmate/ui/account-menu";
import { useLoginRequired } from "@classmate/ui/login-required-provider";
import { useTranslation } from "@classmate/ui/localization";
import type { Course } from "../types/course";
import { getCourseLearningPlan } from "../data/course-curriculum";
import { getLessonVideo } from "../data/course-video-matches";
import { useCourseQa } from "../hooks/use-course-qa";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import {
  useLiveChat,
  type RealtimeSocket,
} from "../../live-classroom/hooks/use-live-chat";
import { ChatComposer } from "../../live-classroom/components/chat-composer";
import { ChatFeed } from "../../live-classroom/components/chat-feed";

interface CourseWatchPageProps {
  course: Course;
}

type WatchTab = "chat" | "questions";

const signalingUrl =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:4001";

export function CourseWatchPage({ course }: CourseWatchPageProps) {
  const plan = getCourseLearningPlan(course);
  const title = course.title.replace(/\n/g, " ");
  const [socket, setSocket] = useState<RealtimeSocket | null>(null);
  const [tab, setTab] = useState<WatchTab>("chat");
  const [selectedLesson, setSelectedLesson] = useState(
    () => plan.chapters[0]?.lessons[0] ?? "강의 소개",
  );
  const [questionText, setQuestionText] = useState("");
  const [questionNotice, setQuestionNotice] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const authPrompted = useRef(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const { user, ready } = useDemoSession();
  const requestLogin = useLoginRequired();
  const { t } = useTranslation();
  const roomId = `vod-${course.id}`;
  const author = user?.name ?? "지민";
  const {
    messages,
    connected,
    participantCount,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useLiveChat(socket, roomId, author);
  const { questions, askQuestion, editQuestion, deleteQuestion } = useCourseQa(
    socket,
    course.id,
  );
  const selectedLessonIndex = plan.chapters
    .flatMap((chapter) => chapter.lessons)
    .indexOf(selectedLesson);
  const selectedSource = getLessonVideo(
    course,
    selectedLesson,
    Math.max(0, selectedLessonIndex),
  );

  useEffect(() => {
    if (!user) return;
    const nextSocket: RealtimeSocket = io(signalingUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    setSocket(nextSocket);
    return () => {
      nextSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user || !socket) return;
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket, user]);

  useEffect(() => {
    if (!ready || user || authPrompted.current) return;
    authPrompted.current = true;
    requestLogin();
  }, [ready, requestLogin, user]);

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionText.trim()) return;
    if (!connected || !askQuestion(questionText, author)) {
      setQuestionNotice("실시간 서버 연결 후 질문을 남길 수 있어요.");
      return;
    }
    setQuestionText("");
    setQuestionNotice("질문을 등록했어요. 이 강의를 보는 사람들과 함께 확인할 수 있어요.");
    window.setTimeout(() => setQuestionNotice(""), 3000);
  };

  const playLesson = (lesson: string) => {
    setSelectedLesson(lesson);
    videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const saveQuestionEdit = (
    event: FormEvent<HTMLFormElement>,
    questionId: string,
  ) => {
    event.preventDefault();
    if (!editQuestion(questionId, editingQuestionText)) return;
    setEditingQuestionId(null);
    setEditingQuestionText("");
  };

  const removeQuestion = (questionId: string) => {
    if (!window.confirm("질문을 삭제할까요?")) return;
    deleteQuestion(questionId);
  };

  if (!ready) {
    return (
      <main className="course-watch-page">
        <p className="course-access-message" role="status">{t("account.checking")}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="course-watch-page">
        <header className="course-watch-header">
          <Link className="brand" href="/" aria-label="Classmate 홈">
            <span className="brand-mark">✳</span>
            classmate<span className="brand-period">.</span>
          </Link>
          <div className="course-watch-header-title">
            <Link href={`/courses/${course.id}`}><ArrowLeft size={16} /> {t("pages.courseDetail")}</Link>
            <span>{title}</span>
          </div>
          <AccountMenu />
        </header>
        <section className="course-access-message">
          <h1>{t("pages.loginGateTitle")}</h1>
          <p>{t("pages.loginGateDescription")}</p>
          <Link className="button button--secondary" href={`/courses/${course.id}`}>
            {t("pages.backToCourse")}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="course-watch-page">
      <header className="course-watch-header">
        <Link className="brand" href="/" aria-label="Classmate 홈">
          <span className="brand-mark">✳</span>
          classmate<span className="brand-period">.</span>
        </Link>
        <div className="course-watch-header-title">
          <Link href={`/courses/${course.id}`}><ArrowLeft size={16} /> {t("pages.courseDetail")}</Link>
          <span>{title}</span>
        </div>
        <span className="course-watch-demo-label">{t("pages.publicVideoLabel")}</span>
        <AccountMenu />
      </header>

      <div className="course-watch-layout">
        <div className="course-watch-main">
          <section className="vod-player-section" ref={videoRef} aria-label={t("pages.videoPlayer")}>
            <div className="vod-player-screen vod-public-player">
              {selectedSource ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedSource.videoId}?rel=0`}
                  title={`${selectedSource.creator} - ${selectedSource.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="course-access-message">
                  <p>이 섹션에 연결된 공개 학습 영상을 찾지 못했어요.</p>
                </div>
              )}
            </div>
            <p className="vod-demo-note">
              {selectedSource ? (
                <>
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedSource.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedSource.creator} · {selectedSource.title}
                  </a>
                  {" — "}
                </>
              ) : null}
              {t("pages.publicVideoNotice")}
            </p>
          </section>

          <section className="vod-lesson-heading">
            <div>
              <div className="course-detail-category">{course.category} / {course.subcategory}</div>
              <h1>{title}</h1>
              <p>{selectedLesson}</p>
            </div>
            <div className="vod-live-status">
              <span className={connected ? "vod-live-status--connected" : ""}><Signal size={15} /> {connected ? t("pages.connected") : t("pages.connecting")}</span>
              <small><MessageCircle size={14} /> {t("pages.participants", { count: participantCount })}</small>
            </div>
          </section>

          <section className="vod-instructor-banner">
            <span className="course-instructor-avatar">{course.teacher.slice(0, 1)}</span>
            <div><small>{t("pages.instructorSpace")}</small><strong>{course.teacher}</strong></div>
            <span className="vod-instructor-note">{t("pages.instructorHint")}</span>
          </section>

          <section className="vod-curriculum-panel">
            <div className="course-detail-section-heading">
              <span>YOUR LEARNING PATH</span>
              <h2>{t("pages.curriculum")}</h2>
            </div>
            <div className="vod-curriculum-list">
              {plan.chapters.map((chapter, chapterIndex) => (
                <details key={chapter.title} open={chapterIndex === 0}>
                  <summary>
                    <span className="course-chapter-number">{String(chapterIndex + 1).padStart(2, "0")}</span>
                    <span>{chapter.title}<small>{t("pages.lessonCount", { count: chapter.lessons.length })}</small></span>
                    <ChevronDown size={16} />
                  </summary>
                  <ol>
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      (() => {
                        const lessonVideo = getLessonVideo(
                          course,
                          lesson,
                          plan.chapters
                            .slice(0, chapterIndex)
                            .reduce((total, previousChapter) => total + previousChapter.lessons.length, 0) + lessonIndex,
                        );
                        return (
                          <li key={lesson}>
                            <button
                              className={selectedLesson === lesson ? "vod-lesson--active" : ""}
                              onClick={() => playLesson(lesson)}
                            >
                              <Play size={13} /> {lessonIndex + 1}. {lesson}
                            </button>
                            {lessonVideo && (
                              <a
                                className="vod-lesson-source"
                                href={`https://www.youtube.com/watch?v=${lessonVideo.videoId}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {lessonVideo.creator} · {t("pages.openSource")}
                              </a>
                            )}
                          </li>
                        );
                      })()
                    ))}
                  </ol>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="vod-interaction-panel" aria-label="실시간 소통과 Q&A">
          <div className="vod-interaction-header">
            <div>
              <span>LEARNING TOGETHER</span>
              <h2>실시간 소통</h2>
            </div>
            <span className={`vod-connection-dot${connected ? " vod-connection-dot--connected" : ""}`} />
          </div>
          <div className="vod-interaction-tabs" role="tablist" aria-label="소통 유형">
            <button
              role="tab"
              id="vod-chat-tab"
              aria-selected={tab === "chat"}
              aria-controls="vod-chat-panel"
              className={tab === "chat" ? "vod-tab--active" : ""}
              onClick={() => setTab("chat")}
            >
              실시간 채팅
            </button>
            <button
              role="tab"
              id="vod-questions-tab"
              aria-selected={tab === "questions"}
              aria-controls="vod-questions-panel"
              className={tab === "questions" ? "vod-tab--active" : ""}
              onClick={() => setTab("questions")}
            >
              공개 Q&A <span>{questions.length}</span>
            </button>
          </div>

          {tab === "chat" ? (
            <section
              className="vod-chat-panel"
              id="vod-chat-panel"
              role="tabpanel"
              aria-labelledby="vod-chat-tab"
            >
              <div className="vod-panel-description">
                <MessageCircle size={14} />
                <span>강의자와 학습자가 함께 나누는 실시간 대화예요.</span>
              </div>
              <ChatFeed
                messages={messages}
                currentUserId={socket?.id ?? ""}
                onEdit={editMessage}
                onDelete={deleteMessage}
              />
              <ChatComposer connected={connected} onSend={sendMessage} />
            </section>
          ) : (
            <section
              className="vod-qa-panel"
              id="vod-questions-panel"
              role="tabpanel"
              aria-labelledby="vod-questions-tab"
            >
              <div className="vod-panel-description">
                <MessageCircle size={14} />
                <span>질문은 강의를 보는 모든 사람에게 공개됩니다.</span>
              </div>
              <form className="vod-question-form" onSubmit={submitQuestion}>
                <label htmlFor="vod-question">강의 내용에 대해 질문해 보세요</label>
                <textarea
                  id="vod-question"
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  placeholder="막히는 부분이나 더 알고 싶은 내용을 적어주세요."
                  maxLength={1000}
                  required
                />
                <div>
                  <small>{questionText.length}/1000</small>
                  <button type="submit" disabled={!connected || !questionText.trim()}>
                    <Send size={14} /> 질문 남기기
                  </button>
                </div>
                {questionNotice && <p className="vod-question-notice" role="status">{questionNotice}</p>}
              </form>
              <div className="vod-question-list" aria-live="polite">
                {questions.length === 0 ? (
                  <div className="vod-question-empty">
                    <MessageCircle size={22} />
                    <strong>첫 질문을 남겨보세요</strong>
                    <span>작성한 질문은 이 강의의 공개 Q&A에 표시됩니다.</span>
                  </div>
                ) : (
                  [...questions].reverse().map((question) => (
                    <article className="vod-question-card" key={question.id}>
                      <div className="vod-question-author">
                        <span>{question.author.slice(0, 1)}</span>
                        <strong>{question.author}</strong>
                        <time dateTime={question.createdAt}>
                          {new Date(question.createdAt).toLocaleString("ko-KR", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        {question.senderId === socket?.id && (
                          <div className="vod-question-actions">
                            <button
                              type="button"
                              aria-label="질문 수정"
                              onClick={() => {
                                setEditingQuestionId(question.id);
                                setEditingQuestionText(question.text);
                              }}
                            >
                              <Pencil size={14} /> 수정
                            </button>
                            <button
                              type="button"
                              aria-label="질문 삭제"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 size={14} /> 삭제
                            </button>
                          </div>
                        )}
                      </div>
                      {editingQuestionId === question.id ? (
                        <form
                          className="vod-question-edit-form"
                          onSubmit={(event) => saveQuestionEdit(event, question.id)}
                        >
                          <textarea
                            aria-label="질문 내용 수정"
                            value={editingQuestionText}
                            onChange={(event) =>
                              setEditingQuestionText(event.target.value)
                            }
                            maxLength={1000}
                            required
                          />
                          <div>
                            <small>{editingQuestionText.length}/1000</small>
                            <button type="button" onClick={() => setEditingQuestionId(null)}>
                              <X size={14} /> 취소
                            </button>
                            <button type="submit" disabled={!editingQuestionText.trim()}>
                              <Check size={14} /> 저장
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p>{question.text}</p>
                      )}
                      {question.editedAt && <small className="vod-question-edited">수정됨</small>}
                    </article>
                  ))
                )}
              </div>
              {connected && (
                <p className="vod-qa-shared-note"><Check size={13} /> 같은 강의에 접속한 학습자와 실시간 공유 중</p>
              )}
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
