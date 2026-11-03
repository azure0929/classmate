create table if not exists public.workspace_classes (
  id text primary key,
  title text not null,
  teacher text not null,
  category text not null,
  students integer not null default 0 check (students >= 0),
  status text not null check (status in ('진행 중', '모집 중', '마감 임박', '임시 저장')),
  date_label text not null,
  scheduled_on date,
  color text not null check (color in ('mint', 'peach', 'yellow', 'blue')),
  sort_order integer not null unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_creators (
  name text primary key,
  role text not null,
  category text not null,
  class_count integer not null default 0 check (class_count >= 0),
  students integer not null default 0 check (students >= 0),
  status text not null,
  sort_order integer not null unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_notifications (
  id text primary key,
  title text not null,
  description text not null,
  time_label text not null,
  href text not null,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_dashboard_metrics (
  id smallint primary key check (id = 1),
  monthly_revenue bigint not null check (monthly_revenue >= 0),
  monthly_revenue_growth numeric(5, 2) not null,
  total_students integer not null check (total_students >= 0),
  student_growth numeric(5, 2) not null,
  new_classes_this_month integer not null check (new_classes_this_month >= 0),
  live_participants integer not null check (live_participants >= 0),
  live_capacity integer not null check (live_capacity > 0),
  live_chat_messages integer not null check (live_chat_messages >= 0),
  connection_quality text not null,
  revenue_trend numeric[] not null check (cardinality(revenue_trend) = 12),
  student_trend numeric[] not null check (cardinality(student_trend) = 12),
  class_trend numeric[] not null check (cardinality(class_trend) = 12),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_settings (
  id smallint primary key check (id = 1),
  workspace_name text not null,
  admin_email text not null,
  notifications_enabled boolean not null default true,
  weekly_report_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order integer not null unique
);

alter table public.workspace_classes enable row level security;
alter table public.workspace_creators enable row level security;
alter table public.platform_notifications enable row level security;
alter table public.workspace_dashboard_metrics enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.workspace_faqs enable row level security;

drop policy if exists "Public can read workspace classes" on public.workspace_classes;
create policy "Public can read workspace classes"
  on public.workspace_classes for select to anon, authenticated using (true);
drop policy if exists "Public can read workspace creators" on public.workspace_creators;
create policy "Public can read workspace creators"
  on public.workspace_creators for select to anon, authenticated using (true);
drop policy if exists "Public can read platform notifications" on public.platform_notifications;
create policy "Public can read platform notifications"
  on public.platform_notifications for select to anon, authenticated using (true);
drop policy if exists "Public can read workspace metrics" on public.workspace_dashboard_metrics;
create policy "Public can read workspace metrics"
  on public.workspace_dashboard_metrics for select to anon, authenticated using (true);
drop policy if exists "Public can read workspace settings" on public.workspace_settings;
create policy "Public can read workspace settings"
  on public.workspace_settings for select to anon, authenticated using (true);
drop policy if exists "Public can read workspace FAQs" on public.workspace_faqs;
create policy "Public can read workspace FAQs"
  on public.workspace_faqs for select to anon, authenticated using (true);

grant select on public.workspace_classes, public.workspace_creators,
  public.platform_notifications, public.workspace_dashboard_metrics,
  public.workspace_settings, public.workspace_faqs to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.workspace_classes, public.workspace_creators,
  public.platform_notifications, public.workspace_dashboard_metrics,
  public.workspace_settings, public.workspace_faqs from anon, authenticated;

insert into public.workspace_classes
  (id, title, teacher, category, students, status, date_label, scheduled_on, color, sort_order)
values
  ('drawing', '아이패드 드로잉, 좋아하는 장면을 그려요', '김하나', '드로잉', 124, '진행 중', '오늘 오후 8:00', '2026-11-03', 'mint', 1),
  ('photo', '스마트폰으로 담는 나만의 시선', '이도현', '사진', 86, '모집 중', '11월 14일 오후 7:30', '2026-11-14', 'peach', 2),
  ('ceramic', '하루 한 잔, 작은 도자기 작업실', '박서연', '공예', 62, '모집 중', '11월 16일 오후 6:00', '2026-11-16', 'yellow', 3),
  ('coffee', '집에서도 카페처럼 핸드드립', '최윤', '라이프', 98, '마감 임박', '11월 18일 오후 2:00', '2026-11-18', 'blue', 4),
  ('watercolor', '수채화로 기록하는 나의 계절', '김하나', '드로잉', 0, '임시 저장', '일정 미정', null, 'mint', 5),
  ('film', '필름 사진의 색감을 디지털로', '이도현', '사진', 41, '진행 중', '11월 20일 오후 7:00', '2026-11-20', 'peach', 6)
on conflict (id) do update set
  title = excluded.title,
  teacher = excluded.teacher,
  category = excluded.category,
  students = excluded.students,
  status = excluded.status,
  date_label = excluded.date_label,
  scheduled_on = excluded.scheduled_on,
  color = excluded.color,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.workspace_creators
  (name, role, category, class_count, students, status, sort_order)
values
  ('김하나', '일러스트레이터', '드로잉', 3, 1240, '활동 중', 1),
  ('이도현', '포토그래퍼', '사진', 2, 836, '활동 중', 2),
  ('박서연', '도예가', '공예', 2, 514, '활동 중', 3),
  ('최윤', '바리스타', '라이프', 1, 698, '활동 중', 4)
on conflict (name) do update set
  role = excluded.role,
  category = excluded.category,
  class_count = excluded.class_count,
  students = excluded.students,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.platform_notifications (id, title, description, time_label, href, sort_order)
values
  ('live-class-tonight', '오늘의 라이브 클래스', '드로잉 클럽 라이브가 오늘 오후 8시에 시작해요.', '오늘', '#live', 1),
  ('new-course-recommendation', '새로운 강의를 만나보세요', '관심 분야의 실무 강의가 새로 등록되었어요.', '어제', '/classes', 2),
  ('learning-tip', '이번 주 학습 팁', '배운 내용을 작은 프로젝트로 직접 완성해 보세요.', '10월 8일', '/classes', 3)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  time_label = excluded.time_label,
  href = excluded.href,
  sort_order = excluded.sort_order;

insert into public.workspace_dashboard_metrics
  (id, monthly_revenue, monthly_revenue_growth, total_students, student_growth,
   new_classes_this_month, live_participants, live_capacity, live_chat_messages, connection_quality,
   revenue_trend, student_trend, class_trend)
values (
  1, 8420000, 12.8, 2847, 8.2, 3, 24, 100, 86, '양호',
  array[34, 41, 38, 51, 47, 60, 53, 68, 61, 79, 73, 91]::numeric[],
  array[39, 45, 43, 55, 50, 64, 59, 73, 68, 81, 77, 94]::numeric[],
  array[31, 39, 36, 48, 44, 58, 52, 67, 63, 76, 72, 88]::numeric[]
)
on conflict (id) do update set
  monthly_revenue = excluded.monthly_revenue,
  monthly_revenue_growth = excluded.monthly_revenue_growth,
  total_students = excluded.total_students,
  student_growth = excluded.student_growth,
  new_classes_this_month = excluded.new_classes_this_month,
  live_participants = excluded.live_participants,
  live_capacity = excluded.live_capacity,
  live_chat_messages = excluded.live_chat_messages,
  connection_quality = excluded.connection_quality,
  revenue_trend = excluded.revenue_trend,
  student_trend = excluded.student_trend,
  class_trend = excluded.class_trend,
  updated_at = now();

insert into public.workspace_settings
  (id, workspace_name, admin_email, notifications_enabled, weekly_report_enabled)
values (1, 'Classmate Studio', 'jimin@classmate.kr', true, false)
on conflict (id) do update set
  workspace_name = excluded.workspace_name,
  admin_email = excluded.admin_email,
  notifications_enabled = excluded.notifications_enabled,
  weekly_report_enabled = excluded.weekly_report_enabled,
  updated_at = now();

insert into public.workspace_faqs (id, question, answer, sort_order)
values
  ('create-class', '클래스는 어떻게 만들 수 있나요?', '클래스 관리 탭의 ‘새 클래스’ 버튼을 눌러 제목, 크리에이터, 카테고리와 모집 상태를 입력하면 됩니다.', 1),
  ('start-live', '라이브 수업은 어떻게 시작하나요?', '라이브 스튜디오 탭에서 세션을 시작한 뒤 학습자 플랫폼의 라이브 강의실을 열어 연결 상태를 확인하세요.', 2),
  ('edit-class', '수강생과 클래스 정보를 수정할 수 있나요?', '클래스 목록의 옵션 메뉴에서 클래스 정보를 수정하거나 삭제할 수 있습니다. 데모 데이터 변경은 현재 브라우저에만 반영됩니다.', 3),
  ('login-safety', '로그인 정보는 안전하게 저장되나요?', '현재 화면은 백엔드 인증이 연결되지 않은 데모입니다. 비밀번호는 저장하지 않으며, 실제 서비스 인증으로 사용할 수 없습니다.', 4)
on conflict (id) do update set
  question = excluded.question,
  answer = excluded.answer,
  sort_order = excluded.sort_order;