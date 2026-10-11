import type { Course } from "../types/course";
import { curatedVideos } from "./curated-videos";

export interface CourseChapter {
  title: string;
  lessons: string[];
}

export interface CourseLearningPlan {
  outcomes: string[];
  chapters: CourseChapter[];
  requirements: string[];
  project: string;
}

const learningPlans: Record<
  Course["category"],
  Omit<CourseLearningPlan, "chapters"> & { chapterTitles: string[]; lessons: string[][] }
> = {
  개발: {
    outcomes: [
      "요구사항을 작은 기능 단위로 나누고 구현 순서를 설계합니다.",
      "실무에서 쓰이는 개발 도구와 협업 흐름을 프로젝트에 적용합니다.",
      "테스트와 배포까지 고려해 동작하는 결과물을 완성합니다.",
    ],
    chapterTitles: [
      "문제 정의와 개발 환경 준비",
      "핵심 개념과 서비스 구조 이해",
      "기능 구현과 데이터 연결",
      "예외 처리와 테스트 작성",
      "성능·접근성 점검과 개선",
      "배포하고 결과물 정리하기",
    ],
    lessons: [
      ["강의 목표와 완성할 결과물", "요구사항을 작업 단위로 나누기", "개발 환경과 프로젝트 구조"],
      ["핵심 개념을 코드로 확인하기", "유지보수 가능한 구조 만들기", "실무에서 자주 만나는 설계 선택"],
      ["첫 번째 기능 구현", "API와 화면 연결하기", "로딩·오류·빈 상태 다루기"],
      ["경계 조건과 사용자 입력 검증", "핵심 동작 테스트하기", "코드 리뷰 체크리스트"],
      ["병목과 불필요한 렌더링 찾기", "키보드·스크린리더 접근성", "개선 전후 확인하기"],
      ["배포 환경 설정", "배포 후 로그와 오류 확인", "포트폴리오에 설명할 기술 결정"],
    ],
    requirements: ["기본적인 컴퓨터 사용과 파일 관리", "강의에서 안내하는 개발 도구 설치"],
    project: "실무 흐름을 반영한 기능을 설계부터 배포까지 완성합니다.",
  },
  디자인: {
    outcomes: [
      "사용자와 문제를 구체적으로 정의하고 디자인 근거를 설명합니다.",
      "정보 구조와 시각 체계를 일관된 화면으로 발전시킵니다.",
      "피드백을 반영하고 개발에 전달 가능한 결과물을 준비합니다.",
    ],
    chapterTitles: [
      "사용자와 문제 이해하기",
      "정보 구조와 사용자 흐름 설계",
      "시각 언어와 컴포넌트 만들기",
      "화면 시안과 프로토타입 제작",
      "사용성 검증과 피드백 반영",
      "디자인 시스템과 핸드오프",
    ],
    lessons: [
      ["프로젝트 목표와 디자인 범위", "인터뷰·리서치 자료 정리", "핵심 사용자와 문제 정의"],
      ["콘텐츠 우선순위 정하기", "사용자 여정과 화면 흐름", "와이어프레임 빠르게 만들기"],
      ["타이포그래피와 색상 기준", "재사용 가능한 컴포넌트", "반응형 레이아웃의 원칙"],
      ["대표 화면 시안 완성", "상태별 화면과 인터랙션", "프로토타입으로 흐름 연결"],
      ["사용성 테스트 질문 만들기", "관찰 결과에서 개선점 찾기", "근거를 갖고 시안 다듬기"],
      ["컴포넌트와 스타일 규칙 문서화", "개발 전달을 위한 명세", "포트폴리오 스토리 정리"],
    ],
    requirements: ["디자인 경험이 없어도 시작할 수 있습니다.", "실습을 위해 안내된 디자인 도구를 준비해 주세요."],
    project: "사용자 문제를 해결하는 화면과 설명 가능한 디자인 포트폴리오를 만듭니다.",
  },
  "데이터 사이언스": {
    outcomes: [
      "분석 질문에 맞는 데이터를 수집하고 품질을 점검합니다.",
      "재현 가능한 분석 절차와 적절한 지표를 선택합니다.",
      "결과를 이해하기 쉬운 시각화와 인사이트로 전달합니다.",
    ],
    chapterTitles: [
      "분석 질문과 데이터 준비",
      "데이터 정제와 탐색",
      "분석 방법과 지표 선택",
      "실험·모델·검증 흐름",
      "시각화와 인사이트 도출",
      "결과 공유와 다음 액션",
    ],
    lessons: [
      ["좋은 분석 질문 만들기", "데이터 출처와 스키마 살펴보기", "분석 환경과 재현성 준비"],
      ["결측치·중복·이상값 다루기", "분포와 관계 탐색하기", "분석 가정을 기록하기"],
      ["문제에 맞는 지표 고르기", "기초 통계로 패턴 확인하기", "분석 결과의 한계 이해하기"],
      ["가설과 검증 기준 세우기", "학습·검증 데이터 분리", "결과를 과신하지 않는 평가"],
      ["메시지에 맞는 차트 선택", "핵심 결과를 시각적으로 전달", "재사용 가능한 리포트 구성"],
      ["의사결정자를 위한 요약", "결과에서 실행 항목 도출", "분석 후속 질문 설계"],
    ],
    requirements: ["기초적인 스프레드시트 사용 경험이 도움이 됩니다.", "코드 실습이 포함된 경우 강의 안내에 따라 환경을 준비해 주세요."],
    project: "실제 업무 질문을 데이터로 검증하고 실행 가능한 리포트로 정리합니다.",
  },
  "업무 생산성": {
    outcomes: [
      "반복 업무의 흐름과 낭비 지점을 찾아 개선 목표를 세웁니다.",
      "문서·협업 도구를 팀이 함께 쓰기 쉬운 방식으로 구성합니다.",
      "작은 자동화와 측정 가능한 업무 개선안을 완성합니다.",
    ],
    chapterTitles: [
      "현재 업무 흐름 살펴보기",
      "정보와 작업을 구조화하기",
      "협업 규칙과 공유 방식",
      "반복 업무 자동화하기",
      "팀 적용과 예외 상황 점검",
      "성과 측정과 지속적인 개선",
    ],
    lessons: [
      ["반복 업무 목록 만들기", "불편과 낭비 구간 찾기", "개선 목표를 작게 정하기"],
      ["문서와 데이터를 한곳에 정리", "찾기 쉬운 이름과 구조", "템플릿으로 시작 비용 줄이기"],
      ["역할과 책임을 명확히 하기", "비동기 협업을 위한 기록", "팀에 맞는 알림 기준"],
      ["자동화할 작업 고르기", "입력·처리·결과 흐름 설계", "오류 알림과 수동 복구 준비"],
      ["팀원이 따라 할 가이드 작성", "권한과 데이터 공유 확인", "예외 케이스와 운영 점검"],
      ["시간 절감과 품질 지표 정하기", "사용자 피드백 수집하기", "다음 개선 실험 계획"],
    ],
    requirements: ["현재 사용하는 업무 도구와 실제 반복 업무가 있으면 좋습니다.", "실습 예제는 도구 경험이 없어도 따라갈 수 있습니다."],
    project: "반복 업무 하나를 문서화하고 팀에서 재사용 가능한 개선 흐름으로 만듭니다.",
  },
  "AI 기술": {
    outcomes: [
      "문제에 맞는 AI 접근법과 적절한 품질 기준을 선택합니다.",
      "프롬프트·검색·모델 호출을 서비스 흐름에 안전하게 연결합니다.",
      "평가·비용·지연 시간을 고려한 개선 사이클을 만듭니다.",
    ],
    chapterTitles: [
      "사용자 문제와 AI 적용 범위",
      "모델·프롬프트와 데이터 준비",
      "AI 기능의 서비스 연결",
      "품질 평가와 실패 대응",
      "비용·보안·성능 개선",
      "작동하는 AI 프로젝트 완성",
    ],
    lessons: [
      ["AI로 해결할 문제 구체화", "성공 기준과 실패 기준 정하기", "모델과 도구 선택하기"],
      ["입력 데이터와 맥락 설계", "프롬프트 구조와 출력 형식", "예시 데이터 준비하기"],
      ["모델 호출 흐름 구성", "사용자 경험과 응답 상태", "검색·도구 연동 패턴"],
      ["대표 평가 질문 세트 만들기", "결과 품질을 비교하는 방법", "타임아웃과 대체 경로"],
      ["민감 정보와 권한 확인", "토큰·비용과 응답 시간 관리", "로그와 사용자 피드백 활용"],
      ["핵심 기능 통합하기", "실제 입력으로 시나리오 점검", "다음 개선 우선순위 정하기"],
    ],
    requirements: ["기초 프로그래밍 경험이 있으면 실습에 도움이 됩니다.", "외부 AI API가 필요한 실습은 강의 내 데모 데이터로도 학습할 수 있습니다."],
    project: "사용자 문제를 해결하는 AI 기능을 만들고 평가 기준과 한계를 함께 문서화합니다.",
  },
  커리어: {
    outcomes: [
      "경험과 목표를 구체적인 사례와 근거로 정리합니다.",
      "채용 담당자와 동료가 이해하기 쉬운 포트폴리오를 구성합니다.",
      "면접과 협업 상황에서 생각의 과정을 명확히 전달합니다.",
    ],
    chapterTitles: [
      "목표와 현재 경험 정리",
      "강점이 드러나는 사례 찾기",
      "이력서와 포트폴리오 구성",
      "기술·직무 면접 준비",
      "피드백과 개선 반복",
      "지원 계획과 성장 루틴",
    ],
    lessons: [
      ["원하는 역할과 환경 정하기", "경험을 사실과 결과로 기록", "현재 역량과 보완점 진단"],
      ["대표 프로젝트 고르기", "문제·선택·결과로 이야기 만들기", "기여 범위와 수치 표현"],
      ["읽히는 이력서 구조", "프로젝트 설명의 핵심", "포트폴리오 흐름과 시각 정리"],
      ["질문 의도 파악하기", "생각을 단계적으로 설명하기", "실전 답변과 역질문 연습"],
      ["구체적인 피드백 요청", "수정 우선순위 정하기", "다른 사람의 시선으로 검토"],
      ["지원 기록과 회고 방법", "작은 학습 목표 설정", "지속 가능한 성장 계획"],
    ],
    requirements: ["현재 이력서나 프로젝트 경험이 있으면 실습에 활용할 수 있습니다.", "경험이 적어도 목표와 학습 계획부터 시작할 수 있습니다."],
    project: "나만의 경험을 설득력 있는 포트폴리오와 구체적인 다음 행동으로 정리합니다.",
  },
};

export function getCourseLearningPlan(course: Course): CourseLearningPlan {
  const curatedVideo = course.curatedVideoId
    ? curatedVideos.find((video) => video.id === course.curatedVideoId)
    : undefined;
  if (curatedVideo) {
    const keywordSplit = Math.ceil(curatedVideo.keywords.length / 2);
    const primaryTopics = curatedVideo.keywords.slice(0, keywordSplit);
    const appliedTopics = curatedVideo.keywords.slice(keywordSplit);
    const topicLessons = (topics: string[]) =>
      topics.map((topic) => `${topic} 핵심 내용과 사례`);

    return {
      outcomes: [
        curatedVideo.summary,
        ...curatedVideo.keywords.slice(0, 3).map((keyword) => `${keyword} 주제를 이해하고 설명합니다.`),
      ],
      requirements: [
        `${curatedVideo.category} 분야에 관심이 있는 학습자`,
        "영상의 원본 출처와 학습 목차를 함께 확인해 주세요.",
      ],
      project: `${curatedVideo.subcategories.join(" · ")} 주제에서 영상의 핵심 내용을 정리하고 실제 학습이나 작업에 적용합니다.`,
      chapters: [
        {
          title: `${curatedVideo.subcategories[0] ?? curatedVideo.category} 주제와 목표`,
          lessons: [curatedVideo.title, "영상의 목표와 배경 파악하기"],
        },
        {
          title: `${primaryTopics.join(" · ")} 핵심 개념`,
          lessons: topicLessons(primaryTopics),
        },
        {
          title: `${curatedVideo.subcategories.join(" · ")} 실무 적용`,
          lessons: [
            ...topicLessons(appliedTopics),
            ...curatedVideo.subcategories.map((subcategory) => `${subcategory} 분야에 연결하기`),
          ],
        },
      ],
    };
  }

  const plan = learningPlans[course.category];
  return {
    outcomes: plan.outcomes,
    requirements: plan.requirements,
    project: plan.project,
    chapters: plan.chapterTitles.map((title, index) => ({
      title,
      lessons: plan.lessons[index],
    })),
  };
}
