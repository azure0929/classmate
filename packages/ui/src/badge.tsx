import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "live" | "accent";
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
