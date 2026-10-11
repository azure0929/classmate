"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next, useTranslation } from "react-i18next";
import LocizeBackend from "i18next-locize-backend";
import { Select } from "@mantine/core";

export type SupportedLocale = "ko" | "en" | "ja" | "vi";

const localeStorageKey = "classmate-locale";
const localeNames: Record<SupportedLocale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  vi: "Tiếng Việt",
};

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return Object.prototype.hasOwnProperty.call(localeNames, locale);
}

const resources = {
  ko: {
    common: {
      nav: { courses: "강의", videos: "무료 영상", live: "라이브", creators: "크리에이터" },
      actions: { browse: "강의 둘러보기", login: "로그인", signup: "회원가입", close: "닫기", cancel: "취소" },
      auth: {
        requiredTitle: "로그인이 필요합니다",
        requiredDescription: "학습을 이어가고 관심 강의와 실시간 소통 기능을 이용하려면 로그인해 주세요.",
        continueAsGuest: "나중에",
        continueToLogin: "로그인하기",
        welcome: "다시 만나 반가워요",
        signupWelcome: "함께 배움을 시작해요",
        loginDescription: "계정에 로그인하고 학습을 이어가세요.",
        signupDescription: "계정을 만들고 새로운 배움을 시작해 보세요.",
        email: "이메일",
        password: "비밀번호",
        name: "이름",
        demoRole: "데모 역할",
        demoNote: "데모 인증입니다. 역할은 화면 권한 확인용이며 비밀번호는 저장하거나 전송하지 않습니다.",
        signupSwitch: "아직 계정이 없으신가요? 회원가입",
        loginSwitch: "이미 계정이 있으신가요? 로그인",
        roleLearner: "학습자",
        roleInstructor: "강사",
        roleAdmin: "관리자",
        nameRequired: "이름을 입력해주세요.",
        credentialsRequired: "이메일과 비밀번호를 입력해주세요.",
      },
      library: {
        eyebrow: "KOREAN CREATOR LEARNING LIBRARY",
        title: "한국 크리에이터와 함께 시작하는 배움",
        description: "국내 개발·디자인·데이터·업무·AI·커리어 크리에이터의 공개 영상을 강의 섹션에 연결했습니다.",
        count: "{{count}}개의 공개 영상",
        channel: "채널 보기",
        all: "전체",
      },
      lesson: { publicResource: "연결된 무료 공개 영상", publicVideoLabel: "공개 영상", sourceCount: "{{count}}개 연결", source: "영상 출처", curation: "콘텐츠 큐레이션" },
      account: { profile: "내 프로필 메뉴", checking: "계정 확인 중", logout: "로그아웃" },
      logout: { title: "로그아웃 하시겠습니까?", description: "로그아웃 후에도 현재 보고 있는 페이지는 유지됩니다.", cancel: "닫기", confirm: "확인" },
      categories: {
        all: "전체",
        development: "개발",
        design: "디자인",
        data: "데이터 사이언스",
        productivity: "업무 생산성",
        ai: "AI 기술",
        career: "커리어",
      },
      pages: {
        homeEyebrow: "실무에서 바로 쓰는 배움",
        homeTitle: "배움이 실제 결과물이 되는 순간",
        homeDescription: "실무 기술을 프로젝트로 배우고 크리에이터와 소통하며 성장해요.",
        courseListTitle: "모든 강의",
        courseListDescription: "관심 있는 분야를 선택해 나에게 맞는 학습을 시작해 보세요.",
        curriculum: "커리큘럼",
        relatedVideos: "한국 크리에이터 공개 영상",
        relatedVideosDescription: "강의 섹션마다 관련 주제의 공개 학습 영상을 연결했어요.",
        courseDetail: "강의 상세",
        backToCourse: "강의 상세로 돌아가기",
        loginGateTitle: "로그인이 필요한 학습 공간이에요",
        loginGateDescription: "강의 재생, 실시간 채팅, 공개 Q&A는 로그인 후 이용할 수 있습니다.",
        videoPlayer: "강의 섹션에 연결된 공개 영상",
        publicVideoLabel: "공개 학습 영상",
        publicVideoNotice: "공개 영상은 원본 크리에이터가 제공하며 Classmate 강의와 별도로 운영됩니다.",
        connected: "소통 연결됨",
        connecting: "연결 중",
        participants: "{{count}}명 참여 중",
        instructorSpace: "강의자와 함께하는 학습 공간",
        instructorHint: "채팅으로 질문하고 학습 팁을 나눠보세요.",
        lessonCount: "{{count}}개 강의",
        openSource: "원본 영상",
      },
      language: { select: "언어 선택" },
    },
  },
  en: {
    common: {
      nav: { courses: "Courses", videos: "Free videos", live: "Live", creators: "Creators" },
      actions: { browse: "Browse courses", login: "Log in", signup: "Sign up", close: "Close", cancel: "Cancel" },
      auth: {
        requiredTitle: "Sign in required",
        requiredDescription: "Sign in to continue learning, save courses, and join live conversations.",
        continueAsGuest: "Not now",
        continueToLogin: "Log in",
        welcome: "Welcome back",
        signupWelcome: "Start learning with us",
        loginDescription: "Log in to continue your learning journey.",
        signupDescription: "Create an account and start learning.",
        email: "Email",
        password: "Password",
        name: "Name",
        demoRole: "Demo role",
        demoNote: "Demo authentication only. Your role controls this preview; passwords are never saved or sent.",
        signupSwitch: "New here? Sign up",
        loginSwitch: "Already have an account? Log in",
        roleLearner: "Learner",
        roleInstructor: "Instructor",
        roleAdmin: "Admin",
        nameRequired: "Enter your name.",
        credentialsRequired: "Enter your email and password.",
      },
      library: {
        eyebrow: "KOREAN CREATOR LEARNING LIBRARY",
        title: "Learn with Korean creators",
        description: "Public videos from Korean creators are matched to course sections across six learning categories.",
        count: "{{count}} public videos",
        channel: "Visit channel",
        all: "All",
      },
      lesson: { publicResource: "Related free public video", publicVideoLabel: "Public videos", sourceCount: "{{count}} linked", source: "Video source", curation: "Curated by" },
      account: { profile: "Profile menu", checking: "Checking account", logout: "Log out" },
      logout: { title: "Log out?", description: "You will stay on the page you are viewing.", cancel: "Cancel", confirm: "Log out" },
      categories: {
        all: "All",
        development: "Development",
        design: "Design",
        data: "Data Science",
        productivity: "Productivity",
        ai: "AI",
        career: "Career",
      },
      pages: {
        homeEyebrow: "Learn by building real things",
        homeTitle: "Turn learning into real outcomes",
        homeDescription: "Build practical skills through projects and learn alongside creators.",
        courseListTitle: "All courses",
        courseListDescription: "Choose a topic and start learning with a course that fits your goals.",
        curriculum: "Curriculum",
        relatedVideos: "Videos from Korean creators",
        relatedVideosDescription: "Each course section links to a related public learning video.",
        courseDetail: "Course details",
        backToCourse: "Back to course details",
        loginGateTitle: "Sign in to continue learning",
        loginGateDescription: "Sign in to watch lessons, chat live, and join public Q&A.",
        videoPlayer: "Public video linked to this course section",
        publicVideoLabel: "Public learning video",
        publicVideoNotice: "Public videos are provided by their creators and are separate from Classmate courses.",
        connected: "Connected",
        connecting: "Connecting",
        participants: "{{count}} participants",
        instructorSpace: "Learn with your instructor",
        instructorHint: "Ask questions and share learning tips in chat.",
        lessonCount: "{{count}} lessons",
        openSource: "Watch source",
      },
      language: { select: "Select language" },
    },
  },
  ja: {
    common: {
      nav: { courses: "講座", videos: "無料動画", live: "ライブ", creators: "クリエイター" },
      actions: { browse: "講座を見る", login: "ログイン", signup: "新規登録", close: "閉じる", cancel: "キャンセル" },
      auth: {
        requiredTitle: "ログインが必要です",
        requiredDescription: "学習を続け、お気に入り講座やライブ交流を利用するにはログインしてください。",
        continueAsGuest: "後で",
        continueToLogin: "ログイン",
        welcome: "おかえりなさい",
        signupWelcome: "一緒に学びを始めましょう",
        loginDescription: "ログインして学習を続けましょう。",
        signupDescription: "アカウントを作成して学習を始めましょう。",
        email: "メールアドレス",
        password: "パスワード",
        name: "名前",
        demoRole: "デモの役割",
        demoNote: "デモ認証です。役割は画面確認用で、パスワードは保存・送信されません。",
        signupSwitch: "初めてですか？新規登録",
        loginSwitch: "アカウントをお持ちですか？ログイン",
        roleLearner: "学習者",
        roleInstructor: "講師",
        roleAdmin: "管理者",
        nameRequired: "名前を入力してください。",
        credentialsRequired: "メールアドレスとパスワードを入力してください。",
      },
      library: {
        eyebrow: "KOREAN CREATOR LEARNING LIBRARY",
        title: "韓国のクリエイターと学ぶ",
        description: "韓国の開発・デザイン・データ・業務・AI・キャリア動画を講座の各セクションに関連付けました。",
        count: "公開動画 {{count}} 件",
        channel: "チャンネルを見る",
        all: "すべて",
      },
      lesson: { publicResource: "関連する無料公開動画", publicVideoLabel: "公開動画", sourceCount: "{{count}}件", source: "動画の出典", curation: "コンテンツキュレーション" },
      account: { profile: "プロフィールメニュー", checking: "アカウント確認中", logout: "ログアウト" },
      logout: { title: "ログアウトしますか？", description: "ログアウト後も現在のページは表示されます。", cancel: "閉じる", confirm: "ログアウト" },
      categories: {
        all: "すべて",
        development: "開発",
        design: "デザイン",
        data: "データサイエンス",
        productivity: "業務効率化",
        ai: "AI技術",
        career: "キャリア",
      },
      pages: {
        homeEyebrow: "実践につながる学び",
        homeTitle: "学びを実際の成果につなげる",
        homeDescription: "プロジェクトを通じて実務スキルを学び、クリエイターと交流しましょう。",
        courseListTitle: "すべての講座",
        courseListDescription: "興味のある分野を選んで、自分に合った学習を始めましょう。",
        curriculum: "カリキュラム",
        relatedVideos: "韓国クリエイターの公開動画",
        relatedVideosDescription: "講座の各セクションに関連する公開学習動画を掲載しています。",
        courseDetail: "講座詳細",
        backToCourse: "講座詳細に戻る",
        loginGateTitle: "ログインして学習を続けましょう",
        loginGateDescription: "動画視聴、ライブチャット、公開Q&Aにはログインが必要です。",
        videoPlayer: "講座セクションに関連する公開動画",
        publicVideoLabel: "公開学習動画",
        publicVideoNotice: "公開動画は各クリエイターが提供しており、Classmateの講座とは別に運営されています。",
        connected: "接続済み",
        connecting: "接続中",
        participants: "{{count}}人が参加中",
        instructorSpace: "講師と一緒に学ぶスペース",
        instructorHint: "チャットで質問したり、学習のコツを共有したりできます。",
        lessonCount: "{{count}}件のレッスン",
        openSource: "元動画を見る",
      },
      language: { select: "言語を選択" },
    },
  },
  vi: {
    common: {
      nav: { courses: "Khóa học", videos: "Video miễn phí", live: "Trực tiếp", creators: "Nhà sáng tạo" },
      actions: { browse: "Khám phá khóa học", login: "Đăng nhập", signup: "Đăng ký", close: "Đóng", cancel: "Hủy" },
      auth: {
        requiredTitle: "Vui lòng đăng nhập",
        requiredDescription: "Đăng nhập để tiếp tục học, lưu khóa học và tham gia trao đổi trực tiếp.",
        continueAsGuest: "Để sau",
        continueToLogin: "Đăng nhập",
        welcome: "Chào mừng bạn quay lại",
        signupWelcome: "Bắt đầu học cùng chúng tôi",
        loginDescription: "Đăng nhập để tiếp tục hành trình học tập.",
        signupDescription: "Tạo tài khoản và bắt đầu học ngay.",
        email: "Email",
        password: "Mật khẩu",
        name: "Tên",
        demoRole: "Vai trò dùng thử",
        demoNote: "Đây là xác thực dùng thử. Vai trò chỉ dùng để xem giao diện; mật khẩu không được lưu hoặc gửi đi.",
        signupSwitch: "Bạn mới? Đăng ký",
        loginSwitch: "Đã có tài khoản? Đăng nhập",
        roleLearner: "Học viên",
        roleInstructor: "Giảng viên",
        roleAdmin: "Quản trị viên",
        nameRequired: "Vui lòng nhập tên.",
        credentialsRequired: "Vui lòng nhập email và mật khẩu.",
      },
      library: {
        eyebrow: "KOREAN CREATOR LEARNING LIBRARY",
        title: "Học cùng nhà sáng tạo Hàn Quốc",
        description: "Video công khai từ các nhà sáng tạo Hàn Quốc được ghép với từng phần khóa học thuộc sáu lĩnh vực.",
        count: "{{count}} video công khai",
        channel: "Xem kênh",
        all: "Tất cả",
      },
      lesson: { publicResource: "Video công khai miễn phí liên quan", publicVideoLabel: "Video công khai", sourceCount: "{{count}} video", source: "Nguồn video", curation: "Được tuyển chọn bởi" },
      account: { profile: "Menu hồ sơ", checking: "Đang kiểm tra tài khoản", logout: "Đăng xuất" },
      logout: { title: "Bạn có muốn đăng xuất không?", description: "Bạn vẫn ở lại trang hiện tại sau khi đăng xuất.", cancel: "Đóng", confirm: "Đăng xuất" },
      categories: {
        all: "Tất cả",
        development: "Phát triển",
        design: "Thiết kế",
        data: "Khoa học dữ liệu",
        productivity: "Năng suất",
        ai: "Công nghệ AI",
        career: "Sự nghiệp",
      },
      pages: {
        homeEyebrow: "Học qua dự án thực tế",
        homeTitle: "Biến việc học thành kết quả thực tế",
        homeDescription: "Phát triển kỹ năng thực tế qua dự án và trao đổi cùng nhà sáng tạo.",
        courseListTitle: "Tất cả khóa học",
        courseListDescription: "Chọn lĩnh vực bạn quan tâm và bắt đầu học theo mục tiêu của mình.",
        curriculum: "Nội dung khóa học",
        relatedVideos: "Video công khai từ nhà sáng tạo Hàn Quốc",
        relatedVideosDescription: "Mỗi phần khóa học được liên kết với video học tập liên quan.",
        courseDetail: "Chi tiết khóa học",
        backToCourse: "Quay lại chi tiết khóa học",
        loginGateTitle: "Đăng nhập để tiếp tục học",
        loginGateDescription: "Đăng nhập để xem bài học, trò chuyện trực tiếp và tham gia hỏi đáp.",
        videoPlayer: "Video công khai liên kết với phần học này",
        publicVideoLabel: "Video học tập công khai",
        publicVideoNotice: "Video công khai do nhà sáng tạo cung cấp và hoạt động độc lập với khóa học Classmate.",
        connected: "Đã kết nối",
        connecting: "Đang kết nối",
        participants: "{{count}} người tham gia",
        instructorSpace: "Không gian học cùng giảng viên",
        instructorHint: "Đặt câu hỏi và chia sẻ mẹo học tập qua trò chuyện.",
        lessonCount: "{{count}} bài học",
        openSource: "Xem video gốc",
      },
      language: { select: "Chọn ngôn ngữ" },
    },
  },
} as const;

const locizeProjectId = process.env.NEXT_PUBLIC_LOCIZE_PROJECT_ID;
const locizeVersion = process.env.NEXT_PUBLIC_LOCIZE_VERSION ?? "latest";
const i18n = createInstance();
let initialization: Promise<void> | undefined;

function initializeLocalization() {
  if (initialization) return initialization;

  const instance = i18n.use(initReactI18next);
  if (locizeProjectId) instance.use(LocizeBackend);
  i18n.on("failedLoading", (language, namespace, message) => {
    console.warn(`Could not load ${namespace} translations for ${language}`, message);
  });

  initialization = instance
    .init({
      resources,
      lng: "ko",
      fallbackLng: "ko",
      supportedLngs: Object.keys(localeNames),
      defaultNS: "common",
      ns: ["common"],
      initAsync: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      ...(locizeProjectId
        ? {
            backend: {
              projectId: locizeProjectId,
              version: locizeVersion,
              referenceLng: "ko",
            },
          }
        : {}),
    })
    .then(() => undefined);

  return initialization;
}

void initializeLocalization().catch((error: unknown) => {
  console.error("Could not initialize localization", error);
});

export function LocalizationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let active = true;
    initializeLocalization()
      .then(async () => {
        let stored: string | null = null;
        try {
          stored = window.localStorage.getItem(localeStorageKey);
        } catch (error) {
          console.warn("Could not read saved language preference", error);
        }
        if (stored && isSupportedLocale(stored)) {
          await i18n.changeLanguage(stored);
        }
        if (active) {
          document.documentElement.lang = i18n.resolvedLanguage ?? "ko";
        }
      })
      .catch((error: unknown) => {
        console.error("Could not initialize localization", error);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

export function LanguageSwitcher() {
  const { i18n: instance, t } = useTranslation("common", { useSuspense: false });
  const value = (instance.resolvedLanguage?.split("-")[0] ?? "ko") as SupportedLocale;

  return (
    <Select
      aria-label={t("language.select", { defaultValue: "언어 선택" })}
      data={Object.entries(localeNames).map(([locale, label]) => ({
        value: locale,
        label,
      }))}
      value={value}
      onChange={(nextLocale) => {
        if (!nextLocale || !isSupportedLocale(nextLocale)) return;
        void instance.changeLanguage(nextLocale).then(() => {
          document.documentElement.lang = nextLocale;
          try {
            window.localStorage.setItem(localeStorageKey, nextLocale);
          } catch (error) {
            console.warn("Could not save language preference", error);
          }
        });
      }}
      allowDeselect={false}
      size="xs"
      w={112}
      comboboxProps={{ withinPortal: true }}
    />
  );
}

export { useTranslation };
