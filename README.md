# Classmate — 실시간 라이브 클래스 플랫폼

React, Next.js App Router, TypeScript strict, Turborepo, TanStack Query, Socket.IO와 WebRTC를 사용하는 교육 플랫폼 모노레포입니다.

## 빠른 시작

요구 환경: Node.js 20 이상, npm 10 이상

```bash
npm install
npm run dev
```

- 학습자 플랫폼: http://localhost:3000
- 강사/관리자 대시보드: http://localhost:3001
- 실시간 시그널링·채팅 서버: http://localhost:4001

`npm run dev`는 세 앱을 병렬 실행합니다. 앱별 명령은 각 `apps/*/package.json`을 참고하세요. 로컬 포트 설정은 `.env.example`에 있습니다.

## 모노레포 구조

```text
apps/
  admin/             강사 및 관리자 대시보드 (Next.js)
  realtime/          라이브 채팅, 공개 Q&A, 룸 프레즌스, WebRTC 시그널링
  web/               학습자 웹 앱 (Next.js App Router)
packages/
  realtime-types/    실시간 클라이언트/서버 공유 이벤트 타입
  ui/                Mantine 디자인 시스템, 다국어, 공통 UI와 데모 인증 세션
```

### 학습자 앱 아키텍처 (`apps/web/src`)

```text
app/                         App Router 경로, 레이아웃, Provider
features/
  courses/
    api/                     강의 목 데이터와 데이터 접근 계층
    components/              카탈로그, 상세 페이지, VOD 학습 화면
    data/                    카테고리별 커리큘럼과 학습 목표
    hooks/                   강의 Query와 공개 Q&A 실시간 연결
    types/                   강의와 카테고리 타입
  live-classroom/
    components/              화상 강의실, 채팅 피드와 입력
    hooks/                   미디어, WebRTC 시그널링, 실시간 채팅
```

라우트는 화면 조립을 담당하고, 강의 서버 상태는 feature API와 TanStack Query `useSuspenseQuery`로 관리합니다. 홈 카탈로그는 12개씩 번호 페이지로 탐색하고, 전체 강의 페이지는 검색 제출·카테고리·세부 분야·정렬을 제공합니다. 강의 카탈로그의 과정 정보와 통계는 `features/courses/api/mock-courses.ts`의 포트폴리오용 모의 데이터입니다.

`features/courses/data/curated-videos.ts`의 국내 크리에이터 공개 영상 39개는 무료 강의 항목으로 `/classes` 카탈로그에 포함됩니다. 영상별 상세 페이지는 원본 YouTube 플레이어, 설명, 키워드 기반 목차 및 학습 세션을 제공합니다. 일반 강의에는 `course-video-matches.ts`로 관련 공개 영상을 연결합니다. `/courses/{courseId}/watch`는 연결된 영상을 재생하며, 무료 큐레이션 영상은 비로그인 사용자도 볼 수 있고 실시간 채팅·공개 Q&A는 로그인 후 이용할 수 있습니다. 영상은 원본 크리에이터가 제공하며 Classmate 강의의 전체 VOD나 크리에이터의 공식 강좌를 의미하지 않습니다. 과정 제목·강사 큐레이션 이름·평점/수강 정보는 실제 판매/수강 통계가 아닌 데모 데이터입니다.

공통 UI는 Mantine 8 기반 테마를 사용합니다. `packages/ui/src/localization.tsx`에 한국어·영어·일본어·베트남어 기본 리소스가 있고, 언어 선택값은 브라우저에 저장됩니다. 원격 locize 번역을 사용하려면 `.env.local`에 `NEXT_PUBLIC_LOCIZE_PROJECT_ID`를 설정하고 선택적으로 `NEXT_PUBLIC_LOCIZE_VERSION`을 지정하세요. 두 값이 없으면 로컬 번역만 사용합니다.

홈의 알림 목록은 읽음 상태를 브라우저 로컬 저장소에 기록하고, 모두 읽은 뒤에는 종 아이콘이 회색으로 표시됩니다. 데모 로그인에서 학습자·강사·관리자 화면 권한을 구분하며, 비로그인 강의 재생과 상호작용은 로그인 창으로 유도합니다. 이 데모 인증은 브라우저 상태일 뿐 실제 계정 인증/인가가 아니므로 배포 전 서버 세션과 API 권한 검증으로 교체해야 합니다.

## 인터랙션과 운영 범위

- 강의 검색, 카테고리 필터, 번호 페이지네이션, 상세 커리큘럼
- 개발·디자인·데이터·생산성·AI·커리어 분야의 국내 크리에이터 무료 강의 항목과 출처 링크
- 선택한 커리큘럼 섹션에 연결된 YouTube 영상 임베드 및 원본 출처
- 로그인 후 Socket.IO 실시간 채팅, 본인 메시지 수정·삭제, 접속자 수 동기화
- 로그인 후 강의별 공개 Q&A 실시간 공유, 본인 질문 수정·삭제
- 라이브 클래스 입장, 카메라·마이크 권한, 화면 공유, 브라우저 간 WebRTC 미디어 연결
- 강사/관리자 데모 역할 전용 클래스·크리에이터·일정·라이브 스튜디오 관리 화면

`apps/realtime`의 채팅과 공개 Q&A 기록은 프로세스 메모리에 최근 100개까지 보관하며 서버 재시작 시 초기화됩니다. Q&A와 채팅의 작성자 소유권은 데모에서 Socket.IO 연결 ID로 확인하며, 재접속 후에는 이전 글을 수정할 수 없습니다. 역할 선택은 브라우저에서 이뤄지므로 서버 측 인증·인가를 대신하지 않습니다. 전체 권한 범위와 운영 전환 시 남은 이슈는 [접근 권한 및 학습 기능 범위](./docs/access-control-and-learning-scope.md)를 참고하세요.

WebRTC는 브라우저 간 P2P mesh 데모이며, 시그널링 서버는 미디어를 전달하지 않습니다. 실제 다자간 강의 운영에는 SFU, TURN, 인증·인가, 영속 메시지 저장소, rate limiting과 HTTPS/WSS 구성이 필요합니다. 카메라와 마이크는 localhost 또는 HTTPS 환경에서 사용할 수 있습니다.

## 검증

```bash
npm run typecheck
npm run build
```
