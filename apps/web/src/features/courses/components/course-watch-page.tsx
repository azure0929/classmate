"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  MessageCircle,
  Pause,
  Play,
  Send,
  Signal,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { io } from "socket.io-client";
import type { Course } from "../types/course";
import { getCourseLearningPlan } from "../data/course-curriculum";
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
const videoDuration = 32 * 60;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function CourseWatchPage({ course }: CourseWatchPageProps) {
  const [socket, setSocket] = useState<RealtimeSocket | null>(null);
  const [tab, setTab] = useState<WatchTab>("chat");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState("강의 소개와 완성할 결과물");
  const [questionText, setQuestionText] = useState("");
  const [questionNotice, setQuestionNotice] = useState("");
  const videoRef = useRef<HTMLDivElement>(null);
  const { user } = useDemoSession();
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
  const { questions, askQuestion } = useCourseQa(socket, course.id);
  const plan = getCourseLearningPlan(course);
  const title = course.title.replace(/\n/g, " ");

  useEffect(() => {
    const nextSocket: RealtimeSocket = io(signalingUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
    setSocket(nextSocket);
    return () => {
      nextSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setCurrentTime((time) => {
        if (time >= videoDuration) {
          setPlaying(false);
          return videoDuration;
        }
        return time + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [playing]);

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
    setCurrentTime(0);
    setPlaying(true);
    videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="course-watch-page">
      <header className="course-watch-header">
        <Link className="brand" href="/" aria-label="Classmate 홈">
          <span className="brand-mark">✳</span>
          classmate<span className="brand-period">.</span>
        </Link>
        <div className="course-watch-header-title">
          <Link href={`/courses/${course.id}`}><ArrowLeft size={16} /> 강의 상세</Link>
          <span>{title}</span>
        </div>
        <span className="course-watch-demo-label">데모 VOD</span>
      </header>

      <div className="course-watch-layout">
        <div className="course-watch-main">
          <section className="vod-player-section" ref={videoRef} aria-label="VOD 플레이어">
            <div
              className="vod-player-screen"
              style={{
                backgroundColor: course.color,
                backgroundImage: `linear-gradient(0deg, #101913a8, #10191320), url("${course.image}")`,
              }}
            >
              <span className="vod-screen-category">{course.category} · {course.subcategory}</span>
              <div className="vod-screen-message">
                <span className="vod-screen-play"><Play size={24} fill="currentColor" /></span>
                <strong>{selectedLesson}</strong>
                <small>데모 환경의 VOD 플레이어입니다.</small>
              </div>
              <span className="vod-screen-corner">CLASSMATE · VOD</span>
            </div>
            <div className="vod-controls">
              <input
                className="vod-progress"
                type="range"
                aria-label="재생 위치"
                min={0}
                max={videoDuration}
                value={currentTime}
                style={{ "--progress": `${(currentTime / videoDuration) * 100}%` } as React.CSSProperties}
                onChange={(event) => setCurrentTime(Number(event.target.value))}
              />
              <div className="vod-control-row">
                <div className="vod-control-group">
                  <button
                    className="vod-icon-button"
                    aria-label={playing ? "일시 정지" : "재생"}
                    onClick={() => setPlaying((current) => !current)}
                  >
                    {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  </button>
                  <span>{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
                </div>
                <div className="vod-control-group">
                  <Volume2 size={17} />
                  <span className="vod-quality-label">데모 재생</span>
                </div>
              </div>
            </div>
            <p className="vod-demo-note">
              현재 강의 영상은 데모 플레이어 UI로 제공됩니다. 강의 재생 위치와 학습 섹션을 둘러볼 수 있어요.
            </p>
          </section>

          <section className="vod-lesson-heading">
            <div>
              <div className="course-detail-category">{course.category} / {course.subcategory}</div>
              <h1>{title}</h1>
              <p>{selectedLesson}</p>
            </div>
            <div className="vod-live-status">
              <span className={connected ? "vod-live-status--connected" : ""}><Signal size={15} /> {connected ? "소통 연결됨" : "연결 중"}</span>
              <small><MessageCircle size={14} /> {participantCount}명 참여 중</small>
            </div>
          </section>

          <section className="vod-instructor-banner">
            <span className="course-instructor-avatar">{course.teacher.slice(0, 1)}</span>
            <div><small>강의자와 함께하는 학습 공간</small><strong>{course.teacher}</strong></div>
            <span className="vod-instructor-note">채팅으로 질문하고 학습 팁을 나눠보세요.</span>
          </section>

          <section className="vod-curriculum-panel">
            <div className="course-detail-section-heading">
              <span>YOUR LEARNING PATH</span>
              <h2>커리큘럼</h2>
            </div>
            <div className="vod-curriculum-list">
              {plan.chapters.map((chapter, chapterIndex) => (
                <details key={chapter.title} open={chapterIndex === 0}>
                  <summary>
                    <span className="course-chapter-number">{String(chapterIndex + 1).padStart(2, "0")}</span>
                    <span>{chapter.title}<small>{chapter.lessons.length}개 강의</small></span>
                    <ChevronDown size={16} />
                  </summary>
                  <ol>
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <li key={lesson}>
                        <button
                          className={selectedLesson === lesson ? "vod-lesson--active" : ""}
                          onClick={() => playLesson(lesson)}
                        >
                          <Play size={13} /> {lessonIndex + 1}. {lesson}
                        </button>
                        <small>{8 + ((chapterIndex * 7 + lessonIndex * 5) % 12)}분</small>
                      </li>
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
                      </div>
                      <p>{question.text}</p>
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
