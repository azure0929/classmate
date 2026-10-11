import type { Course } from "../types/course";

const courseIdeas = [
  {
    category: "개발",
    image: "photo-1516321318423-f06f85e504b3",
    color: "#b9cde0",
    subcategories: [
      { name: "백엔드", titles: ["TypeScript와 NestJS로 만드는 REST API", "Spring Boot 실전 백엔드와 인증 설계", "Node.js 서버 성능 최적화와 배포"] },
      { name: "프론트엔드", titles: ["React와 TypeScript로 만드는 서비스 UI", "Next.js App Router 실전 렌더링 전략", "TanStack Query로 완성하는 서버 상태 관리"] },
      { name: "풀스택", titles: ["Next.js와 MySQL로 만드는 풀스택 서비스", "React·Node.js로 구현하는 실시간 협업 앱", "인증부터 배포까지 풀스택 프로젝트"] },
      { name: "모바일 앱", titles: ["React Native로 시작하는 iOS·Android 앱", "Expo와 TypeScript로 만드는 모바일 서비스", "React Native 네이티브 모듈 연동 실전"] },
      { name: "알고리즘", titles: ["코딩 테스트를 위한 알고리즘 핵심 정리", "JavaScript로 푸는 실전 알고리즘 문제", "자료형부터 그래프까지 알고리즘 완주"] },
      { name: "자료구조", titles: ["그림으로 이해하는 자료구조와 복잡도", "TypeScript로 직접 구현하는 자료구조", "면접에 자주 나오는 자료구조 핵심"] },
      { name: "개발 도구", titles: ["VS Code 생산성을 높이는 개발 워크플로", "Webpack과 Vite 번들링 원리와 최적화", "브라우저 개발자 도구로 디버깅하기"] },
      { name: "웹 퍼블리싱", titles: ["HTML·CSS 반응형 웹 퍼블리싱 기초", "접근성까지 고려한 시맨틱 마크업", "Flexbox와 Grid로 완성하는 웹 레이아웃"] },
      { name: "데이터베이스", titles: ["MySQL 모델링부터 인덱스 최적화까지", "SQL로 배우는 관계형 데이터베이스 설계", "실전 서비스 데이터 모델링과 쿼리 튜닝"] },
      { name: "DevOps·클라우드", titles: ["Docker와 GitHub Actions로 CI/CD 구축", "AWS에 배포하는 컨테이너 서비스", "모니터링과 로그로 배우는 운영 기초"] },
      { name: "Git·GitHub", titles: ["Git과 GitHub 협업을 위한 브랜치 전략", "Pull Request 코드 리뷰 실전 가이드", "GitHub Actions 자동화 워크플로 만들기"] },
    ],
  },
  {
    category: "디자인",
    image: "photo-1561070791-2526d30994b5",
    color: "#edc6b5",
    subcategories: [
      { name: "UI·UX", titles: ["사용자 흐름으로 시작하는 UX 설계", "사용성 테스트와 인터뷰 실전", "작은 화면부터 설계하는 모바일 UX"] },
      { name: "웹 디자인", titles: ["브랜드가 살아나는 웹페이지 디자인", "레이아웃과 타이포그래피 웹 디자인 기초", "반응형 웹 시안과 디자인 시스템 만들기"] },
      { name: "그래픽 디자인", titles: ["시선을 끄는 그래픽 포스터 디자인", "색과 형태로 배우는 비주얼 디자인", "브랜드를 위한 그래픽 에셋 제작"] },
      { name: "프로덕트 디자인", titles: ["문제 정의부터 프로덕트 디자인까지", "실제 제품 개선으로 배우는 디자인 프로세스", "제품 지표와 연결하는 UX 의사결정"] },
      { name: "Figma", titles: ["Figma 컴포넌트와 오토레이아웃 완전 정복", "Figma 변수로 만드는 디자인 시스템", "개발 핸드오프를 위한 Figma 실전"] },
    ],
  },
  {
    category: "데이터 사이언스",
    image: "photo-1551288049-bebda4e38f71",
    color: "#c5d6c8",
    subcategories: [
      { name: "Python 데이터 분석", titles: ["Pandas로 시작하는 데이터 분석 실무", "Python으로 만드는 데이터 수집·정제 파이프라인", "실제 데이터로 배우는 탐색적 분석"] },
      { name: "SQL", titles: ["서비스 지표를 뽑는 SQL 분석 실전", "조인과 윈도 함수로 배우는 SQL 심화", "분석가를 위한 데이터 추출과 리포트"] },
      { name: "통계·분석", titles: ["데이터 분석에 필요한 통계 기초", "가설 검정과 A/B 테스트 이해하기", "실험 설계로 배우는 제품 데이터 분석"] },
      { name: "머신러닝", titles: ["Scikit-learn으로 시작하는 머신러닝", "모델 평가와 피처 엔지니어링 실전", "분류·회귀 프로젝트로 익히는 ML 기초"] },
      { name: "데이터 시각화", titles: ["Python과 Plotly로 만드는 데이터 시각화", "대시보드로 전달하는 데이터 스토리", "분석 결과를 명확하게 보여주는 차트 설계"] },
    ],
  },
  {
    category: "업무 생산성",
    image: "photo-1454165804606-c3d57bc86b40",
    color: "#e4d5a9",
    subcategories: [
      { name: "문서·Notion", titles: ["Notion으로 만드는 팀 위키와 지식 관리", "개인 업무를 정리하는 Notion 시스템", "읽히는 기술 문서와 협업 문서 작성법"] },
      { name: "스프레드시트", titles: ["실무에 바로 쓰는 Excel 함수와 피벗", "Google Sheets로 만드는 업무 대시보드", "반복 보고를 줄이는 스프레드시트 자동화"] },
      { name: "업무 자동화", titles: ["반복 업무를 줄이는 Python 자동화", "Zapier와 Make로 연결하는 업무 흐름", "GitHub Actions로 자동화하는 개발 업무"] },
      { name: "협업 도구", titles: ["Slack과 Notion으로 만드는 비동기 협업", "GitHub Projects로 팀 업무 관리하기", "원격 팀을 위한 협업 규칙과 워크플로"] },
      { name: "기획·프로젝트 관리", titles: ["작은 팀을 위한 애자일 프로젝트 운영", "요구사항을 명확히 하는 제품 기획 문서", "일정과 리스크를 관리하는 프로젝트 실전"] },
    ],
  },
  {
    category: "AI 기술",
    image: "photo-1677442136019-21780ecad995",
    color: "#c8c4e6",
    subcategories: [
      { name: "생성형 AI", titles: ["생성형 AI 원리와 서비스 활용 시작하기", "이미지 생성 AI로 만드는 콘텐츠 워크플로", "업무에 적용하는 생성형 AI 도구 실전"] },
      { name: "LLM·프롬프트", titles: ["LLM API와 프롬프트 엔지니어링 기초", "서비스 품질을 높이는 프롬프트 평가", "오픈소스 LLM 활용과 파인튜닝 입문"] },
      { name: "RAG·벡터 검색", titles: ["문서 검색 챗봇을 만드는 RAG 기초", "임베딩과 벡터 데이터베이스 실전", "검색 품질을 개선하는 RAG 평가와 튜닝"] },
      { name: "AI 서비스 개발", titles: ["Next.js와 LLM API로 만드는 AI 웹앱", "사용자 피드백이 있는 AI 기능 설계", "AI 서비스 안전성·비용·성능 다루기"] },
      { name: "AI 에이전트", titles: ["도구를 사용하는 AI 에이전트 만들기", "워크플로 자동화를 위한 에이전트 설계", "에이전트 평가와 안정적인 실행 전략"] },
    ],
  },
  {
    category: "커리어",
    image: "photo-1521737711867-e3b97375f902",
    color: "#d7c8b8",
    subcategories: [
      { name: "개발자 커리어", titles: ["주니어 개발자를 위한 성장 로드맵", "기술 선택의 이유를 설명하는 엔지니어링", "개발자 협업을 위한 문서와 커뮤니케이션"] },
      { name: "포트폴리오·이력서", titles: ["프로젝트 임팩트를 담는 개발자 이력서", "실무 역량이 보이는 포트폴리오 만들기", "사이드 프로젝트를 제품 경험으로 정리하기"] },
      { name: "기술 면접", titles: ["프론트엔드 기술 면접 핵심 질문", "자료구조·알고리즘 코딩 인터뷰 연습", "프로젝트 경험을 전달하는 시스템 설계 면접"] },
    ],
  },
] as const;

const imagesByCategory = Object.fromEntries(
  courseIdeas.map((group) => [group.category, group.image]),
);

const courses: Course[] = courseIdeas.flatMap((group, groupIndex) =>
  group.subcategories.flatMap((subcategory, subcategoryIndex) =>
    subcategory.titles.map((title, titleIndex) => {
      const index = subcategoryIndex * subcategory.titles.length + titleIndex;
      const coverImage = imagesByCategory[group.category];

      return {
        id: `course-${groupIndex + 1}-${subcategoryIndex + 1}-${titleIndex + 1}`,
        title,
        teacher: "Classmate 큐레이션 팀",
        category: group.category,
        subcategory: subcategory.name,
        price: 29000 + ((index * 7 + groupIndex * 5) % 15) * 3000,
        students: (180 + ((index * 173 + groupIndex * 307) % 6800)).toLocaleString("ko-KR"),
        rating: (4.72 + ((index * 7 + groupIndex * 3) % 28) / 100).toFixed(2),
        image: `https://images.unsplash.com/${coverImage}?auto=format&fit=crop&w=900&q=85`,
        color: group.color,
        label: ["NEW", "BEST", "HOT", "PICK"][index % 4],
        date: `10월 ${14 + ((index + groupIndex) % 14)}일 오후 7:00`,
      };
    }),
  ),
);

export const mockCourses: Course[] = courses;
