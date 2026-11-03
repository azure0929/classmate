# Classmate

Classmate는 강의 탐색과 라이브 수업을 제공하는 교육 플랫폼 데모입니다. 학습자 웹, 강사·관리자용 워크스페이스, 실시간 채팅·시그널링 서버를 하나의 npm 모노레포에서 개발합니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 언어 및 모노레포 | TypeScript strict, npm workspaces, Turborepo 2 |
| 웹 앱 | Next.js 15 App Router, React 19 |
| 서버 상태 및 스타일 | TanStack Query 5, Mantine 8, 앱별 CSS |
| 인터랙션 및 아이콘 | Framer Motion, Lucide React |
| 데이터 | Supabase JS 2, PostgreSQL, Row Level Security |
| 실시간 통신 | Socket.IO 4, 공유 이벤트 타입, 브라우저 WebRTC |
| 다국어 | i18next, react-i18next, 선택적 locize 백엔드 |

## 구현 기능

### 학습자 웹

- 홈에서 강의와 라이브 진입점을 탐색하고, 검색·알림·계정 메뉴를 이용합니다.
- `/classes`에서 강의명·크리에이터 검색, 카테고리·세부 분야 필터, 정렬, 페이지 이동을 제공합니다.
- `/courses/[courseId]`에서 강의 정보, 학습 목표, 커리큘럼, 연결된 공개 영상을 확인합니다.
- `/courses/[courseId]/watch`에서 커리큘럼을 선택해 원본 YouTube 영상을 재생하고 실시간 채팅과 공개 Q&A에 참여합니다.
- 라이브 강의실에서 카메라·마이크를 켜고 끄며 화면 공유 및 참가자 간 미디어 연결을 사용할 수 있습니다.
- `/resources`는 강의 목록(`/classes`)으로 이동합니다.

큐레이션된 공개 영상은 비로그인 상태에서도 시청할 수 있지만, 채팅·Q&A 작성과 라이브 강의실 참여에는 데모 로그인이 필요합니다. 일반 강의 시청 화면은 로그인 후 이용할 수 있습니다.

강의 분류는 개발, 디자인, 데이터 사이언스, 업무 생산성, AI 기술, 커리어 분야로 구성됩니다. 카탈로그와 상세·시청 라우트는 Supabase `public.courses`의 같은 레코드를 사용하며, 커리큘럼과 영상 연결 정보는 로컬 큐레이션 데이터에서 가져옵니다. 초기 DB 데이터 39건은 로컬 공개 영상 39건과 ID 및 주요 메타데이터가 일치합니다. 영상은 원본 플레이어를 임베드하고 출처를 표시합니다. 커리큘럼은 영상 제목·설명·키워드를 토대로 만든 학습 가이드이며, 자막 검수나 실제 타임스탬프를 보증하지 않습니다. 영상 데이터에 없는 평점·인기 정렬은 비활성화됩니다.

### 강사·관리자 워크스페이스

`apps/admin`은 대시보드, 클래스 관리, 크리에이터 목록, 일정 달력, 라이브 스튜디오, 워크스페이스 설정, 도움말 화면을 제공합니다. 클래스·크리에이터·매출/참여 지표·FAQ·기본 설정은 Supabase seed 테이블에서 읽습니다. 클래스 추가·수정·삭제와 설정 변경은 데모 UI 상태이며 실제 DB에 쓰지 않습니다. 역할별 접근도 브라우저 데모 세션으로만 구분합니다.

### 실시간 기능

- Socket.IO 룸에서 채팅 메시지와 접속자 수를 동기화하고, 본인 메시지의 수정·삭제를 반영합니다.
- 강의별 공개 Q&A를 브로드캐스트하며, 본인 질문의 수정·삭제를 지원합니다.
- Socket.IO 서버는 WebRTC offer/answer와 ICE 후보를 전달하는 시그널링 역할을 합니다. 오디오·비디오 미디어는 브라우저 간 P2P mesh로 전송됩니다.
- 서버는 실시간 이벤트의 필드 형식과 길이를 검증해 비정상 payload를 무시합니다.
- 클라이언트와 서버는 `packages/realtime-types`의 이벤트·데이터 타입을 공유합니다.

## 저장소 구조

```text
apps/
  web/                 학습자용 Next.js 앱
  admin/               강사·관리자 데모 워크스페이스
  realtime/            Socket.IO 채팅, Q&A, 프레즌스, WebRTC 시그널링
packages/
  ui/                  Mantine 테마, 공통 UI, 데모 세션, 다국어
  realtime-types/      실시간 클라이언트·서버 공유 타입
supabase/
  migrations/          공개 강의 테이블과 초기 영상 데이터
docs/                  권한 범위와 데모·운영 경계 문서
```

웹 앱의 기능 코드는 `apps/web/src/features` 아래 강의와 라이브 강의실 단위로 구성됩니다. App Router 페이지는 화면 진입점을 제공하고, 강의 데이터는 feature API와 TanStack Query로 가져옵니다.

## 실행 방법

요구 환경: Node.js 20 이상, npm 10 이상

```bash
npm install
npm run dev
```

| 앱 | 주소 |
| --- | --- |
| 학습자 웹 | http://localhost:3000 |
| 강사·관리자 앱 | http://localhost:3001 |
| 실시간 서버 | http://localhost:4001 |

`npm run dev`는 Turborepo를 통해 앱을 병렬 실행합니다. 각 앱의 개별 스크립트는 해당 `package.json`에서 확인할 수 있습니다.

### 환경 설정

1. Supabase 프로젝트의 SQL Editor에서 [강의 카탈로그 마이그레이션](./supabase/migrations/20261011180000_create_seed_public_courses.sql)을 실행합니다.
2. 이어서 [워크스페이스·알림·지표 seed 마이그레이션](./supabase/migrations/20261103090000_add_workspace_demo_content.sql)을 실행합니다. 이 파일은 관리자 클래스·크리에이터·FAQ·설정·지표와 홈 알림 데이터를 추가합니다.
3. `apps/web/.env.local`과 `apps/admin/.env.local`에 같은 프로젝트 설정을 입력합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_REALTIME_URL=http://localhost:4001
```

선택적으로 `NEXT_PUBLIC_LOCIZE_PROJECT_ID`와 `NEXT_PUBLIC_LOCIZE_VERSION`을 설정해 원격 번역을 사용할 수 있습니다. 설정하지 않으면 패키지에 포함된 한국어·영어·일본어·베트남어 번역을 사용합니다. 변수 예시는 [.env.example](./.env.example)을 참고하세요. 모든 seed 테이블은 RLS를 활성화하고 공개 읽기만 허용하며 브라우저 쓰기는 차단합니다. 관리자 데모의 변경 내용은 현재 페이지 상태에만 반영되고 실제 DB 변경은 하지 않습니다. 마이그레이션을 적용하지 않았거나 DB 연결에 실패하면 샘플 데이터를 대신 표시하지 않고 오류 상태를 안내합니다.

## 검증 명령

```bash
npm run typecheck
npm run lint
npm run build
```

## 데모 범위와 주의사항

- 로그인과 학습자·강사·관리자 역할은 브라우저 기반 데모 세션입니다. 실제 인증이나 서버 측 권한 검증이 아니므로 배포 전 신뢰 가능한 세션 및 API 인가로 교체해야 합니다.
- 채팅과 Q&A는 실시간 서버 메모리에 룸별 최근 100건까지 보관하며 서버가 재시작되면 사라집니다. 작성자 소유권은 Socket.IO 연결 ID에 연결되어 재접속 후 이전 글을 수정할 수 없습니다.
- WebRTC는 P2P mesh 데모입니다. 운영 환경에서는 동시 접속 규모에 맞는 SFU/TURN, HTTPS/WSS, 인증·인가, 영속 저장소와 요청 제한이 필요합니다.
- 공개 YouTube 영상은 Classmate 자체 VOD나 판매 강좌가 아닙니다. 결제·장바구니, 진도 저장, 실제 수강생 관리 기능은 구현 범위에 포함되지 않습니다.
- 권한별 기능과 운영 전환 시 고려할 사항은 [접근 권한 및 학습 기능 범위](./docs/access-control-and-learning-scope.md)에 정리되어 있습니다.
