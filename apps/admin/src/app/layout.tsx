import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classmate Studio — 관리자",
  description: "클래스와 크리에이터를 관리하는 Classmate Studio",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
