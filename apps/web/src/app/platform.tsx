"use client";

import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Play,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthDialog, type AuthMode, type AuthUser } from "@classmate/ui/auth-dialog";
import { Button } from "@classmate/ui/button";
import { LogoutConfirmDialog } from "@classmate/ui/logout-confirm-dialog";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import type { Course } from "../features/courses/types/course";
import { CourseCatalog } from "../features/courses/components/course-catalog";
import { CourseCatalogFallback } from "../features/courses/components/course-catalog-fallback";
import { Classroom } from "../features/live-classroom/components/classroom";

interface PlatformNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  read: boolean;
}

const initialNotifications: PlatformNotification[] = [
  {
    id: "live-class-tonight",
    title: "오늘의 라이브 클래스",
    description: "드로잉 클럽 라이브가 오늘 오후 8시에 시작해요.",
    time: "오늘",
    href: "#live",
    read: false,
  },
  {
    id: "new-course-recommendation",
    title: "새로운 강의를 만나보세요",
    description: "관심 분야의 실무 강의가 새로 등록되었어요.",
    time: "어제",
    href: "/classes",
    read: false,
  },
  {
    id: "learning-tip",
    title: "이번 주 학습 팁",
    description: "배운 내용을 작은 프로젝트로 직접 완성해 보세요.",
    time: "10월 8일",
    href: "/classes",
    read: false,
  },
];

const notificationStorageKey = "classmate-notifications";

export function Platform() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [classroom, setClassroom] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsReady, setNotificationsReady] = useState(false);
  const { user, login, logout } = useDemoSession({ name: "지민", email: "jimin@classmate.kr" });
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(notificationStorageKey);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              "id" in item &&
              typeof item.id === "string" &&
              "title" in item &&
              typeof item.title === "string" &&
              "description" in item &&
              typeof item.description === "string" &&
              "time" in item &&
              typeof item.time === "string" &&
              "href" in item &&
              typeof item.href === "string" &&
              "read" in item &&
              typeof item.read === "boolean",
          )
        ) {
          setNotifications(parsed);
        } else {
          console.warn("Stored notifications have an invalid format");
        }
      }
    } catch (error) {
      console.error("Could not load notifications", error);
    } finally {
      setNotificationsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!notificationsReady) return;
    try {
      window.localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(notifications),
      );
    } catch (error) {
      console.error("Could not save notifications", error);
    }
  }, [notifications, notificationsReady]);

  const markNotificationRead = (notificationId: string) => {
    const nextNotifications = notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
    );
    setNotifications(nextNotifications);
    try {
      window.localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(nextNotifications),
      );
    } catch (error) {
      console.error("Could not save notifications", error);
    }
  };

  const markAllNotificationsRead = () => {
    const nextNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(nextNotifications);
    try {
      window.localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(nextNotifications),
      );
    } catch (error) {
      console.error("Could not save notifications", error);
    }
  };

  const openCourse = (course: Course) => router.push(`/courses/${course.id}`);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('[aria-label="강의 검색"]')?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleAuth = (nextUser: AuthUser) => {
    login(nextUser);
    setShowAuth(false);
    announce(`환영합니다, ${nextUser.name}님`);
  };

  return (
    <main id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Classmate 홈">
          <span className="brand-mark"><Sparkles size={17} /></span>
          classmate<span className="brand-period">.</span>
        </a>
        <nav className={`nav-links${mobileNavOpen ? " nav-links--open" : ""}`} aria-label="메인 메뉴">
          <a className="nav-link nav-link--active" href="#classes" onClick={() => setMobileNavOpen(false)}>강의</a>
          <a className="nav-link" href="#live" onClick={() => setMobileNavOpen(false)}>라이브</a>
          <a className="nav-link" href="#teachers" onClick={() => setMobileNavOpen(false)}>크리에이터</a>
        </nav>
        <div className="top-actions">
          <form
            className="search-box"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const query = search.trim();
              router.push(query ? `/classes?q=${encodeURIComponent(query)}` : "/classes");
            }}
          >
            <Search size={16} />
            <input
              aria-label="강의 검색"
              placeholder="어떤 기술을 배워볼까요?"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <kbd>⌘ K</kbd>
            <button className="search-submit" aria-label="강의 검색 실행" type="submit">
              <Search size={16} />
            </button>
          </form>
          <button
            className={`icon-button notification-button${unreadNotifications === 0 ? " notification-button--read" : ""}`}
            aria-label="알림"
            aria-expanded={notificationsOpen}
            aria-controls="platform-notifications"
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={18} />
            {unreadNotifications > 0 && <i />}
          </button>
          {notificationsOpen && (
            <section
              className="notifications-panel"
              id="platform-notifications"
              aria-label="알림"
            >
              <div className="notifications-heading">
                <div>
                  <strong>알림</strong>
                  <span>{unreadNotifications > 0 ? `읽지 않은 알림 ${unreadNotifications}개` : "모든 알림을 확인했어요"}</span>
                </div>
                {unreadNotifications > 0 && (
                  <button type="button" onClick={markAllNotificationsRead}>
                    <CheckCheck size={14} /> 모두 읽음
                  </button>
                )}
              </div>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <a
                    key={notification.id}
                    className={`notification-item${notification.read ? " notification-item--read" : ""}`}
                    href={notification.href}
                    onClick={() => {
                      markNotificationRead(notification.id);
                      setNotificationsOpen(false);
                    }}
                  >
                    <span className="notification-item-indicator" aria-hidden="true" />
                    <span className="notification-item-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.description}</span>
                      <small>{notification.time}</small>
                    </span>
                    <ChevronRight size={15} />
                  </a>
                ))}
                {notifications.length === 0 && (
                  <p className="notifications-empty">새로운 알림이 없어요.</p>
                )}
              </div>
            </section>
          )}
          <div className="profile-control">
            <button className="avatar" aria-label="내 프로필 메뉴" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>{user?.name.slice(0, 1) ?? "?"}</button>
            {profileOpen && <div className="profile-dropdown">{user ? <><strong>{user.name}</strong><small>{user.email}</small><button onClick={() => setConfirmLogout(true)}>로그아웃 <LogOut size={13} /></button></> : <><strong>기본 프로필</strong><button onClick={() => { setProfileOpen(false); setAuthMode("login"); setShowAuth(true); }}>로그인</button><button onClick={() => { setProfileOpen(false); setAuthMode("signup"); setShowAuth(true); }}>회원가입</button></>}</div>}
          </div>
        </div>
      </header>

      <section className="hero-wrap" id="live">
        <motion.div
          className="hero-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> LIVE CLASS, LIVE LIFE</div>
            <h1>배움이 일상이 되는<br />가장 다정한 순간<span>.</span></h1>
            <p>실무에 바로 쓰는 기술을 배우고, 같은 목표를 가진 사람들과<br className="desktop-break" /> 함께 성장하는 라이브 강의</p>
            <div className="hero-buttons">
              <a className="button button--cream" href="#classes">강의 둘러보기 <ArrowRight size={16} /></a>
              <button className="hero-text-button" onClick={() => setClassroom(true)}>
                <span className="play-circle"><Play size={12} fill="currentColor" /></span>
                라이브 강의 입장
              </button>
            </div>
            <div className="hero-social">
              <div className="avatar-stack"><i>하</i><i>민</i><i>유</i><i>+</i></div>
              <span><strong>2,400+</strong>명이 오늘도 함께 배워요</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-image" />
            <div className="hero-note"><span className="note-spark">✳</span><span>오늘의 영감<br /><b>작은 것부터 천천히</b></span></div>
            <div className="live-float"><span className="live-pulse" /> LIVE NOW <b>드로잉 클럽</b><ArrowDownRight size={16} /></div>
            <div className="hero-stamp">LEARN<br />TOGETHER<br /><span>✳</span></div>
          </div>
          <div className="hero-index"><span>01</span><i /><span>03</span></div>
        </motion.div>
      </section>

      <Suspense fallback={<CourseCatalogFallback />}>
        <CourseCatalog onSelect={openCourse} />
      </Suspense>

      <section className="creator-section" id="teachers">
        <div><div className="section-kicker">MEET YOUR CREATORS</div><h2>좋아하는 일을 나누는 사람들<span>.</span></h2><p>각자의 경험을 다정하게 나눠주는 크리에이터를 만나보세요.</p></div>
        <div className="creator-tiles">
          {[["민", "김민준", "소프트웨어 엔지니어 · 개발"], ["지", "박지수", "프론트엔드 개발자 · React"], ["도", "이도윤", "테크 리드 · 클라우드"], ["유", "오유리", "AI 엔지니어 · LLM"]].map(([initial, name, role]) => <article key={name}><span>{initial}</span><div><b>{name}</b><small>{role}</small></div><button aria-label={`${name} 강의 보기`} onClick={() => { setSearch(name); document.querySelector("#classes")?.scrollIntoView({ behavior: "smooth" }); }}>강의 보기 <ArrowRight size={13} /></button></article>)}
        </div>
      </section>

      <section className="live-banner">
        <div className="live-banner-icon"><Video size={24} /></div>
        <div><div className="section-kicker">YOUR SEAT IS WAITING</div><h3>오늘 저녁, 같이 배워볼까요?</h3><p>드로잉 클럽 라이브가 잠시 후 시작해요.</p></div>
        <Button onClick={() => setClassroom(true)}>라이브 입장하기 <ArrowRight size={15} /></Button>
        <span className="live-banner-time"><Clock3 size={14} /> 오후 8:00 시작</span>
      </section>

      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Sparkles size={15} /></span>classmate<span className="brand-period">.</span></a><span>좋아하는 마음이 배움이 되는 곳</span><a href="mailto:support@classmate.kr">고객센터</a><span>© 2026 Classmate Studio</span></footer>

      <AnimatePresence>
        {classroom && <Classroom onClose={() => setClassroom(false)} />}
        {showAuth && <AuthDialog initialMode={authMode} onAuthenticated={handleAuth} onClose={() => setShowAuth(false)} />}
        {confirmLogout && <LogoutConfirmDialog onCancel={() => setConfirmLogout(false)} onConfirm={() => { logout(); setConfirmLogout(false); setProfileOpen(false); }} />}
      </AnimatePresence>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={16} /> {toast}</motion.div>}</AnimatePresence>
      <button className="mobile-menu" aria-label="메뉴" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><Menu size={20} /></button>
      <span className="sr-only"><BookOpen /><LayoutGrid /><MessageCircle /></span>
    </main>
  );
}
