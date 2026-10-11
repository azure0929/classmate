export const courseCategories = [
  {
    name: "개발",
    subcategories: [
      "백엔드",
      "프론트엔드",
      "풀스택",
      "모바일 앱",
      "알고리즘",
      "자료구조",
      "개발 도구",
      "웹 퍼블리싱",
      "데이터베이스",
      "DevOps·클라우드",
      "Git·GitHub",
    ],
  },
  {
    name: "디자인",
    subcategories: ["UI·UX", "웹 디자인", "그래픽 디자인", "프로덕트 디자인", "Figma"],
  },
  {
    name: "데이터 사이언스",
    subcategories: ["Python 데이터 분석", "SQL", "통계·분석", "머신러닝", "데이터 시각화"],
  },
  {
    name: "업무 생산성",
    subcategories: ["문서·Notion", "스프레드시트", "업무 자동화", "협업 도구", "기획·프로젝트 관리"],
  },
  {
    name: "AI 기술",
    subcategories: ["생성형 AI", "LLM·프롬프트", "RAG·벡터 검색", "AI 서비스 개발", "AI 에이전트"],
  },
  {
    name: "커리어",
    subcategories: ["개발자 커리어", "포트폴리오·이력서", "기술 면접"],
  },
] as const;

export type CourseCategory = (typeof courseCategories)[number]["name"];
export type CourseSubcategory = (typeof courseCategories)[number]["subcategories"][number];
