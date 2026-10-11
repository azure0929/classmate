"use client";

import type { ReactNode } from "react";
import { MantineProvider, createTheme } from "@mantine/core";

const theme = createTheme({
  primaryColor: "forest",
  fontFamily: '"DM Sans", "Noto Sans KR", sans-serif',
  headings: { fontFamily: '"Manrope", "Noto Sans KR", sans-serif' },
  colors: {
    forest: [
      "#eef5f0",
      "#dce9df",
      "#b8d0bf",
      "#91b69d",
      "#709c80",
      "#568969",
      "#427957",
      "#315b48",
      "#284b3a",
      "#1c3529",
    ],
  },
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: { radius: "md" },
    },
    Modal: {
      defaultProps: { centered: true, overlayProps: { backgroundOpacity: 0.56, blur: 4 } },
    },
  },
});

interface DesignSystemProviderProps {
  children: ReactNode;
}

export function DesignSystemProvider({ children }: DesignSystemProviderProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </MantineProvider>
  );
}
