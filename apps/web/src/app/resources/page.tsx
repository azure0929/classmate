import type { Metadata } from "next";
import { VideoLibrary } from "../../features/courses/components/video-library";

export const metadata: Metadata = {
  title: "무료 공개 영상 | Classmate",
  description:
    "개발, 디자인, 데이터, 업무 생산성, AI, 커리어 분야의 공개 학습 영상을 만나보세요.",
};

export default function ResourcesPage() {
  return <VideoLibrary />;
}
