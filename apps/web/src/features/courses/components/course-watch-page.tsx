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
import { curatedVideos } from "../data/curated-videos";
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
  initialVideoId?: string;
  initialLesson?: string;
}

type WatchTab = "chat" | "questions";
const categoryTranslationKeys: Record<Course["category"], string> = {
  개발: "development",
  디자인: "design",
  "데이터 사이언스": "data",
  "업무 생산성": "productivity",
  "AI 기술": "ai",
  커리어: "career",
};

const signalingUrl =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "http://localhost:4001";

export function CourseWatchPage({
  course,
  initialVideoId,
  initialLesson,
}: CourseWatchPageProps) {
  const plan = getCourseLearningPlan(course);
  const title = course.title.replace(/\n/g, " ");
  const [socket, setSocket] = useState<RealtimeSocket | null>(null);
  const [tab, setTab] = useState<WatchTab>("chat");
  const [selectedLesson, setSelectedLesson] = useState(
    () =>
      initialLesson && plan.chapters.some((chapter) => chapter.lessons.includes(initialLesson))
        ? initialLesson
        : plan.chapters[0]?.lessons[0] ?? "강의 소개",
  );
  const [selectedVideoId, setSelectedVideoId] = useState(initialVideoId);
  const [questionText, setQuestionText] = useState("");
  const [questionNotice, setQuestionNotice] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const authPrompted = useRef(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const { user, ready } = useDemoSession();
  const requestLogin = useLoginRequired();
  const { i18n, t } = useTranslation();
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
  const selectedSource =
    curatedVideos.find((video) => video.id === selectedVideoId) ??
    getLessonVideo(course, selectedLesson, Math.max(0, selectedLessonIndex));

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
    if (!ready || user || course.curatedVideoId || authPrompted.current) return;
    authPrompted.current = true;
    requestLogin();
  }, [course.curatedVideoId, ready, requestLogin, user]);

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!questionText.trim()) return;
    if (!connected || !askQuestion(questionText, author)) {
      setQuestionNotice(t("pages.connectionRequired"));
      return;
    }
    setQuestionText("");
    setQuestionNotice(t("pages.questionCreated"));
    window.setTimeout(() => setQuestionNotice(""), 3000);
  };

  const playLesson = (lesson: string, videoId?: string) => {
    setSelectedLesson(lesson);
    setSelectedVideoId(videoId);
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
    if (!window.confirm(t("pages.deleteQuestionConfirm"))) return;
    deleteQuestion(questionId);
  };

  if (!ready) {
    return (
      <main className="course-watch-page">
        <p className="course-access-message" role="status">{t("account.checking")}</p>
      </main>
    );
  }

  if (!user && !course.curatedVideoId) {
    return (
      <main className="course-watch-page">
        <header className="course-watch-header">
          <Link className="brand" href="/" aria-label={t("pages.homeBack")}>
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
        <Link className="brand" href="/" aria-label={t("pages.homeBack")}>
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
                  <p>{t("pages.publicVideoUnavailable")}</p>
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
              <div className="course-detail-category">{t(`categories.${categoryTranslationKeys[course.category]}`)} / {course.subcategory}</div>
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
              <span>{t("pages.learningPath")}</span>
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
                              onClick={() => playLesson(lesson, lessonVideo?.id)}
                            >
                              <Play size={13} /> {lessonIndex + 1}. {lesson}
                            </button>
                            {lessonVideo && !course.curatedVideoId && (
                              <button
                                className="vod-lesson-source"
                                type="button"
                                onClick={() => playLesson(lesson, lessonVideo.id)}
                              >
                                {lessonVideo.creator} · {t("pages.watchThisSession")}
                              </button>
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

        <aside className="vod-interaction-panel" aria-label={t("pages.realtimeInteraction")}>
          <div className="vod-interaction-header">
            <div>
              <span>{t("pages.learningTogether")}</span>
              <h2>{t("pages.realtimeLearning")}</h2>
            </div>
            <span className={`vod-connection-dot${connected ? " vod-connection-dot--connected" : ""}`} />
          </div>
          {!user ? (
            <section className="vod-guest-interaction">
              <h3>{t("auth.requiredTitle")}</h3>
              <p>{t("auth.requiredDescription")}</p>
              <button type="button" onClick={() => requestLogin()}>
                {t("actions.login")}
              </button>
            </section>
          ) : (
            <>
          <div className="vod-interaction-tabs" role="tablist" aria-label={t("pages.communicationType")}>
            <button
              role="tab"
              id="vod-chat-tab"
              aria-selected={tab === "chat"}
              aria-controls="vod-chat-panel"
              className={tab === "chat" ? "vod-tab--active" : ""}
              onClick={() => setTab("chat")}
            >
              {t("pages.liveChat")}
            </button>
            <button
              role="tab"
              id="vod-questions-tab"
              aria-selected={tab === "questions"}
              aria-controls="vod-questions-panel"
              className={tab === "questions" ? "vod-tab--active" : ""}
              onClick={() => setTab("questions")}
            >
              {t("pages.publicQa")} <span>{questions.length}</span>
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
                <span>{t("pages.liveChatDescription")}</span>
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
                <span>{t("pages.qaDescription")}</span>
              </div>
              <form className="vod-question-form" onSubmit={submitQuestion}>
                <label htmlFor="vod-question">{t("pages.questionPrompt")}</label>
                <textarea
                  id="vod-question"
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  placeholder={t("pages.questionPlaceholder")}
                  maxLength={1000}
                  required
                />
                <div>
                  <small>{questionText.length}/1000</small>
                  <button type="submit" disabled={!connected || !questionText.trim()}>
                    <Send size={14} /> {t("pages.askQuestion")}
                  </button>
                </div>
                {questionNotice && <p className="vod-question-notice" role="status">{questionNotice}</p>}
              </form>
              <div className="vod-question-list" aria-live="polite">
                {questions.length === 0 ? (
                  <div className="vod-question-empty">
                    <MessageCircle size={22} />
                    <strong>{t("pages.firstQuestion")}</strong>
                    <span>{t("pages.firstQuestionDescription")}</span>
                  </div>
                ) : (
                  [...questions].reverse().map((question) => (
                    <article className="vod-question-card" key={question.id}>
                      <div className="vod-question-author">
                        <span>{question.author.slice(0, 1)}</span>
                        <strong>{question.author}</strong>
                        <time dateTime={question.createdAt}>
                          {new Date(question.createdAt).toLocaleString(
                            i18n.resolvedLanguage ?? "ko-KR",
                            {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            },
                          )}
                        </time>
                        {question.senderId === socket?.id && (
                          <div className="vod-question-actions">
                            <button
                              type="button"
                              aria-label={t("pages.editQuestion")}
                              onClick={() => {
                                setEditingQuestionId(question.id);
                                setEditingQuestionText(question.text);
                              }}
                            >
                              <Pencil size={14} /> {t("pages.editAction")}
                            </button>
                            <button
                              type="button"
                              aria-label={t("pages.deleteQuestion")}
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 size={14} /> {t("pages.deleteQuestion")}
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
                            aria-label={t("pages.questionContent")}
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
                              <X size={14} /> {t("pages.cancelEdit")}
                            </button>
                            <button type="submit" disabled={!editingQuestionText.trim()}>
                              <Check size={14} /> {t("pages.saveEdit")}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p>{question.text}</p>
                      )}
                      {question.editedAt && <small className="vod-question-edited">{t("pages.edited")}</small>}
                    </article>
                  ))
                )}
              </div>
              {connected && (
                <p className="vod-qa-shared-note"><Check size={13} /> {t("pages.sharedInRoom")}</p>
              )}
            </section>
          )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
