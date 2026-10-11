import type { Metadata } from "next";
import "@mantine/core/styles.css";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classmate — 함께 배우는 실무 강의",
  description:
    "개발, 디자인, 데이터, AI 기술을 실무 프로젝트와 함께 배우고 성장하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
