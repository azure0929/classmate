"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginRequired } from "@classmate/ui/login-required-provider";
import { useDemoSession } from "@classmate/ui/use-demo-session";

interface CourseAccessLinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export function CourseAccessLink({
  href,
  className,
  ariaLabel,
  children,
}: CourseAccessLinkProps) {
  const router = useRouter();
  const { user, ready } = useDemoSession();
  const requestLogin = useLoginRequired();

  const openCourse = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!ready) return;
    if (!user) {
      requestLogin(() => router.push(href));
      return;
    }
    router.push(href);
  };

  return (
    <>
      <Link
        className={className}
        href={href}
        aria-label={ariaLabel}
        onClick={openCourse}
      >
        {children}
      </Link>
    </>
  );
}
