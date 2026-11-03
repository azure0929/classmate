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

```text
apps/
  admin/             강사 및 관리자 대시보드 (Next.js)
  realtime/          라이브 채팅, 공개 Q&A, 룸 프레즌스, WebRTC 시그널링
  web/               학습자 웹 앱 (Next.js App Router)
packages/
  realtime-types/    실시간 클라이언트/서버 공유 이벤트 타입
  ui/                Mantine 디자인 시스템, 다국어, 공통 UI와 Supabase Auth 세션

선택적으로 `NEXT_PUBLIC_LOCIZE_PROJECT_ID`와 `NEXT_PUBLIC_LOCIZE_VERSION`을 설정해 원격 번역을 사용할 수 있습니다. 설정하지 않으면 패키지에 포함된 한국어·영어·일본어·베트남어 번역을 사용합니다. 변수 예시는 [.env.example](./.env.example)을 참고하세요. 모든 seed 테이블은 RLS를 활성화하고 공개 읽기만 허용하며 브라우저 쓰기는 차단합니다. 관리자 데모의 변경 내용은 현재 페이지 상태에만 반영되고 실제 DB 변경은 하지 않습니다. 마이그레이션을 적용하지 않았거나 DB 연결에 실패하면 샘플 데이터를 대신 표시하지 않고 오류 상태를 안내합니다.

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

라우트는 화면 조립을 담당하고, 강의 서버 상태는 feature API와 TanStack Query `useSuspenseQuery`로 관리합니다. 홈 카탈로그는 12개씩 번호 페이지로 탐색하고, 전체 강의 페이지는 검색 제출·카테고리·세부 분야·정렬을 제공합니다. 강의 목록은 `features/courses/data/curated-videos.ts`에 등록된 공개 YouTube 영상만 사용하며, 별도의 가상 유료 강의 목록은 노출하지 않습니다.

`features/courses/data/curated-videos.ts`의 공개 YouTube 영상 39개가 `/classes`의 강의 목록입니다. 카드는 등록된 영상 제목과 크리에이터, YouTube 썸네일을 보여주며, 영상별 상세 페이지에서 원본 플레이어와 설명·학습 목차를 확인할 수 있습니다. 목차는 등록된 제목·설명·키워드 기반의 학습 가이드이며 실제 자막 검수나 영상 타임스탬프를 보증하지 않습니다. YouTube가 제공하지 않는 평점·수강생 통계 기반 정렬은 비활성화했습니다. `/courses/{courseId}/watch`는 해당 강의에 연결된 원본 영상을 재생하며, 비로그인 사용자도 볼 수 있고 실시간 채팅·공개 Q&A는 로그인 후 이용할 수 있습니다. 영상은 원본 크리에이터가 제공하며 Classmate의 자체 VOD나 크리에이터의 공식 강좌를 의미하지 않습니다.

강의 카탈로그는 Supabase `public.courses` 테이블에서 읽습니다. Supabase Dashboard의 SQL Editor에서 [courses 마이그레이션](./supabase/migrations/20261011180000_create_seed_public_courses.sql)과 [Auth·profiles 보안 마이그레이션](./supabase/migrations/20261103123000_secure_profiles_with_supabase_auth.sql)을 순서대로 적용한 뒤 `apps/web/.env.local`과 `apps/admin/.env.local`에 프로젝트 URL과 publishable key를 설정하세요. 기존 `profiles` 행은 확인된 Supabase Auth 사용자와 이메일 기준으로 한 번 연결됩니다. 환경 변수 예시는 [.env.example](./.env.example)에 있습니다. 강의 테이블은 공개 읽기 전용이고, 프로필은 로그인한 사용자가 자신의 행만 읽을 수 있습니다. DB 오류는 임의 데이터로 대체하지 않습니다.

공통 UI는 Mantine 8 기반 테마를 사용합니다. `packages/ui/src/localization.tsx`에 한국어·영어·일본어·베트남어 기본 리소스가 있고, 언어 선택값은 브라우저에 저장됩니다. 원격 locize 번역을 사용하려면 `.env.local`에 `NEXT_PUBLIC_LOCIZE_PROJECT_ID`를 설정하고 선택적으로 `NEXT_PUBLIC_LOCIZE_VERSION`을 지정하세요. 두 값이 없으면 로컬 번역만 사용합니다.

홈의 알림 읽음 상태는 브라우저 로컬 저장소에 기록됩니다. 로그인·회원가입은 Supabase Auth 이메일/비밀번호 인증을 사용하고, 화면의 이름·역할은 인증된 사용자 UID와 연결된 `public.profiles`에서 읽습니다. 비밀번호를 `profiles`에 저장하지 않으며 클라이언트에서 역할을 선택할 수 없습니다. 기존 프로필에 대응하는 Auth 계정이 없다면 Auth Dashboard에서 계정을 만들고 이메일을 확인한 후 아래 관리자 SQL을 실행해 연결해야 합니다. 신규 가입 역할은 DB trigger에서 `student`로 지정되며, 관리자 역할은 신뢰된 DB 작업으로만 부여합니다.

```sql
update public.profiles as profile
set auth_user_id = auth_user.id
from auth.users as auth_user
where lower(profile.email) = lower(auth_user.email)
  and auth_user.email_confirmed_at is not null
  and profile.auth_user_id is null;
```

## 인터랙션과 운영 범위

- 강의 검색, 카테고리 필터, 번호 페이지네이션, 상세 커리큘럼
- 개발·디자인·데이터·생산성·AI·커리어 분야의 국내 크리에이터 무료 강의 항목과 출처 링크
- 선택한 커리큘럼 섹션에 연결된 YouTube 영상 임베드 및 원본 출처
- 로그인 후 Socket.IO 실시간 채팅, 본인 메시지 수정·삭제, 접속자 수 동기화
- 로그인 후 강의별 공개 Q&A 실시간 공유, 본인 질문 수정·삭제
- 라이브 클래스 입장, 카메라·마이크 권한, 화면 공유, 브라우저 간 WebRTC 미디어 연결
- profiles 역할에 따라 표시되는 강사·관리자 클래스·크리에이터·일정·라이브 스튜디오 화면

`apps/realtime`의 채팅과 공개 Q&A 기록은 프로세스 메모리에 최근 100개까지 보관하며 서버 재시작 시 초기화됩니다. Q&A와 채팅의 작성자 소유권은 Socket.IO 연결 ID로 확인하며, 재접속 후에는 이전 글을 수정할 수 없습니다. 프로필 RLS는 본인 행 읽기만 허용합니다. 전체 권한 범위와 운영 전환 시 남은 이슈는 [접근 권한 및 학습 기능 범위](./docs/access-control-and-learning-scope.md)를 참고하세요.

WebRTC는 브라우저 간 P2P mesh 데모이며, 시그널링 서버는 미디어를 전달하지 않습니다. 실제 다자간 강의 운영에는 SFU, TURN, 인증·인가, 영속 메시지 저장소, rate limiting과 HTTPS/WSS 구성이 필요합니다. 카메라와 마이크는 localhost 또는 HTTPS 환경에서 사용할 수 있습니다.

## 검증
=======

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
