"use client";

import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthDialog } from "@classmate/ui/auth-dialog";
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
  const { user, ready, login } = useDemoSession();
  const [showAuth, setShowAuth] = useState(false);

  const openCourse = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (!ready) return;
    if (!user) {
      window.alert("로그인을 해주세요.");
      setShowAuth(true);
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
      {showAuth && (
        <AuthDialog
          initialMode="login"
          onAuthenticated={(nextUser) => {
            login(nextUser);
            setShowAuth(false);
            router.push(href);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
