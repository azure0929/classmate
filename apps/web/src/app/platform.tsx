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
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AccountMenu } from "@classmate/ui/account-menu";
import { Button } from "@classmate/ui/button";
import { useLoginRequired } from "@classmate/ui/login-required-provider";
import { useTranslation } from "@classmate/ui/localization";
import { useDemoSession } from "@classmate/ui/use-demo-session";
import type { Course } from "../features/courses/types/course";
import { getCourses } from "../features/courses/api/get-courses";
import { courseCategories } from "../features/courses/types/course-category";
import {
  getPlatformNotifications,
  type PlatformNotification,
} from "../features/notifications/api/get-platform-notifications";
import { CourseCatalog } from "../features/courses/components/course-catalog";
import { CourseCatalogFallback } from "../features/courses/components/course-catalog-fallback";
import {
  getActiveLiveClass,
  type ActiveLiveClass,
} from "../features/live-classroom/api/get-active-live-class";
import { Classroom } from "../features/live-classroom/components/classroom";

// ==========================================
// 1. 타입 정의 및 초기 데이터 설정
// ==========================================

// 로컬 저장소에는 사용자별 읽음 상태만 보관합니다.
const notificationStorageKey = "classmate-notifications";


// ==========================================
// 2. 메인 플랫폼 컴포넌트 (`Platform`)
// ==========================================
export function Platform() {
  const router = useRouter();

  // --- [상태(State) 관리] ---
  const [search, setSearch] = useState("");                     // 검색어 입력 상태
  const [classroom, setClassroom] = useState(false);             // 라이브 클래스룸 모달 오픈 여부
  const [mobileNavOpen, setMobileNavOpen] = useState(false);     // 모바일 네비게이션 메뉴 오픈 여부
  const [notificationsOpen, setNotificationsOpen] = useState(false); // 알림 패널 오픈 여부
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]); // 알림 목록 상태
  const [notificationsReady, setNotificationsReady] = useState(false);      // 로컬 스토리지 동기화 준비 상태
  const [activeLiveClass, setActiveLiveClass] = useState<ActiveLiveClass | null>(null);
  const [activeLiveClassLoaded, setActiveLiveClassLoaded] = useState(false);

  // --- [외부 훅(Hooks) 사용] ---
  const { user } = useDemoSession();       // 현재 로그인된 유저 세션 정보
  const requestLogin = useLoginRequired(); // 로그인 모달을 띄워주는 트리거 함수
  const { t } = useTranslation();          // 다국어 번역 함수
  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  // --- [메모이제이션: 읽지 않은 알림 개수 계산] ---
  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  useEffect(() => {
    let cancelled = false;
    void getActiveLiveClass()
      .then((liveClass) => {
        if (!cancelled) setActiveLiveClass(liveClass);
      })
      .catch((error) => {
        console.error("Could not load active live class", error);
      })
      .finally(() => {
        if (!cancelled) setActiveLiveClassLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- [Effect: Supabase 알림과 로컬 읽음 상태 불러오기] ---
  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const readIds = new Set<string>();
        const stored = window.localStorage.getItem(notificationStorageKey);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (typeof item === "string") {
                readIds.add(item);
              } else if (
                typeof item === "object" &&
                item !== null &&
                "id" in item &&
                typeof item.id === "string" &&
                "read" in item &&
                item.read === true
              ) {
                readIds.add(item.id);
              }
            }
          }
        }
        const remoteNotifications = await getPlatformNotifications();
        if (cancelled) return;
        setNotifications(
          remoteNotifications.map((notification) => ({
            ...notification,
            read: readIds.has(notification.id),
          })),
        );
      } catch (error) {
        console.error("Could not load notifications", error);
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setNotificationsReady(true);
      }
    };

    void loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- [Effect: 알림 상태가 바뀔 때마다 로컬 스토리지에 자동 저장] ---
  useEffect(() => {
    if (!notificationsReady) return;
    try {
      window.localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(
          notifications.filter((notification) => notification.read).map((notification) => notification.id),
        ),
      );
    } catch (error) {
      console.error("Could not save notifications", error);
    }
  }, [notifications, notificationsReady]);

  // --- [이벤트 핸들러 함수들] ---

  // 개별 알림을 '읽음'으로 처리하고 저장하는 함수
  const markNotificationRead = (notificationId: string) => {
    const nextNotifications = notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
    );
    setNotifications(nextNotifications);
  };

  // 모든 알림을 일괄 '읽음'으로 처리하는 함수
  const markAllNotificationsRead = () => {
    const nextNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(nextNotifications);
  };

  // 특정 강의 상세 페이지로 이동
  const openCourse = (course: Course) => router.push(`/courses/${course.id}`);

  // 라이브 클래스룸 열기 (비로그인 상태라면 로그인 유도 후 오픈)
  const openClassroom = () => {
    if (!activeLiveClass) return;
    if (!user) {
      requestLogin(() => setClassroom(true));
      return;
    }
    setClassroom(true);
  };

  // --- [Effect: 키보드 단축키(Ctrl + K / Cmd + K) 설정] ---
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
      {/* ==========================================
          3. 상단 네비게이션 바 영역 (Top Bar)
          ========================================== */}
      <header className="topbar">
        {/* 브랜드 로고 */}
        <a className="brand" href="#top" aria-label={t("pages.homeBack")}>
          <span className="brand-mark"><Sparkles size={17} /></span>
          classmate<span className="brand-period">.</span>
        </a>

        {/* 상단 네비게이션 링크 메뉴 */}
        <nav className={`nav-links${mobileNavOpen ? " nav-links--open" : ""}`} aria-label={t("pages.mainNavigation")}>
          <a className="nav-link nav-link--active" href="#classes" onClick={() => setMobileNavOpen(false)}>{t("nav.courses")}</a>
          <a className="nav-link" href="#live" onClick={() => setMobileNavOpen(false)}>{t("nav.live")}</a>
          <a className="nav-link" href="#teachers" onClick={() => setMobileNavOpen(false)}>{t("nav.creators")}</a>
        </nav>

        {/* 우측 액션 버튼 모음 (검색, 알림, 계정 메뉴) */}
        <div className="top-actions">
          {/* 강의 검색 폼 (엔터 또는 서브밋 시 검색 결과 페이지로 이동) */}
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

          {/* 알림 토글 버튼 */}
          <button
            className={`icon-button notification-button${unreadNotifications === 0 ? " notification-button--read" : ""}`}
            style={{
              opacity: user ? 1 : 0.4, // 로그인 안 되어 있으면 투명도를 낮춰 흐리게
              cursor: user ? "pointer" : "not-allowed", // 커서를 금지 모양으로 변경
            }}
            aria-label={t("pages.notificationsAria")}
            aria-expanded={notificationsOpen}
            aria-controls="platform-notifications"
            onClick={() => {
              if (!user) {
                requestLogin(); // 로그인이 안되있다면 로그인 모달 유도 (선택 사항)
                return;
              }
              
              setNotificationsOpen((open) => !open);
            }}
          >
            <Bell size={18} />
            {unreadNotifications > 0 && <i />}
          </button>

          {/* 알림 드롭다운 패널 (토글될 때만 렌더링) */}
          {notificationsOpen && user && (
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
                      <strong>{notification.title}</strong>
                      <span>{notification.description}</span>
                      <small>{notification.time}</small>
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

          {/* 유저 계정 메뉴 컴포넌트 */}
          <AccountMenu />
        </div>
      </header>

      {/* ==========================================
          4. 메인 히어로 배너 영역 (Hero Section)
          ========================================== */}
      <section className="hero-wrap" id="live">
        <motion.div
          className="hero-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          {/* 좌측 소개 및 CTA 버튼 그룹 */}
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
              <span><strong>{t("pages.curatedVideoCourseCount", { count: courses.length })}</strong></span>
            </div>
          </div>

          {/* 우측 그래픽 아트 및 데모 표시 영역 */}
          <div className="hero-art">
            <div className="hero-image" />
            <div className="hero-note"><span className="note-spark">✳</span><span>{t("pages.inspiration")}<br /><b>{t("pages.inspirationText")}</b></span></div>
            <div className="live-float"><span className="live-pulse" /> {activeLiveClass?.dateLabel ?? "일정 없음"} <ArrowDownRight size={16} /></div>
            <div className="hero-stamp">{t("pages.learnTogetherStamp")}<br /><span>✳</span></div>
          </div>
          <div className="hero-index"><span>01</span><i /><span>03</span></div>
        </motion.div>
      </section>

      {/* ==========================================
          5. 강의 카탈로그 영역 (Course Catalog)
          ========================================== */}
      <Suspense fallback={<CourseCatalogFallback />}>
        <CourseCatalog onSelect={openCourse} />
      </Suspense>

      {/* ==========================================
          6. 크리에이터 및 카테고리 추천 영역 (Creators Section)
          ========================================== */}
      <section className="creator-section" id="teachers">
        <div><div className="section-kicker">{t("pages.creatorEyebrow")}</div><h2>{t("pages.creatorTitle")}<span>.</span></h2><p>{t("pages.creatorDescription")}</p></div>
        <div className="creator-tiles">
          {courseCategories.map(({ name: category }) => {
            const course = courses.find((item) => item.category === category);
            if (!course) return null;
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
                <span>{course.teacher.slice(0, 1)}</span>
                <div><b>{course.teacher}</b><small>{t(`categories.${categoryKeys[category]}`)} · {course.title}</small></div>
                <a href={`/courses/${course.id}`} aria-label={`${course.teacher} ${t("pages.openCreatorCourse")}`}>
                  {t("pages.openCreatorCourse")} <ArrowRight size={13} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          7. 라이브 참여 유도 하단 배너 (Live Banner)
          ========================================== */}
      <section className="live-banner">
        <div className="live-banner-icon"><Video size={24} /></div>
        <div><div className="section-kicker">{t("pages.liveSeatEyebrow")}</div><h3>{activeLiveClass?.title ?? "진행 중인 라이브 클래스가 없습니다."}</h3><p>{activeLiveClass ? `${activeLiveClass.teacher} 크리에이터 진행 중` : "관리자 워크스페이스에서 라이브 일정을 확인해 주세요."}</p></div>
        <Button onClick={openClassroom} disabled={!activeLiveClassLoaded || !activeLiveClass}>{t("pages.joinLive")} <ArrowRight size={15} /></Button>
        <span className="live-banner-time"><Clock3 size={14} /> {activeLiveClass?.dateLabel ?? "일정 없음"}</span>
      </section>

      {/* ==========================================
          8. 푸터 영역 (Footer)
          ========================================== */}
      <footer className="footer">
        <a className="brand" href="#top"><span className="brand-mark"><Sparkles size={15} /></span>classmate<span className="brand-period">.</span></a>
        <span>{t("pages.footerTagline")}</span>
        <a href="mailto:support@classmate.kr">{t("pages.support")}</a>
        <span>© 2026 Classmate Studio</span>
      </footer>

      {/* ==========================================
          9. 모달 및 유틸리티 영역 (Modals & Hidden Elements)
          ========================================== */}
      {/* 실시간 라이브 강의실 모달 (애니메이션 효과 적용) */}
      <AnimatePresence>
        {classroom && activeLiveClass && <Classroom onClose={() => setClassroom(false)} roomId={`class-${activeLiveClass.id}`} courseTitle={activeLiveClass.title} teacher={activeLiveClass.teacher} />}
      </AnimatePresence>
      
      {/* 모바일 화면용 메뉴 토글 버튼 */}
      <button className="mobile-menu" aria-label={t("pages.mobileMenu")} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
        <Menu size={20} />
      </button>

      {/* 스크린 리더(접근성) 전용 유틸리티 아이콘 렌더링 */}
      <span className="sr-only"><BookOpen /><LayoutGrid /><MessageCircle /></span>
    </main>
  );
}