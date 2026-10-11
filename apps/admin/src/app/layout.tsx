import type { Metadata } from "next";
import "@mantine/core/styles.css";
import { DesignSystemProvider } from "@classmate/ui/design-system";
import { LocalizationProvider } from "@classmate/ui/localization";
import { DemoSessionProvider } from "@classmate/ui/use-demo-session";
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
      <body>
        <DesignSystemProvider>
          <DemoSessionProvider>
            <LocalizationProvider>{children}</LocalizationProvider>
          </DemoSessionProvider>
        </DesignSystemProvider>
      </body>
    </html>
  );
}
