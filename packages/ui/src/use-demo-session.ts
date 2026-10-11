"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "./auth-dialog";

const STORAGE_KEY = "classmate-demo-session";
const DEFAULT_USER: AuthUser = { name: "김지민", email: "jimin@classmate.kr" };
type StoredSession = AuthUser | { signedOut: true };

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  return (
    "name" in value &&
    typeof value.name === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}

export function useDemoSession(defaultUser: AuthUser = DEFAULT_USER) {
  const [user, setUser] = useState<AuthUser | null>(defaultUser);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed: unknown = JSON.parse(stored);
      if (isAuthUser(parsed)) setUser(parsed);
      else if (
        typeof parsed === "object" &&
        parsed !== null &&
        "signedOut" in parsed &&
        parsed.signedOut === true
      ) {
        setUser(null);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Could not read demo session", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    const session: StoredSession = { name: nextUser.name, email: nextUser.email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    const session: StoredSession = { signedOut: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(null);
  }, []);

  return { user, login, logout };
}
