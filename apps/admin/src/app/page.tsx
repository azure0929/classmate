"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AuthDialog, type AuthUser } from "@classmate/ui/auth-dialog";
import { Button } from "@classmate/ui/button";
import { LogoutConfirmDialog } from "@classmate/ui/logout-confirm-dialog";
import { useDemoSession } from "@classmate/ui/use-demo-session";

type SectionId = "dashboard" | "classes" | "creators" | "calendar" | "live" | "settings" | "help";
type ClassStatus = "진행 중" | "모집 중" | "마감 임박" | "임시 저장";

interface ClassItem {
  id: string;
  title: string;
  teacher: string;
  category: string;
  students: number;
  status: ClassStatus;
  date: string;
  color: string;
}

const sections: { id: SectionId; label: string }[] = [
  { id: "dashboard", label: "대시보드" },
  { id: "classes", label: "클래스 관리" },
  { id: "creators", label: "크리에이터" },
  { id: "calendar", label: "일정 관리" },
  { id: "live", label: "라이브 스튜디오" },
  { id: "settings", label: "설정" },
  { id: "help", label: "도움말" },
];
const tabs = ["전체 클래스", "진행 중", "모집 중", "임시 저장"] as const;
type ClassTab = (typeof tabs)[number];

const initialClasses: ClassItem[] = [
  { id: "drawing", title: "아이패드 드로잉, 좋아하는 장면을 그려요", teacher: "김하나", category: "드로잉", students: 124, status: "진행 중", date: "오늘 오후 8:00", color: "mint" },
  { id: "photo", title: "스마트폰으로 담는 나만의 시선", teacher: "이도현", category: "사진", students: 86, status: "모집 중", date: "10월 14일 오후 7:30", color: "peach" },
  { id: "ceramic", title: "하루 한 잔, 작은 도자기 작업실", teacher: "박서연", category: "공예", students: 62, status: "모집 중", date: "10월 16일 오후 6:00", color: "yellow" },
  { id: "coffee", title: "집에서도 카페처럼 핸드드립", teacher: "최윤", category: "라이프", students: 98, status: "마감 임박", date: "10월 18일 오후 2:00", color: "blue" },
  { id: "watercolor", title: "수채화로 기록하는 나의 계절", teacher: "김하나", category: "드로잉", students: 0, status: "임시 저장", date: "일정 미정", color: "mint" },
  { id: "film", title: "필름 사진의 색감을 디지털로", teacher: "이도현", category: "사진", students: 41, status: "진행 중", date: "10월 20일 오후 7:00", color: "peach" },
];

const creators = [
  { name: "김하나", role: "일러스트레이터", category: "드로잉", classes: 3, students: 1240, status: "활동 중" },
  { name: "이도현", role: "포토그래퍼", category: "사진", classes: 2, students: 836, status: "활동 중" },
  { name: "박서연", role: "도예가", category: "공예", classes: 2, students: 514, status: "활동 중" },
  { name: "최윤", role: "바리스타", category: "라이프", classes: 1, students: 698, status: "활동 중" },
];

function getStatusClass(status: ClassStatus) {
  if (status === "진행 중") return "status-pill--live";
  if (status === "마감 임박") return "status-pill--urgent";
  if (status === "임시 저장") return "status-pill--draft";
  return "";
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [activeTab, setActiveTab] = useState<ClassTab>("전체 클래스");
  const [classes, setClasses] = useState(initialClasses);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "students">("latest");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [liveOn, setLiveOn] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Classmate Studio");
  const [adminEmail, setAdminEmail] = useState("jimin@classmate.kr");
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const { user, ready, login, logout } = useDemoSession();

  useEffect(() => {
    const stored = localStorage.getItem("classmate-workspace-settings");
    if (!stored) return;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed !== "object" || parsed === null) return;
      if ("workspaceName" in parsed && typeof parsed.workspaceName === "string") setWorkspaceName(parsed.workspaceName);
      if ("adminEmail" in parsed && typeof parsed.adminEmail === "string") setAdminEmail(parsed.adminEmail);
      if ("notifications" in parsed && typeof parsed.notifications === "boolean") setNotifications(parsed.notifications);
      if ("weeklyReport" in parsed && typeof parsed.weeklyReport === "boolean") setWeeklyReport(parsed.weeklyReport);
    } catch (error) {
      console.error("Could not read workspace settings", error);
      localStorage.removeItem("classmate-workspace-settings");
    }
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".admin-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const visibleClasses = useMemo(() => {
    const filtered = classes.filter((item) => {
      const matchesTab =
        activeTab === "전체 클래스" ||
        (activeTab === "진행 중" && item.status === "진행 중") ||
        (activeTab === "모집 중" && (item.status === "모집 중" || item.status === "마감 임박")) ||
        (activeTab === "임시 저장" && item.status === "임시 저장");
      const matchesSearch =
        `${item.title} ${item.teacher} ${item.category}`.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesSearch;
    });
    return sortOrder === "students"
      ? filtered.sort((a, b) => b.students - a.students)
      : filtered;
  }, [activeTab, classes, query, sortOrder]);

  const calendarDate = new Date(2026, 9 + calendarMonthOffset, 1);
  const calendarYear = calendarDate.getFullYear();
  const calendarMonth = calendarDate.getMonth();
  const calendarDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarFirstDay = calendarDate.getDay();

  const activeSectionLabel =
    sections.find((section) => section.id === activeSection)?.label ?? "대시보드";

  const handleAuth = (nextUser: AuthUser) => {
    login(nextUser);
    setShowAuth(false);
    notify(`환영합니다, ${nextUser.name}님.`);
  };

  const saveClass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextClass: ClassItem = {
      id: editingClass?.id ?? `class-${Date.now()}`,
      title: String(formData.get("title")).trim(),
      teacher: String(formData.get("teacher")).trim(),
      category: String(formData.get("category")),
      students: editingClass?.students ?? 0,
      status: String(formData.get("status")) as ClassStatus,
      date: String(formData.get("date")).trim() || "일정 미정",
      color: editingClass?.color ?? "mint",
    };
    setClasses((current) =>
      editingClass
        ? current.map((item) => item.id === editingClass.id ? nextClass : item)
        : [nextClass, ...current],
    );
    setClassModalOpen(false);
    setEditingClass(null);
    notify(editingClass ? "클래스 정보를 수정했어요." : "새 클래스를 추가했어요.");
  };

  const openClassModal = (item?: ClassItem) => {
    setEditingClass(item ?? null);
    setClassModalOpen(true);
  };

  const removeClass = (item: ClassItem) => {
    setClasses((current) => current.filter((entry) => entry.id !== item.id));
    setRowMenu(null);
    notify(`${item.title} 클래스를 삭제했어요.`);
  };

  const selectSection = (section: SectionId) => {
    setActiveSection(section);
    setQuery("");
    setProfileMenuOpen(false);
    setWorkspaceMenuOpen(false);
  };

  const renderClassTable = (limit?: number) => {
    const rows = limit ? visibleClasses.slice(0, limit) : visibleClasses;
    return (
      <>
        <div className="table-scroll">
          <table>
            <thead><tr><th>클래스</th><th>카테고리</th><th>수강생</th><th>상태</th><th>다음 일정</th><th /></tr></thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td><div className="table-course"><div className={`course-thumb course-thumb--${item.color}`}>{item.title.slice(0, 1)}</div><span><b>{item.title}</b><small>{item.teacher} 크리에이터</small></span></div></td>
                  <td><span className="category-pill">{item.category}</span></td>
                  <td>{item.students}명</td>
                  <td><span className={`status-pill ${getStatusClass(item.status)}`}><i />{item.status}</span></td>
                  <td className="table-date">{item.date}</td>
                  <td className="row-action-cell">
                    <button className="row-more" aria-label={`${item.title} 옵션`} aria-expanded={rowMenu === item.id} onClick={() => setRowMenu((current) => current === item.id ? null : item.id)}><MoreHorizontal size={17} /></button>
                    {rowMenu === item.id && <div className="row-menu"><button onClick={() => openClassModal(item)}>클래스 수정</button><button onClick={() => removeClass(item)}>클래스 삭제</button></div>}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="admin-empty">조건에 맞는 클래스가 없어요.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>전체 <b>{classes.length}</b>개 중 <b>{rows.length}</b>개 표시</span><button className="text-action" onClick={() => setQuery("")}>검색 초기화 <X size={13} /></button></div>
      </>
    );
  };

  const renderDashboard = () => (
    <>
      <div className="stats-grid">
        <article className="stat-card"><div className="stat-head">이번 달 매출 <span className="stat-icon stat-icon--green">₩</span></div><strong>₩ 8,420,000</strong><div className="stat-change"><span><ArrowUpRight size={13} /> 12.8%</span> 지난달보다</div><div className="mini-chart mini-chart--green">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div></article>
        <article className="stat-card"><div className="stat-head">총 수강생 <span className="stat-icon stat-icon--orange"><Users size={15} /></span></div><strong>2,847<span className="stat-unit">명</span></strong><div className="stat-change"><span><ArrowUpRight size={13} /> 8.2%</span> 지난달보다</div><div className="mini-chart mini-chart--orange">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div></article>
        <article className="stat-card"><div className="stat-head">운영 클래스 <span className="stat-icon stat-icon--blue"><BookOpen size={15} /></span></div><strong>{classes.length}<span className="stat-unit">개</span></strong><div className="stat-change"><span><ArrowUpRight size={13} /> 3개</span> 이번 달 새로 오픈</div><div className="mini-chart mini-chart--blue">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div></article>
      </div>
      <section className="admin-panel">
        <div className="panel-heading"><div><h2>클래스 한눈에 보기</h2><p>우리 워크스페이스의 클래스를 관리해요.</p></div><button className="panel-filter" onClick={() => setSortOrder((order) => order === "latest" ? "students" : "latest")}>{sortOrder === "latest" ? "수강생 많은순" : "최근 업데이트순"} <ChevronDown size={14} /></button></div>
        <div className="admin-tabs">{tabs.slice(0, 3).map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "admin-tab admin-tab--active" : "admin-tab"}>{tab}{tab === "전체 클래스" && <span>{classes.length}</span>}</button>)}</div>
        {renderClassTable(4)}
        <div className="panel-action-row"><button className="text-action" onClick={() => selectSection("classes")}>클래스 전체 보기 <ArrowDownRight size={14} /></button></div>
      </section>
      <div className="admin-bottom-grid">
        <article className="upcoming-panel"><div className="panel-heading"><div><h2>다가오는 일정</h2><p>놓치지 않도록 미리 확인해요.</p></div><button className="text-action" onClick={() => selectSection("calendar")}>전체 보기 <ArrowDownRight size={14} /></button></div>
          <div className="upcoming-row"><div className="date-block"><b>11</b><span>오늘</span></div><div><b>아이패드 드로잉 라이브</b><small>김하나 크리에이터 · 오후 8:00</small></div><span className="calendar-tag calendar-tag--live">LIVE</span></div>
          <div className="upcoming-row"><div className="date-block"><b>14</b><span>10월</span></div><div><b>스마트폰 사진 클래스 오픈</b><small>이도현 크리에이터 · 오후 7:30</small></div><span className="calendar-tag">오픈 예정</span></div>
        </article>
        <article className="live-admin-card"><div className="live-card-top"><span><i /> {liveOn ? "LIVE IN PROGRESS" : "STUDIO OFFLINE"}</span><button aria-label="라이브 스튜디오 열기" onClick={() => selectSection("live")}><MoreHorizontal size={18} /></button></div><div className="live-card-title"><Video size={19} /><span><b>드로잉 클럽</b><small>김하나 크리에이터 진행 중</small></span></div><div className="live-card-stat"><strong>{liveOn ? "24" : "0"}</strong><span>명이 함께 배우고 있어요</span><div>{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</div></div><Button variant="secondary" onClick={() => selectSection("live")}>라이브 모니터링 <ArrowUpRight size={14} /></Button></article>
      </div>
    </>
  );

  const renderClasses = () => (
    <>
      <div className="section-intro"><div><h2>클래스 관리</h2><p>클래스를 만들고 모집 상태와 일정을 관리하세요.</p></div><Button onClick={() => openClassModal()}><Plus size={15} /> 새 클래스</Button></div>
      <section className="admin-panel">
        <div className="admin-tabs">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "admin-tab admin-tab--active" : "admin-tab"}>{tab}{tab === "전체 클래스" && <span>{classes.length}</span>}</button>)}</div>
        {renderClassTable()}
      </section>
      <div className="insight-grid"><article><span>모집 중</span><b>{classes.filter((item) => item.status === "모집 중" || item.status === "마감 임박").length}개</b><small>신규 수강생을 기다리고 있어요.</small></article><article><span>임시 저장</span><b>{classes.filter((item) => item.status === "임시 저장").length}개</b><small>작성 중인 클래스를 이어서 완성하세요.</small></article><article><span>총 수강생</span><b>{classes.reduce((total, item) => total + item.students, 0).toLocaleString("ko-KR")}명</b><small>전체 클래스 누적 수강생입니다.</small></article></div>
    </>
  );

  const renderCreators = () => {
    const filteredCreators = creators.filter((creator) =>
      `${creator.name} ${creator.role} ${creator.category}`.toLowerCase().includes(query.toLowerCase()),
    );
    return (
      <>
        <div className="section-intro"><div><h2>크리에이터</h2><p>함께 클래스를 만드는 크리에이터와 활동 현황을 확인하세요.</p></div><Button variant="secondary" onClick={() => notify("초대 링크를 복사했어요.")}>크리에이터 초대 <Plus size={14} /></Button></div>
        <div className="creator-grid">{filteredCreators.map((creator, index) => <article className="creator-card" key={creator.name}><div className={`creator-avatar creator-avatar--${index % 4}`}>{creator.name.slice(0, 1)}</div><div className="creator-info"><h3>{creator.name}</h3><p>{creator.role} · {creator.category}</p></div><span className="creator-status"><i />{creator.status}</span><div className="creator-metrics"><span><b>{creator.classes}</b>클래스</span><span><b>{creator.students.toLocaleString("ko-KR")}</b>수강생</span></div><button className="creator-action" onClick={() => notify(`${creator.name} 크리에이터 상세 정보를 열었어요.`)}>프로필 보기 <ArrowUpRight size={13} /></button></article>)}</div>
        {filteredCreators.length === 0 && <div className="empty-panel">검색 결과가 없어요. 다른 이름이나 분야를 검색해보세요.</div>}
      </>
    );
  };

  const renderCalendar = () => (
    <>
      <div className="section-intro"><div><h2>일정 관리</h2><p>클래스 오픈과 라이브 일정을 한 곳에서 확인하세요.</p></div><Button onClick={() => { selectSection("classes"); openClassModal(); }}>일정 등록 <Plus size={15} /></Button></div>
      <section className="calendar-panel"><div className="calendar-toolbar"><button aria-label="이전 달" onClick={() => setCalendarMonthOffset((offset) => offset - 1)}>←</button><h3>{calendarYear}년 {calendarMonth + 1}월</h3><button aria-label="다음 달" onClick={() => setCalendarMonthOffset((offset) => offset + 1)}>→</button><button className="today-button" onClick={() => setCalendarMonthOffset(0)}>기준 월로</button></div><div className="calendar-grid">{["일", "월", "화", "수", "목", "금", "토"].map((day) => <b className="calendar-day-label" key={day}>{day}</b>)}{Array.from({ length: 42 }, (_, index) => { const day = index - calendarFirstDay + 1; const valid = day > 0 && day <= calendarDaysInMonth; const events: Record<number, string> = calendarMonthOffset === 0 ? { 11: "드로잉 라이브", 14: "사진 클래스 오픈", 16: "도자기 클래스", 18: "핸드드립 클래스", 20: "필름 사진 수업" } : {}; return <button key={index} className={`calendar-cell${calendarMonthOffset === 0 && day === 11 ? " calendar-cell--today" : ""}${valid ? "" : " calendar-cell--muted"}`} disabled={!valid} onClick={() => valid && notify(events[day] ? `${day}일 일정: ${events[day]}` : `${day}일에는 등록된 일정이 없어요.`)}><span>{valid ? day : day <= 0 ? new Date(calendarYear, calendarMonth, 0).getDate() + day : day - calendarDaysInMonth}</span>{valid && events[day] && <small>{events[day]}</small>}</button>; })}</div></section>
      <section className="admin-panel"><div className="panel-heading"><div><h2>예정된 일정</h2><p>클래스 일정과 라이브 시작 시간을 확인하세요.</p></div></div><div className="schedule-list">{classes.filter((item) => item.status !== "임시 저장").map((item) => <div className="upcoming-row" key={item.id}><div className="date-block"><b>{item.date.match(/\d+/)?.[0] ?? "—"}</b><span>10월</span></div><div><b>{item.title}</b><small>{item.teacher} 크리에이터 · {item.date}</small></div><span className={`status-pill ${getStatusClass(item.status)}`}><i />{item.status}</span></div>)}</div></section>
    </>
  );

  const renderLive = () => (
    <>
      <div className="section-intro"><div><h2>라이브 스튜디오</h2><p>진행 중인 세션 상태와 참여 현황을 관리하세요.</p></div><span className={`studio-state${liveOn ? " studio-state--on" : ""}`}><i />{liveOn ? "스튜디오 연결됨" : "스튜디오 대기 중"}</span></div>
      <div className="live-layout"><article className="studio-preview"><div className="studio-preview-top"><span><i />{liveOn ? "LIVE" : "OFFLINE"}</span><span>드로잉 클럽 · 세션 01</span></div><div className="studio-stage"><Video size={42} /><b>{liveOn ? "라이브 세션이 진행 중입니다" : "현재 진행 중인 라이브가 없습니다"}</b><span>{liveOn ? "강사와 학습자 연결 상태가 정상이에요." : "새 세션을 시작하거나 예정된 클래스를 확인하세요."}</span></div><div className="studio-controls"><Button onClick={() => { setLiveOn((value) => !value); notify(liveOn ? "라이브 세션을 종료했어요." : "라이브 세션을 시작했어요."); }}>{liveOn ? "세션 종료" : "세션 시작"}</Button><Button variant="secondary" onClick={() => window.open("http://localhost:3000/#live", "_blank", "noopener,noreferrer")}>학습자 화면 보기 <ArrowUpRight size={14} /></Button></div></article><aside className="studio-stats"><article><span>현재 참여자</span><b>{liveOn ? 24 : 0}명</b><small>최대 수용 인원 100명</small></article><article><span>연결 품질</span><b className="quality-good">{liveOn ? "양호" : "대기"}</b><small>Socket.IO 시그널링 서버</small></article><article><span>채팅 메시지</span><b>{liveOn ? 86 : 0}개</b><small>이번 세션 누적</small></article></aside></div>
    </>
  );

  const renderSettings = () => (
    <>
      <div className="section-intro"><div><h2>설정</h2><p>워크스페이스와 알림 환경을 관리하세요.</p></div></div>
      <section className="settings-panel"><div className="settings-heading"><h3>워크스페이스 정보</h3><p>운영자와 구성원에게 표시되는 기본 정보입니다.</p></div><label className="settings-field">워크스페이스 이름<input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} /></label><label className="settings-field">대표 이메일<input type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} /></label><div className="settings-heading settings-heading--separated"><h3>알림 설정</h3><p>필요한 업데이트만 받아보세요.</p></div><label className="toggle-setting"><span><b>중요 알림</b><small>새 수강 신청과 라이브 시작 알림</small></span><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} /></label><label className="toggle-setting"><span><b>주간 리포트</b><small>매주 월요일 클래스 성과 요약</small></span><input type="checkbox" checked={weeklyReport} onChange={(event) => setWeeklyReport(event.target.checked)} /></label><div className="settings-footer"><span>{savedSettings ? "변경 사항이 저장되었습니다." : "변경 후 저장을 눌러 적용하세요."}</span><Button onClick={() => { try { localStorage.setItem("classmate-workspace-settings", JSON.stringify({ workspaceName, adminEmail, notifications, weeklyReport })); setSavedSettings(true); notify("설정을 저장했어요."); } catch (error) { console.error("Could not save workspace settings", error); notify("설정을 저장하지 못했어요."); } }}><Check size={14} /> 변경 사항 저장</Button></div></section>
      <section className="danger-zone"><div><h3>계정</h3><p>현재 데모 로그인 세션을 종료합니다.</p></div><Button variant="secondary" onClick={() => setConfirmLogout(true)}>로그아웃 <LogOut size={14} /></Button></section>
    </>
  );

  const renderHelp = () => (
    <>
      <div className="section-intro"><div><h2>도움말</h2><p>클래스 운영에 필요한 기본 안내를 확인하세요.</p></div><a className="help-contact" href="mailto:support@classmate.kr">문의하기 <ArrowUpRight size={14} /></a></div>
      <section className="help-hero"><CircleHelp size={24} /><div><h3>무엇을 도와드릴까요?</h3><p>아래 질문을 선택하면 안내를 확인할 수 있어요.</p></div><label><Search size={15} /><input aria-label="도움말 검색" placeholder="도움말 검색" value={query} onChange={(event) => setQuery(event.target.value)} /></label></section>
      <div className="faq-list">{[
        ["클래스는 어떻게 만들 수 있나요?", "클래스 관리 탭의 ‘새 클래스’ 버튼을 눌러 제목, 크리에이터, 카테고리와 모집 상태를 입력하면 됩니다."],
        ["라이브 수업은 어떻게 시작하나요?", "라이브 스튜디오 탭에서 세션을 시작한 뒤 학습자 플랫폼의 라이브 강의실을 열어 연결 상태를 확인하세요."],
        ["수강생과 클래스 정보를 수정할 수 있나요?", "클래스 목록의 옵션 메뉴에서 클래스 정보를 수정하거나 삭제할 수 있습니다. 데모 데이터는 브라우저 세션에만 반영됩니다."],
        ["로그인 정보는 안전하게 저장되나요?", "현재 화면은 백엔드가 연결되지 않은 데모입니다. 비밀번호는 저장하지 않으며, 실제 서비스 인증으로 사용할 수 없습니다."],
      ].filter(([question]) => question.toLowerCase().includes(query.toLowerCase())).map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={16} /></summary><p>{answer}</p></details>)}</div>
    </>
  );

  const content = {
    dashboard: renderDashboard,
    classes: renderClasses,
    creators: renderCreators,
    calendar: renderCalendar,
    live: renderLive,
    settings: renderSettings,
    help: renderHelp,
  }[activeSection]();

  if (!ready) {
    return <main className="admin-access-gate" role="status">로그인 상태를 확인하고 있어요.</main>;
  }

  if (!user || user.role === "learner") {
    return (
      <main className="admin-access-gate">
        <section>
          <span className="workspace-mark">c.</span>
          <h1>강사·관리자 전용 워크스페이스</h1>
          <p>
            클래스와 크리에이터 관리 기능은 강사 또는 관리자 데모 역할로 로그인해야 이용할 수 있습니다.
          </p>
          <button className="auth-submit" type="button" onClick={() => setShowAuth(true)}>
            로그인
          </button>
          {showAuth && (
            <AuthDialog
              initialMode="login"
              onAuthenticated={handleAuth}
              onClose={() => setShowAuth(false)}
            />
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <button className="admin-brand admin-brand-button" onClick={() => selectSection("dashboard")}><span>✳</span> classmate<small>STUDIO</small></button>
        <button className="workspace-select" onClick={() => setWorkspaceMenuOpen((open) => !open)} aria-expanded={workspaceMenuOpen}><span className="workspace-mark">c.</span><span><b>Classmate Studio</b><small>워크스페이스</small></span><ChevronDown size={14} /></button>
        {workspaceMenuOpen && <div className="workspace-menu"><button onClick={() => { notify("현재 Classmate Studio 워크스페이스입니다."); setWorkspaceMenuOpen(false); }}>Classmate Studio <Check size={13} /></button><button onClick={() => { notify("워크스페이스는 하나만 연결되어 있어요."); setWorkspaceMenuOpen(false); }}>워크스페이스 추가 <Plus size={13} /></button></div>}
        <div className="side-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="워크스페이스 메뉴">
          <button className={`admin-nav-item${activeSection === "dashboard" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("dashboard")}><LayoutDashboard size={17} /> 대시보드</button>
          <button className={`admin-nav-item${activeSection === "classes" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("classes")}><BookOpen size={17} /> 클래스 관리 <span>{classes.length}</span></button>
          <button className={`admin-nav-item${activeSection === "creators" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("creators")}><Users size={17} /> 크리에이터</button>
          <button className={`admin-nav-item${activeSection === "calendar" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("calendar")}><CalendarDays size={17} /> 일정 관리</button>
          <button className={`admin-nav-item${activeSection === "live" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("live")}><Video size={17} /> 라이브 스튜디오 {liveOn && <i />}</button>
        </nav>
        <div className="side-label side-label--lower">PREFERENCES</div>
        <nav className="admin-nav" aria-label="설정 메뉴">
          <button className={`admin-nav-item${activeSection === "settings" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("settings")}><Settings2 size={17} /> 설정</button>
          <button className={`admin-nav-item${activeSection === "help" ? " admin-nav-item--active" : ""}`} onClick={() => selectSection("help")}><CircleHelp size={17} /> 도움말</button>
        </nav>
        <div className="sidebar-bottom">
          <button className="admin-profile admin-profile-button" onClick={() => setProfileMenuOpen((open) => !open)} aria-expanded={profileMenuOpen}><span className="profile-picture">{user.name.slice(0, 1)}</span><span><b>{user.name}</b><small>{user.role === "admin" ? "관리자" : "강사"}</small></span><MoreHorizontal size={17} /></button>
          {profileMenuOpen && <div className="profile-menu">{user ? <><button onClick={() => selectSection("settings")}><Settings2 size={14} /> 계정 설정</button><button onClick={() => setConfirmLogout(true)}><LogOut size={14} /> 로그아웃</button></> : <><div className="signed-out-profile">기본 프로필</div><button onClick={() => { setProfileMenuOpen(false); setShowAuth(true); }}>로그인</button></>}</div>}
          <div className="sidebar-footnote"><span>⌘ K</span> 빠른 검색</div>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><div className="breadcrumb">워크스페이스 <span>/</span> <b>{activeSectionLabel}</b></div><div className="admin-top-actions"><label className="admin-search"><Search size={15} /><input className="admin-search-input" aria-label="워크스페이스 검색" placeholder="무엇이든 검색하세요" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd><Command size={10} /> K</kbd></label><button className="admin-icon" aria-label="알림" onClick={() => notify(liveOn ? "드로잉 클럽 라이브가 진행 중이에요." : "새로운 알림이 없어요.")}><Bell size={17} /><i /></button><button className="profile-picture profile-picture--small profile-trigger" aria-label="프로필 메뉴" onClick={() => setProfileMenuOpen((open) => !open)}>{user?.name.slice(0, 1) ?? "?"}</button></div></header>
        <div className="admin-content">
          <div className="admin-welcome"><div><div className="admin-date">SUNDAY, OCTOBER 11, 2026</div><h1>{activeSection === "dashboard" ? `좋은 오후예요, ${user?.name ?? "게스트"}님` : activeSectionLabel}<span> ✳</span></h1><p>{activeSection === "dashboard" ? "오늘도 새로운 배움이 피어나고 있어요." : "워크스페이스 운영에 필요한 정보를 확인하세요."}</p></div>{activeSection !== "settings" && activeSection !== "help" && <Button onClick={() => openClassModal()}><Plus size={16} /> 새 클래스 만들기</Button>}</div>
          {content}
          <footer className="admin-footer">Classmate Studio <span>·</span> 좋은 배움을 만드는 사람들 <span>·</span> 데모 데이터</footer>
        </div>
      </section>
      {toast && <div className="admin-toast" role="status">{toast}</div>}
      {classModalOpen && <div className="auth-backdrop" role="presentation" onClick={() => setClassModalOpen(false)}><section className="class-editor" role="dialog" aria-modal="true" aria-labelledby="class-editor-title" onClick={(event) => event.stopPropagation()}><button className="auth-close" aria-label="닫기" onClick={() => setClassModalOpen(false)}>×</button><h2 id="class-editor-title">{editingClass ? "클래스 수정" : "새 클래스 만들기"}</h2><p>클래스 기본 정보를 입력해주세요.</p><form className="auth-form" onSubmit={saveClass}><label>클래스명<input name="title" defaultValue={editingClass?.title} required /></label><label>크리에이터<input name="teacher" defaultValue={editingClass?.teacher} required /></label><label>카테고리<select name="category" defaultValue={editingClass?.category ?? "드로잉"}><option>드로잉</option><option>사진</option><option>공예</option><option>라이프</option></select></label><label>상태<select name="status" defaultValue={editingClass?.status ?? "임시 저장"}><option>임시 저장</option><option>모집 중</option><option>진행 중</option><option>마감 임박</option></select></label><label>다음 일정<input name="date" defaultValue={editingClass?.date} placeholder="예: 10월 25일 오후 7:00" /></label><button className="auth-submit" type="submit">{editingClass ? "변경 저장" : "클래스 생성"}</button></form></section></div>}
      {showAuth && <AuthDialog initialMode="login" onAuthenticated={handleAuth} onClose={() => setShowAuth(false)} />}
      {confirmLogout && <LogoutConfirmDialog onCancel={() => setConfirmLogout(false)} onConfirm={() => { logout(); setConfirmLogout(false); setProfileMenuOpen(false); }} />}
    </main>
  );
}
