"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { DemoSessionProvider } from "@classmate/ui/use-demo-session";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <DemoSessionProvider defaultUser={{ name: "지민", email: "jimin@classmate.kr", role: "learner" }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </DemoSessionProvider>
  );
}
