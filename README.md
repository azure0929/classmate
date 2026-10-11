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
  ui/                공통 UI와 데모 인증 세션
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

라우트는 화면 조립을 담당하고, 강의 서버 상태는 feature API와 TanStack Query `useSuspenseQuery`로 관리합니다. 홈 카탈로그는 12개씩 번호 페이지로 탐색하고, 전체 강의 페이지는 검색 제출·카테고리·세부 분야·정렬을 제공합니다. 강의 데이터는 현재 `features/courses/api/mock-courses.ts`의 모의 데이터입니다.

강의 상세는 `/courses/{courseId}`에서 카테고리별 학습 목표, 섹션별 커리큘럼, 권장 대상과 지식공유자 정보를 보여줍니다. `/courses/{courseId}/watch`에서는 커리큘럼을 선택하며 데모 VOD 플레이어, 실시간 채팅, 같은 강의 학습자에게 공개되는 Q&A를 사용할 수 있습니다. 실제 영상 파일이나 스트리밍 API는 아직 연결되지 않았으며, 플레이어는 데모 UI입니다.

홈의 알림 목록은 읽음 상태를 브라우저 로컬 저장소에 기록하고, 모두 읽은 뒤에는 종 아이콘이 회색으로 표시됩니다. 데모 인증은 학습 흐름과 화면 검증용으로만 제공됩니다. 실제 서비스에 배포하기 전에 서버 측 인증·인가와 영속 API로 교체해야 합니다.

## 인터랙션과 운영 범위

- 강의 검색, 카테고리 필터, 번호 페이지네이션, 상세 커리큘럼
- 데모 VOD의 재생·일시정지·탐색 및 학습 섹션 선택
- Socket.IO 실시간 채팅, 메시지 수정·삭제, 접속자 수 동기화
- 강의별 공개 Q&A의 실시간 공유
- 라이브 클래스 입장, 카메라·마이크 권한, 화면 공유, 브라우저 간 WebRTC 미디어 연결
- 관리자 대시보드의 클래스·크리에이터·일정·라이브 스튜디오 관리 화면

`apps/realtime`의 채팅과 공개 Q&A 기록은 프로세스 메모리에 최근 100개까지 보관하며 서버 재시작 시 초기화됩니다. 사용자 인증과 저장소 기반 권한 검증은 연결되어 있지 않습니다. 데모 계정에서 Socket.IO 연결 ID로 본인 채팅 메시지의 수정·삭제 권한을 확인합니다.

WebRTC는 브라우저 간 P2P mesh 데모이며, 시그널링 서버는 미디어를 전달하지 않습니다. 실제 다자간 강의 운영에는 SFU, TURN, 인증·인가, 영속 메시지 저장소, rate limiting과 HTTPS/WSS 구성이 필요합니다. 카메라와 마이크는 localhost 또는 HTTPS 환경에서 사용할 수 있습니다.

## 검증

```bash
npm run typecheck
npm run build
```
