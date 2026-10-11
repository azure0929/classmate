"use client";

"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthRole, AuthUser } from "./auth-dialog";

const STORAGE_KEY = "classmate-demo-session";
const DEFAULT_USER: AuthUser = {
  name: "김지민",
  email: "jimin@classmate.kr",
  role: "learner",
};
type StoredSession = AuthUser | { signedOut: true };

interface DemoSession {
  user: AuthUser | null;
  ready: boolean;
  login: (nextUser: AuthUser) => void;
  logout: () => void;
}

const DemoSessionContext = createContext<DemoSession | null>(null);

function isAuthRole(value: unknown): value is AuthRole {
  return value === "learner" || value === "instructor" || value === "admin";
}

function toAuthUser(value: unknown): AuthUser | null {
  if (typeof value !== "object" || value === null) return null;
  if (
    !("name" in value) ||
    typeof value.name !== "string" ||
    !("email" in value) ||
    typeof value.email !== "string"
  ) {
    return null;
  }
  const role = "role" in value && isAuthRole(value.role) ? value.role : "learner";
  return { name: value.name, email: value.email, role };
}

function useDemoSessionState(defaultUser: AuthUser) {
  const [user, setUser] = useState<AuthUser | null>(defaultUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const storedUser = toAuthUser(parsed);
        if (storedUser) {
          setUser(storedUser);
        } else if (
          typeof parsed === "object" &&
          parsed !== null &&
          "signedOut" in parsed &&
          parsed.signedOut === true
        ) {
          setUser(null);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Could not read demo session", error);
    } finally {
      setReady(true);
    }
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    const session: AuthUser = {
      name: nextUser.name,
      email: nextUser.email,
      role: nextUser.role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    const session: StoredSession = { signedOut: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(null);
  }, []);

  return { user, ready, login, logout };
}

export function DemoSessionProvider({
  children,
  defaultUser = DEFAULT_USER,
}: {
  children: ReactNode;
  defaultUser?: AuthUser;
}) {
  const session = useDemoSessionState(defaultUser);
  return createElement(DemoSessionContext.Provider, { value: session }, children);
}

export function useDemoSession(): DemoSession {
  const session = useContext(DemoSessionContext);
  if (!session) {
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }
  return session;
}
