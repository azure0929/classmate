export type LearningCategory =
  | "개발"
  | "디자인"
  | "데이터 사이언스"
  | "업무 생산성"
  | "AI 기술"
  | "커리어";

export interface CuratedVideo {
  id: string;
  category: LearningCategory;
  title: string;
  creator: string;
  videoId: string;
  channelUrl: string;
  summary: string;
}

export const learningCategories: LearningCategory[] = [
  "개발",
  "디자인",
  "데이터 사이언스",
  "업무 생산성",
  "AI 기술",
  "커리어",
];

export const curatedVideos: CuratedVideo[] = [
  {
    id: "fireship-react-100-seconds",
    category: "개발",
    title: "React in 100 Seconds",
    creator: "Fireship",
    videoId: "Tn6-PIqc4UM",
    channelUrl: "https://www.youtube.com/@Fireship",
    summary: "React의 핵심 개념을 짧은 시간 안에 훑어보는 입문 영상입니다.",
  },
  {
    id: "mosh-react-beginners",
    category: "개발",
    title: "React Tutorial for Beginners",
    creator: "Programming with Mosh",
    videoId: "SqcY0GlETPk",
    channelUrl: "https://www.youtube.com/@programmingwithmosh",
    summary: "컴포넌트와 상태를 따라 만들며 React 기초를 익힙니다.",
  },
  {
    id: "kevin-powell-flexbox",
    category: "개발",
    title: "Learn flexbox the easy way",
    creator: "Kevin Powell",
    videoId: "u044iM9xsWU",
    channelUrl: "https://www.youtube.com/@KevinPowell",
    summary: "실제 레이아웃 예제로 Flexbox의 동작 원리를 연습합니다.",
  },
  {
    id: "traversy-nextjs-crash-course",
    category: "개발",
    title: "Next.js Crash Course",
    creator: "Traversy Media",
    videoId: "mTz0GXj8NN0",
    channelUrl: "https://www.youtube.com/@TraversyMedia",
    summary: "Next.js 프로젝트의 주요 구성과 기본 개발 흐름을 살펴봅니다.",
  },
  {
    id: "figma-make-intro",
    category: "디자인",
    title: "Figma tutorial: Intro to Figma Make",
    creator: "Figma",
    videoId: "1PFkmrb4Bqg",
    channelUrl: "https://www.youtube.com/@Figma",
    summary: "Figma 공식 채널에서 Figma Make의 기본 흐름을 소개합니다.",
  },
  {
    id: "flux-figma-beginners",
    category: "디자인",
    title: "Figma Tutorial for Beginners (13-min crash course!)",
    creator: "Flux Academy",
    videoId: "jQ1sfKIl50E",
    channelUrl: "https://www.youtube.com/@FluxAcademy",
    summary: "웹 화면 제작 과정을 통해 Figma의 기본 도구를 익힙니다.",
  },
  {
    id: "figma-design-beginners",
    category: "디자인",
    title: "Course overview: Figma Design for beginners",
    creator: "Figma",
    videoId: "zzhSFobLkYw",
    channelUrl: "https://www.youtube.com/@Figma",
    summary: "Figma 공식 입문 과정의 학습 목표와 디자인 기초를 확인합니다.",
  },
  {
    id: "3blue1brown-neural-network",
    category: "데이터 사이언스",
    title: "But what is a neural network? | Deep learning chapter 1",
    creator: "3Blue1Brown",
    videoId: "aircAruvnKk",
    channelUrl: "https://www.youtube.com/@3blue1brown",
    summary: "시각적인 설명으로 신경망의 기본 아이디어를 살펴봅니다.",
  },
  {
    id: "statquest-bias-variance",
    category: "데이터 사이언스",
    title: "Machine Learning Fundamentals: Bias and Variance",
    creator: "StatQuest with Josh Starmer",
    videoId: "EuBBz3bI-aA",
    channelUrl: "https://www.youtube.com/@statquest",
    summary: "머신러닝 모델의 편향과 분산 개념을 직관적으로 비교합니다.",
  },
  {
    id: "ali-abdaal-productivity-system",
    category: "업무 생산성",
    title: "How to Build Your Ultimate Productivity System",
    creator: "Ali Abdaal",
    videoId: "T6hmdrsLQj8",
    channelUrl: "https://www.youtube.com/@aliabdaal",
    summary: "개인 업무 흐름과 생산성 시스템을 구성하는 방법을 다룹니다.",
  },
  {
    id: "jeff-su-productivity-system",
    category: "업무 생산성",
    title: "The Productivity System I Taught to 6,642 Googlers",
    creator: "Jeff Su",
    videoId: "oO9GLC2iKy8",
    channelUrl: "https://www.youtube.com/@JeffSu",
    summary: "실무에서 반복 가능한 업무 정리 시스템을 소개합니다.",
  },
  {
    id: "notion-projects-overview",
    category: "업무 생산성",
    title: "Welcome to Notion Projects",
    creator: "Notion",
    videoId: "GImxy01wW0o",
    channelUrl: "https://www.youtube.com/@Notion",
    summary: "Notion 공식 채널에서 프로젝트 업무를 정리하는 방법을 소개합니다.",
  },
  {
    id: "openai-chatgpt-work",
    category: "AI 기술",
    title: "Get started with ChatGPT Work",
    creator: "OpenAI",
    videoId: "GphgJjaKKhw",
    channelUrl: "https://www.youtube.com/@OpenAI",
    summary: "OpenAI 공식 채널에서 ChatGPT 업무 기능의 시작 방법을 안내합니다.",
  },
  {
    id: "two-minute-papers-ai-protein",
    category: "AI 기술",
    title: "DeepMind's New AI Just Cracked The Code Of Life",
    creator: "Two Minute Papers",
    videoId: "Wkaw03p3BrM",
    channelUrl: "https://www.youtube.com/@TwoMinutePapers",
    summary: "AI 연구가 단백질과 생명과학 문제에 적용되는 사례를 소개합니다.",
  },
  {
    id: "yannic-llama-paper",
    category: "AI 기술",
    title: "LLaMA: Open and Efficient Foundation Language Models (Paper Explained)",
    creator: "Yannic Kilcher",
    videoId: "E5OnoYF2oAk",
    channelUrl: "https://www.youtube.com/@YannicKilcher",
    summary: "언어 모델 연구 논문을 바탕으로 오픈 파운데이션 모델을 살펴봅니다.",
  },
  {
    id: "google-career-identity",
    category: "커리어",
    title: "What is Your Career Identity? | Google Career Certificates",
    creator: "Grow with Google",
    videoId: "_xbT4qMrot4",
    channelUrl: "https://www.youtube.com/@growwithgoogle",
    summary: "경험과 관심사를 바탕으로 커리어 방향을 정리해 봅니다.",
  },
  {
    id: "neetcode-coding-interviews-2026",
    category: "커리어",
    title: "Coding Interviews in 2026",
    creator: "NeetCode",
    videoId: "eTY2Lwnd2fI",
    channelUrl: "https://www.youtube.com/@NeetCode",
    summary: "코딩 인터뷰 준비 방법과 달라지는 채용 흐름을 살펴봅니다.",
  },
  {
    id: "joma-software-engineer-interview",
    category: "커리어",
    title: "Interview with a Software Engineer without CS Degree",
    creator: "Joma Tech",
    videoId: "65yjBKfefj8",
    channelUrl: "https://www.youtube.com/@JomaTech",
    summary: "컴퓨터공학 전공 없이 소프트웨어 엔지니어로 일하는 경험을 들어봅니다.",
  },
];
