create table if not exists public.courses (
  id text primary key,
  video_id text not null unique,
  sort_order integer not null unique,
  category text not null check (
    category in ('개발', '디자인', '데이터 사이언스', '업무 생산성', 'AI 기술', '커리어')
  ),
  subcategory text not null,
  title text not null,
  creator text not null,
  youtube_video_id text not null unique,
  channel_url text not null,
  summary text not null,
  subcategories text[] not null default '{}',
  keywords text[] not null default '{}',
  price integer not null default 0 check (price = 0),
  thumbnail_url text generated always as (
    'https://i.ytimg.com/vi/' || youtube_video_id || '/hqdefault.jpg'
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

drop policy if exists "Public can read curated courses" on public.courses;
create policy "Public can read curated courses"
  on public.courses
  for select
  to anon, authenticated
  using (true);

grant select on public.courses to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
  on public.courses from anon, authenticated;
insert into public.courses (id, video_id, sort_order, category, subcategory, title, creator, youtube_video_id, channel_url, summary, subcategories, keywords, price)
values
  ('video-life-coding-react-intro', 'life-coding-react-intro', 1, '개발', '프론트엔드', 'React 2022년 개정판 - 1. 수업소개', '생활코딩', 'AoMv0SIjZL8', 'https://www.youtube.com/@coohde', '생활코딩의 React 수업으로 컴포넌트 기반 화면 개발을 시작합니다.', ARRAY['프론트엔드', '풀스택']::text[], ARRAY['React', '컴포넌트', '화면', '프론트엔드']::text[], 0),
  ('video-dream-coding-react-update', 'dream-coding-react-update', 2, '개발', '프론트엔드', '최신 리액트로 무료 업데이트❓', '드림코딩', 'Vc1RAg12b1k', 'https://www.youtube.com/@dream-coding', 'React 버전 변화와 학습 흐름을 살펴보고 현재 프로젝트에 적용할 내용을 정리합니다.', ARRAY['프론트엔드', '풀스택']::text[], ARRAY['React', '최신', '컴포넌트', '프론트엔드']::text[], 0),
  ('video-coding-apple-nextjs', 'coding-apple-nextjs', 3, '개발', '프론트엔드', 'Next.js 13 강의 달린다 (1강~6강)', '코딩애플', 'PCkiz2GUFg8', 'https://www.youtube.com/@codingapple', 'Next.js의 라우팅과 화면 구성 흐름을 실제 강의 영상으로 확인합니다.', ARRAY['프론트엔드', '풀스택', '웹 퍼블리싱']::text[], ARRAY['Next.js', 'React', '라우팅', 'App Router']::text[], 0),
  ('video-nomad-coders-react-native', 'nomad-coders-react-native', 4, '개발', '모바일 앱', '리액트 네이티브로 날씨앱 만들기 #7 Basic React Native Concepts', '노마드코더', 'C47byD8CzAw', 'https://www.youtube.com/@nomadcoders', 'React Native 앱의 화면과 기본 컴포넌트를 만들어 보는 모바일 실습입니다.', ARRAY['모바일 앱']::text[], ARRAY['React Native', '모바일', '앱', '컴포넌트']::text[], 0),
  ('video-woowatech-react-keys', 'woowatech-react-keys', 5, '개발', '프론트엔드', '[10분 테코톡] 두부의 React key props', '우아한테크', 'KI2oWPz6FEQ', 'https://www.youtube.com/@woowatech', 'React 목록 렌더링에서 key가 필요한 이유를 개발자 발표로 이해합니다.', ARRAY['프론트엔드', '자료구조']::text[], ARRAY['React', 'key', '렌더링', '컴포넌트']::text[], 0),
  ('video-zerocho-nextjs-opinion', 'zerocho-nextjs-opinion', 6, '개발', '프론트엔드', 'Next.js 과연 필수일까요?? 일단 저는 안 쓰고 있습니다', 'ZeroCho', 'XfuYV2JxVWk', 'https://www.youtube.com/@zerochotv', '프레임워크 선택의 장단점을 비교하며 프로젝트 요구사항에 맞는 기준을 생각합니다.', ARRAY['프론트엔드', '풀스택', '개발 도구']::text[], ARRAY['Next.js', 'React', '프레임워크', '기술 선택']::text[], 0),
  ('video-jimcoding-react-components', 'jimcoding-react-components', 7, '개발', '프론트엔드', '리액트와 컴포넌트: 입문자를 위한 초간단 설명', '짐코딩', '_8z6E17S0ok', 'https://www.youtube.com/@gymcoding', '컴포넌트와 React의 기본 구조를 예제로 익힙니다.', ARRAY['프론트엔드', '풀스택']::text[], ARRAY['React', '컴포넌트', '입문', '상태']::text[], 0),
  ('video-kim-younghan-spring-intro', 'kim-younghan-spring-intro', 8, '개발', '백엔드', '02. 스프링이란', '김영한', 'q_QEh3fz0zw', 'https://www.youtube.com/@yhdev', 'Spring의 핵심 역할을 이해하고 서버 애플리케이션 구조를 살펴봅니다.', ARRAY['백엔드', '풀스택']::text[], ARRAY['Spring', '백엔드', '서버', 'API']::text[], 0),
  ('video-baek-ki-sun-spring-check', 'baek-ki-sun-spring-check', 9, '개발', '백엔드', '스프링 제대로 공부했는지 5분안에 확인하는 방법', '백기선', 'bJfbPWEMj_c', 'https://www.youtube.com/@keesun.b', 'Spring 학습 중 자주 놓치는 개념을 빠르게 점검합니다.', ARRAY['백엔드']::text[], ARRAY['Spring', '백엔드', '서버', '학습']::text[], 0),
  ('video-dongbinna-greedy-implementation', 'dongbinna-greedy-implementation', 10, '개발', '알고리즘', '(이코테 2021 강의 몰아보기) 2. 그리디 & 구현', '동빈나', '2zjoKjt97vQ', 'https://www.youtube.com/@dongbinna', '그리디와 구현 유형을 문제 풀이 과정으로 학습합니다.', ARRAY['알고리즘', '자료구조']::text[], ARRAY['알고리즘', '그리디', '코딩 테스트', '자료구조']::text[], 0),
  ('video-nullnul-network-finale', 'nullnul-network-finale', 11, '개발', '백엔드', '암기에서 이해로 가는 네트워크 강의 완결편', '널널한 개발자', '9sZamfIvVww', 'https://www.youtube.com/@nullnull_not_eq_null', '네트워크 동작 원리를 이해 중심으로 정리합니다.', ARRAY['백엔드', '개발 도구']::text[], ARRAY['네트워크', 'HTTP', '서버', '백엔드']::text[], 0),
  ('video-programmers-service-growth', 'programmers-service-growth', 12, '개발', '풀스택', '[프로그래머스 컨퍼런스 1st] 모두의 성장을 위한 서비스 만들기: solved.ac 개발 경험을 토대로(박수현/solved.ac)', '프로그래머스', 'ggD9ry05axw', 'https://www.youtube.com/@programmerschannel', '실제 서비스 개발 경험을 통해 제품과 기술 의사결정을 살펴봅니다.', ARRAY['풀스택', '개발 도구', 'Git·GitHub']::text[], ARRAY['서비스', '개발', '협업', '제품']::text[], 0),
  ('video-designbase-ux-basics', 'designbase-ux-basics', 13, '디자인', 'UI·UX', '답 없는 UX 디자인 이해하기 - UXUI 디자인 강좌', '디자인베이스', 'Y9ZUm4ygRlY', 'https://www.youtube.com/@designbase', 'UX 디자인의 핵심 원칙을 화면의 사용자 경험과 연결해 이해합니다.', ARRAY['UI·UX', '웹 디자인', '프로덕트 디자인']::text[], ARRAY['UX', 'UI', '사용자', '디자인']::text[], 0),
  ('video-designbase-figma-basics', 'designbase-figma-basics', 14, '디자인', 'Figma', '2026 피그마 완전 최신! 입문자는 이걸로 시작하세요 - 피그마 강좌 1-1', '디자인베이스', '1Sqzinh-Loc', 'https://www.youtube.com/@designbase', 'Figma 인터페이스와 실습의 출발점을 최신 입문 영상으로 익힙니다.', ARRAY['Figma', '웹 디자인', 'UI·UX']::text[], ARRAY['Figma', '피그마', '컴포넌트', '디자인 시스템']::text[], 0),
  ('video-johnkoba-design-principles', 'johnkoba-design-principles', 15, '디자인', '그래픽 디자인', '알아두면 무조건 이득인 디자인 상식 7가지 // 존코바', '존코바', '3VM27n59CbY', 'https://www.youtube.com/@JohnKOBADesign', '시각 디자인의 기본 원칙을 다양한 작업 사례로 확인합니다.', ARRAY['그래픽 디자인', '웹 디자인']::text[], ARRAY['그래픽', '시각', '색상', '타이포그래피']::text[], 0),
  ('video-designer-oingt-portfolio', 'designer-oingt-portfolio', 16, '디자인', '프로덕트 디자인', '디자이너 포트폴리오 구성', '디자이너 우앙', 'qaIoVeHIAGY', 'https://www.youtube.com/@oingt.design', '디자인 작업을 문제와 해결 과정 중심으로 포트폴리오에 구성합니다.', ARRAY['프로덕트 디자인', 'UI·UX', '웹 디자인']::text[], ARRAY['포트폴리오', '디자인', '프로젝트', '핸드오프']::text[], 0),
  ('video-todaycode-pandas-visualization', 'todaycode-pandas-visualization', 17, '데이터 사이언스', 'Python 데이터 분석', '[19/29] Pandas 기초 - 파이썬 데이터 시각화 히스토그램과 도수분포표 이해하기, 막대그래프 vs 히스토그램 차이점 이해하기', '오늘코드', 'L_UXVLz5Sxw', 'https://www.youtube.com/@todaycode', 'Pandas 데이터 분포를 읽고 적절한 시각화로 표현하는 실습입니다.', ARRAY['Python 데이터 분석', '데이터 시각화', '통계·분석']::text[], ARRAY['Pandas', 'Python', '시각화', '통계', '분포']::text[], 0),
  ('video-todaycode-pandas-timeseries', 'todaycode-pandas-timeseries', 18, '데이터 사이언스', 'Python 데이터 분석', '파이썬 데이터 분석 Pandas tutorial time series', '오늘코드', 'xis6SGqG9mo', 'https://www.youtube.com/@todaycode', '시계열 자료를 불러오고 시간 축에 따른 변화를 분석합니다.', ARRAY['Python 데이터 분석', '통계·분석']::text[], ARRAY['Pandas', 'Python', '시계열', '분석']::text[], 0),
  ('video-breadbrother-streamlit-data', 'breadbrother-streamlit-data', 19, '데이터 사이언스', 'Python 데이터 분석', '5분만에 데이터 사이언스 웹앱 만들기 튜토리얼 Streamlit', '빵형의 개발도상국', 'JLVB8ZUPojw', 'https://www.youtube.com/@bbanghyong', '분석 결과를 Streamlit 웹 앱으로 빠르게 공유하는 흐름을 보여줍니다.', ARRAY['Python 데이터 분석', '데이터 시각화']::text[], ARRAY['Python', 'Streamlit', '데이터', '대시보드']::text[], 0),
  ('video-breadbrother-price-prediction', 'breadbrother-price-prediction', 20, '데이터 사이언스', '머신러닝', '물가를 예측하는 인공지능 - Python', '빵형의 개발도상국', 'C_MOtffSues', 'https://www.youtube.com/@bbanghyong', 'Python으로 예측 문제를 구성하고 데이터에서 패턴을 찾습니다.', ARRAY['머신러닝', 'Python 데이터 분석']::text[], ARRAY['머신러닝', 'Python', '예측', '모델']::text[], 0),
  ('video-data-station-sql-python', 'data-station-sql-python', 21, '데이터 사이언스', 'SQL', '[매일10분 데이터 분석] 파이썬으로 SQL 사용하기 3탄 (마리아 DB 설치) #Python #파이썬', '데이터 스테이션', 'E9F1TNF8mmI', 'https://www.youtube.com/@data_station', 'Python과 관계형 데이터베이스를 연결해 분석 데이터를 다루는 입문입니다.', ARRAY['SQL', 'Python 데이터 분석', '데이터베이스']::text[], ARRAY['SQL', 'Python', 'MariaDB', '데이터베이스']::text[], 0),
  ('video-inflearn-data-analysis-exam', 'inflearn-data-analysis-exam', 22, '데이터 사이언스', 'Python 데이터 분석', '빅데이터 분석기사 실기 무료강의 - 파이썬 개념과 예제', '인프런', 'RxWIF_2uBco', 'https://www.youtube.com/@inflearn_official', '분석 실무에서 자주 쓰는 Python 문법과 데이터 처리 예제를 익힙니다.', ARRAY['Python 데이터 분석', '통계·분석']::text[], ARRAY['Python', '데이터 분석', '실기', '통계']::text[], 0),
  ('video-statistical-essence-distributions', 'statistical-essence-distributions', 23, '데이터 사이언스', '통계·분석', '통계 초보자 필독! Top 7 확률분포 10분 요약', '쉽게 배우는 데이터와 AI | 찹쓰', 'jFv0R5OyT5k', 'https://www.youtube.com/@data_chopsticks', '통계 분석과 머신러닝의 토대가 되는 확률분포를 한눈에 정리합니다.', ARRAY['통계·분석', '머신러닝']::text[], ARRAY['통계', '확률', '분포', '머신러닝']::text[], 0),
  ('video-oppadu-dynamic-range', 'oppadu-dynamic-range', 24, '업무 생산성', '스프레드시트', '엑셀 업무 자동화 필수 스킬 "동적범위" - 함수 하나로 완벽하게 해결하는 방법 | 실무 기초 강의', '오빠두엑셀', '7HCnbGGmcIA', 'https://www.youtube.com/@Oppadu', '엑셀의 동적 범위를 활용해 반복적인 데이터 작업을 줄입니다.', ARRAY['스프레드시트', '업무 자동화']::text[], ARRAY['엑셀', 'Excel', '자동화', '스프레드시트']::text[], 0),
  ('video-oppadu-excel-vba', 'oppadu-excel-vba', 25, '업무 생산성', '스프레드시트', '엑셀 VBA 자동화, 초보자 맞춤 완성 코스', '오빠두엑셀', 'NAJpBaUU_9M', 'https://www.youtube.com/@Oppadu', '반복되는 엑셀 작업을 매크로와 VBA로 자동화하는 기본 흐름을 배웁니다.', ARRAY['스프레드시트', '업무 자동화']::text[], ARRAY['엑셀', 'VBA', '매크로', '자동화']::text[], 0),
  ('video-notion-workspace-intro', 'notion-workspace-intro', 26, '업무 생산성', '문서·Notion', '노션 왕초보 필수 시청 - 프로젝트 관리 템플릿', '매일성장 시그마', 'lbDe5IIqDSc', 'https://www.youtube.com/@%EC%84%B8%EC%BB%A8%EB%93%9C%EB%B8%8C%EB%A0%88%EC%9D%B8%EC%8B%9C%EA%B7%B8%EB%A7%88', 'Notion의 페이지와 데이터베이스로 개인·팀 프로젝트 공간을 구성합니다.', ARRAY['문서·Notion', '협업 도구', '기획·프로젝트 관리']::text[], ARRAY['Notion', '노션', '프로젝트', '위키']::text[], 0),
  ('video-notion-work-management', 'notion-work-management', 27, '업무 생산성', '문서·Notion', '핵심만 남긴 초간단 업무 관리 노션 템플릿', '노션 일잘러 매조꾸', 'krLgPeKoGgw', 'https://www.youtube.com/@%EB%85%B8%EC%85%98_%EC%9D%BC%EC%9E%98%EB%9F%AC_%EB%A7%A4%EC%A1%B0%EA%BE%B8', '실제 업무를 정리하는 Notion 템플릿 구조와 사용 방법을 살펴봅니다.', ARRAY['문서·Notion', '협업 도구', '기획·프로젝트 관리']::text[], ARRAY['Notion', '노션', '업무 관리', '프로젝트']::text[], 0),
  ('video-jang-pm-make-automation', 'jang-pm-make-automation', 28, '업무 생산성', '업무 자동화', '노코드 자동화 툴, Make 소개', '일잘러 장피엠', 'udF-fzGVYuA', 'https://www.youtube.com/@jangpm', '여러 업무 도구를 시나리오로 연결해 반복 업무를 자동화합니다.', ARRAY['업무 자동화', '협업 도구']::text[], ARRAY['Make', '자동화', '워크플로', '노코드']::text[], 0),
  ('video-jocoding-ai-service', 'jocoding-ai-service', 29, 'AI 기술', '생성형 AI', 'AI 서비스 수익 공개 및 Replit 바이브 코딩으로 서비스 만들기', '조코딩', 'yf-KIyXa62U', 'https://www.youtube.com/@jocoding', '생성형 AI 도구를 활용해 아이디어를 실제 서비스 형태로 구현합니다.', ARRAY['생성형 AI', 'AI 서비스 개발', 'LLM·프롬프트']::text[], ARRAY['AI', '서비스', 'Replit', '생성형', '프롬프트']::text[], 0),
  ('video-teddynote-rag-intro', 'teddynote-rag-intro', 30, 'AI 기술', 'RAG·벡터 검색', 'RAG 파이프라인 이해하기 - 뉴스 기사 Q&A 챗봇 제작', '테디노트', '1scMJH93v0M', 'https://www.youtube.com/@teddynote', '뉴스 데이터를 검색해 답변하는 RAG 챗봇의 구성과 구현 흐름을 살펴봅니다.', ARRAY['RAG·벡터 검색', 'AI 서비스 개발']::text[], ARRAY['RAG', 'LangChain', '검색', '챗봇', '벡터']::text[], 0),
  ('video-teddynote-rag-flow', 'teddynote-rag-flow', 31, 'AI 기술', 'RAG·벡터 검색', 'RAG의 동작 과정 쉽게 이해하기', '테디노트', 'zybyszetEcE', 'https://www.youtube.com/@teddynote', '문서 분할, 임베딩, 검색, 생성으로 이어지는 RAG의 핵심 단계를 설명합니다.', ARRAY['RAG·벡터 검색', 'LLM·프롬프트']::text[], ARRAY['RAG', '임베딩', '벡터', '검색', 'LLM']::text[], 0),
  ('video-techmong-ai-glasses', 'techmong-ai-glasses', 32, 'AI 기술', '생성형 AI', 'AI 안경으로 달라지는 스마트폰 경험', '테크몽', 'agfJH5f-41Y', 'https://www.youtube.com/@techmong', 'AI가 일상 기기와 사용자 경험에 적용되는 최신 사례를 살펴봅니다.', ARRAY['생성형 AI', 'AI 서비스 개발']::text[], ARRAY['AI', '기술', '제품', '사용자 경험']::text[], 0),
  ('video-modulabs-multimodal-ai', 'modulabs-multimodal-ai', 33, 'AI 기술', '생성형 AI', '멀티모달 및 생성형 AI 트렌드 - CVPR 연구 소개', '모두의연구소', 'Ew0V1m5RnBQ', 'https://www.youtube.com/@modulabs_', '최근 컴퓨터 비전 연구를 통해 멀티모달 생성형 AI의 적용을 살펴봅니다.', ARRAY['생성형 AI', 'LLM·프롬프트', 'AI 서비스 개발']::text[], ARRAY['멀티모달', '생성형 AI', '모델', '연구']::text[], 0),
  ('video-jang-pm-ai-workflow', 'jang-pm-ai-workflow', 34, 'AI 기술', '생성형 AI', 'AI 활용 개념 잡기 - 업무에 적용하는 세 단계', '일잘러 장피엠', 'wP48xJLWuB0', 'https://www.youtube.com/@jangpm', '업무 문제를 분해해 AI를 적절한 작업 흐름에 적용하는 방법을 설명합니다.', ARRAY['생성형 AI', 'LLM·프롬프트', 'AI 에이전트']::text[], ARRAY['AI', '업무', '에이전트', '워크플로']::text[], 0),
  ('video-eo-silicon-valley-career', 'eo-silicon-valley-career', 35, '커리어', '개발자 커리어', '27년차 실리콘밸리 개발자의 인생 이야기', 'EO', 'nLL409se8sM', 'https://www.youtube.com/@eo_korea', '오랜 개발 경력에서의 선택과 성장 경험을 인터뷰로 들어봅니다.', ARRAY['개발자 커리어', '포트폴리오·이력서']::text[], ARRAY['개발자', '커리어', '성장', '경험']::text[], 0),
  ('video-wanted-app-developer', 'wanted-app-developer', 36, '커리어', '개발자 커리어', '스타트업 앱 개발자가 일하는 방법 - 원티드 앱 개발팀', '원티드', 'QwbyjLCMa_c', 'https://www.youtube.com/@ch.wanted', '제품팀 개발자의 협업 방식과 실제 업무 환경을 알아봅니다.', ARRAY['개발자 커리어', '기술 면접']::text[], ARRAY['개발자', '협업', '커리어', '스타트업']::text[], 0),
  ('video-programmers-developer-resume', 'programmers-developer-resume', 37, '커리어', '포트폴리오·이력서', '경력 개발자 이력서,이렇게 쓰면 합격합니다🌟 | 개발자 이력서 클리닉 2편', '프로그래머스', 'uTR7Bt1Ipqk', 'https://www.youtube.com/@programmerschannel', '프로젝트 성과와 경력을 읽기 쉬운 개발자 이력서로 정리합니다.', ARRAY['포트폴리오·이력서', '개발자 커리어']::text[], ARRAY['개발자', '이력서', '경력', '성과', '포트폴리오']::text[], 0),
  ('video-dreamcoding-technical-interview', 'dreamcoding-technical-interview', 38, '커리어', '기술 면접', '개발자 코딩 기술면접팁', '드림코딩', 'yA4d5ZydVVQ', 'https://www.youtube.com/@dream-coding', '기술 면접에서 개념을 설명하고 경험을 전달하는 방법을 연습합니다.', ARRAY['기술 면접', '개발자 커리어']::text[], ARRAY['기술 면접', '개발자', '코딩', '설명']::text[], 0),
  ('video-interview-king-interview-prep', 'interview-king-interview-prep', 39, '커리어', '기술 면접', '면접 보러 가기 전에 봐야 할 영상', '면접왕 이형', 'gCF28Vxn-ns', 'https://www.youtube.com/@leebro_interview', '면접 전 경험과 지원 동기를 정리하고 답변 구조를 점검합니다.', ARRAY['기술 면접', '포트폴리오·이력서']::text[], ARRAY['면접', '지원', '경험', '이력서']::text[], 0)
on conflict (id) do update set
  video_id = excluded.video_id,
  sort_order = excluded.sort_order,
  category = excluded.category,
  subcategory = excluded.subcategory,
  title = excluded.title,
  creator = excluded.creator,
  youtube_video_id = excluded.youtube_video_id,
  channel_url = excluded.channel_url,
  summary = excluded.summary,
  subcategories = excluded.subcategories,
  keywords = excluded.keywords,
  price = excluded.price;
