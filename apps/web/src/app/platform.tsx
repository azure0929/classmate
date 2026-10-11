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
import { AccountMenu } from "@classmate/ui/account-menu";
import { Button } from "@classmate/ui/button";
import { useLoginRequired } from "@classmate/ui/login-required-provider";
import { useTranslation } from "@classmate/ui/localization";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import type { Course } from "../features/courses/types/course";
import { CourseCatalog } from "../features/courses/components/course-catalog";
import { CourseCatalogFallback } from "../features/courses/components/course-catalog-fallback";
import { Classroom } from "../features/live-classroom/components/classroom";
import { curatedVideos, learningCategories } from "../features/courses/data/curated-videos";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [notificationsReady, setNotificationsReady] = useState(false);
  const { user } = useDemoSession();
  const requestLogin = useLoginRequired();
  const { t } = useTranslation();
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

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
  const openClassroom = () => {
    if (!user) {
      requestLogin(() => setClassroom(true));
      return;
    }
    setClassroom(true);
  };

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("platform-course-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <main id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label={t("pages.homeBack")}>
          <span className="brand-mark"><Sparkles size={17} /></span>
          classmate<span className="brand-period">.</span>
        </a>
        <nav className={`nav-links${mobileNavOpen ? " nav-links--open" : ""}`} aria-label={t("pages.mainNavigation")}>
          <a className="nav-link nav-link--active" href="#classes" onClick={() => setMobileNavOpen(false)}>{t("nav.courses")}</a>
          <a className="nav-link" href="/resources" onClick={() => setMobileNavOpen(false)}>{t("nav.videos")}</a>
          <a className="nav-link" href="#live" onClick={() => setMobileNavOpen(false)}>{t("nav.live")}</a>
          <a className="nav-link" href="#teachers" onClick={() => setMobileNavOpen(false)}>{t("nav.creators")}</a>
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
              id="platform-course-search"
              aria-label={t("pages.searchAria")}
              placeholder={t("pages.homeSearchPlaceholder")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <kbd>⌘ K</kbd>
            <button className="search-submit" aria-label={t("pages.searchSubmit")} type="submit">
              <Search size={16} />
            </button>
          </form>
          <button
            className={`icon-button notification-button${unreadNotifications === 0 ? " notification-button--read" : ""}`}
            aria-label={t("pages.notificationsAria")}
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
              aria-label={t("pages.notificationsAria")}
            >
              <div className="notifications-heading">
                <div>
                  <strong>{t("notifications.title")}</strong>
                  <span>{unreadNotifications > 0 ? t("notifications.unreadCount", { count: unreadNotifications }) : t("notifications.allRead")}</span>
                </div>
                {unreadNotifications > 0 && (
                  <button type="button" onClick={markAllNotificationsRead}>
                    <CheckCheck size={14} /> {t("notifications.markAll")}
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
                      <strong>{t(`notifications.${notification.id}.title`)}</strong>
                      <span>{t(`notifications.${notification.id}.description`)}</span>
                      <small>{t(`notifications.${notification.id}.time`)}</small>
                    </span>
                    <ChevronRight size={15} />
                  </a>
                ))}
                {notifications.length === 0 && (
                  <p className="notifications-empty">{t("notifications.empty")}</p>
                )}
              </div>
            </section>
          )}
          <AccountMenu />
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
            <div className="eyebrow"><span className="eyebrow-dot" /> {t("pages.homeEyebrow")}</div>
            <h1>{t("pages.homeTitle")}<span>.</span></h1>
            <p>{t("pages.homeDescription")}</p>
            <div className="hero-buttons">
              <a className="button button--cream" href="#classes">{t("actions.browse")} <ArrowRight size={16} /></a>
              <button className="hero-text-button" onClick={openClassroom}>
                <span className="play-circle"><Play size={12} fill="currentColor" /></span>
                {t("pages.enterLiveClass")}
              </button>
            </div>
            <div className="hero-social">
              <div className="avatar-stack"><Play size={15} /></div>
              <span><strong>{t("library.count", { count: curatedVideos.length })}</strong></span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-image" />
            <div className="hero-note"><span className="note-spark">✳</span><span>{t("pages.inspiration")}<br /><b>{t("pages.inspirationText")}</b></span></div>
            <div className="live-float"><span className="live-pulse" /> {t("pages.liveDemoTime")} <ArrowDownRight size={16} /></div>
            <div className="hero-stamp">{t("pages.learnTogetherStamp")}<br /><span>✳</span></div>
          </div>
          <div className="hero-index"><span>01</span><i /><span>03</span></div>
        </motion.div>
      </section>

      <Suspense fallback={<CourseCatalogFallback />}>
        <CourseCatalog onSelect={openCourse} />
      </Suspense>

      <section className="creator-section" id="teachers">
        <div><div className="section-kicker">{t("pages.creatorEyebrow")}</div><h2>{t("pages.creatorTitle")}<span>.</span></h2><p>{t("pages.creatorDescription")}</p></div>
        <div className="creator-tiles">
          {learningCategories.map((category) => {
            const video = curatedVideos.find((item) => item.category === category);
            if (!video) return null;
            const categoryKeys: Record<typeof category, string> = {
              개발: "development",
              디자인: "design",
              "데이터 사이언스": "data",
              "업무 생산성": "productivity",
              "AI 기술": "ai",
              커리어: "career",
            };
            return (
              <article key={category}>
                <span>{video.creator.slice(0, 1)}</span>
                <div><b>{video.creator}</b><small>{t(`categories.${categoryKeys[category]}`)} · {video.title}</small></div>
                <a href={video.channelUrl} target="_blank" rel="noreferrer" aria-label={`${video.creator} ${t("pages.visitChannel")}`}>
                  {t("pages.visitChannel")} <ArrowRight size={13} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="live-banner">
        <div className="live-banner-icon"><Video size={24} /></div>
        <div><div className="section-kicker">{t("pages.liveSeatEyebrow")}</div><h3>{t("pages.liveBannerTitle")}</h3><p>{t("pages.liveBannerDescription")}</p></div>
        <Button onClick={openClassroom}>{t("pages.joinLive")} <ArrowRight size={15} /></Button>
        <span className="live-banner-time"><Clock3 size={14} /> {t("pages.liveDemoTime")}</span>
      </section>

      <footer className="footer"><a className="brand" href="#top"><span className="brand-mark"><Sparkles size={15} /></span>classmate<span className="brand-period">.</span></a><span>{t("pages.footerTagline")}</span><a href="mailto:support@classmate.kr">{t("pages.support")}</a><span>© 2026 Classmate Studio</span></footer>

      <AnimatePresence>
        {classroom && <Classroom onClose={() => setClassroom(false)} />}
      </AnimatePresence>
      <button className="mobile-menu" aria-label={t("pages.mobileMenu")} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}><Menu size={20} /></button>
      <span className="sr-only"><BookOpen /><LayoutGrid /><MessageCircle /></span>
    </main>
  );
}
